import { useState, useEffect, useRef } from "react";
import {
  ResponsiveContainer, ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

// ── KaTeX (loaded via CDN in index.html) ──────────────────
function KatexSpan({ latex }) {
  const ref = useRef();
  useEffect(() => {
    if (ref.current && window.katex)
      window.katex.render(latex, ref.current, { throwOnError: false, displayMode: false });
  }, [latex]);
  return <span ref={ref} />;
}

// ── Pattern type IDs ──────────────────────────────────────
const UNKNOWN       = 0;
const ARITHMETIC    = 1;
const GEOMETRIC     = 2;
const EXPONENTIAL   = 3;
const POLYNOMIAL    = 4;
const FACTORIAL     = 5;
const RECURRENCE    = 6;
const ALTERNATING   = 7;
const EXP_OFFSET    = 8;
const PERIODIC      = 9;
const FLOOR_SEQ     = 10;
const CEIL_SEQ      = 11;
const TRIANGULAR    = 12;
const FIBONACCI     = 13;
// ── NEW ───────────────────────────────────────────────────
const QUAD_REC      = 14;   // f(n) = f(n-1)^2 + c
const RATIONAL      = 15;   // f(n) = (an+b)/(cn+d)
const PRIME         = 16;   // nth prime
const BINOMIAL      = 17;   // C(n+k, k)
const CATALAN       = 18;   // Catalan numbers
const LUCAS         = 19;   // Lucas numbers

// ── Helper math ───────────────────────────────────────────
function factorial(n) { let r=1; for(let i=2;i<=n;i++) r*=i; return r; }

function isPrime(n) {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6)
    if (n % i === 0 || n % (i+2) === 0) return false;
  return true;
}

function nthPrime(n) {
  let count = 0, num = 1;
  while (count < n) { num++; if (isPrime(num)) count++; }
  return num;
}

// Precompute first 200 Catalan numbers as floats
function catalanNum(n) {
  // C(n) = (2n)! / ((n+1)! * n!)  — use log to avoid overflow
  if (n === 0) return 1;
  let logC = 0;
  for (let i = 2; i <= 2*n; i++) logC += Math.log(i);
  for (let i = 2; i <= n+1; i++) logC -= Math.log(i);
  for (let i = 2; i <= n; i++) logC -= Math.log(i);
  return Math.round(Math.exp(logC));
}

function lucasNum(n) {
  if (n === 0) return 2;
  if (n === 1) return 1;
  let a = 2, b = 1;
  for (let i = 2; i <= n; i++) { const c = a + b; a = b; b = c; }
  return b;
}

function binomialCoeff(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let r = 1;
  for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1);
  return Math.round(r);
}

// ── Existing detectors ────────────────────────────────────
function isArithmetic(arr) {
  if (arr.length < 2) return 0;
  const diff = arr[1]-arr[0], eps = 0.0001;
  for (let i = 0; i < arr.length-1; i++)
    if (Math.abs((arr[i+1]-arr[i])-diff) > eps) return 0;
  return Math.abs(diff) < eps ? 1e-9 : diff;
}
function isGeometric(arr) {
  if (arr.length < 2 || arr[0] === 0) return 0;
  const ratio = arr[1]/arr[0], eps = 0.0001;
  for (let i = 0; i < arr.length-1; i++) {
    if (Math.abs(arr[i]) < eps) return 0;
    if (Math.abs(arr[i+1]/arr[i]-ratio) > eps) return 0;
  }
  return ratio;
}
function isExponential(arr) {
  const eps = 0.001;
  for (let i = 1; i <= 9; i++) {
    let ok = true;
    for (let k = 0; k < arr.length; k++)
      if (Math.abs(Math.pow(k+1,i)-arr[k]) > eps) { ok=false; break; }
    if (ok) return i;
  }
  return 0;
}
function buildDifferenceTable(arr) {
  const size = arr.length;
  const table = Array.from({length:size}, () => new Array(size).fill(0));
  for (let i = 0; i < size; i++) table[0][i] = arr[i];
  const eps = 0.0001; let degree = 0;
  for (let level = 1; level < size; level++) {
    for (let i = 0; i < size-level; i++)
      table[level][i] = table[level-1][i+1] - table[level-1][i];
    let constant = true;
    for (let i = 0; i < size-level-1; i++)
      if (Math.abs(table[level][i]-table[level][i+1]) > eps) { constant=false; break; }
    if (constant) { degree=level; break; }
  }
  return { table, degree };
}
function isFactorial(arr) {
  if (arr.length < 2) return null;
  const eps = 0.001, C = arr[0]-factorial(1);
  for (let i = 0; i < arr.length; i++)
    if (Math.abs(factorial(i+1)+C-arr[i]) > eps) return null;
  return C;
}
function isRecurrence(arr) {
  if (arr.length < 4) return null;
  const eps = 0.001, [a0,a1,a2,a3] = arr;
  const det = a1*a1 - a0*a2;
  if (Math.abs(det) < eps) return null;
  const A = (a2*a1-a3*a0)/det, B = (a3*a1-a2*a2)/det;
  for (let i = 2; i < arr.length; i++)
    if (Math.abs(A*arr[i-1]+B*arr[i-2]-arr[i]) > eps) return null;
  return { A, B };
}
function isAlternating(arr) {
  if (arr.length < 6) return null;  // need ≥3 terms per sub-sequence to be reliable
  const odd = arr.filter((_,i) => i%2===0), even = arr.filter((_,i) => i%2===1);
  if (odd.length < 3 || even.length < 3) return null;
  const dOdd = isArithmetic(odd), dEven = isArithmetic(even);
  if (dOdd !== 0 && dEven !== 0) return { dOdd, dEven };
  return null;
}
function isExponentialOffset(arr) {
  if (arr.length < 4) return null;
  const eps = 0.01, bases = [2,3,0.5,0.25,1/3,-1,-2,4,0.1];
  for (const rb of bases) {
    if (Math.abs(rb-1) < 1e-6) continue;
    const Ab = (arr[1]-arr[0])/(rb-1), Cb = arr[0]-Ab;
    let ok = true;
    for (let i = 0; i < arr.length; i++)
      if (Math.abs(Ab*Math.pow(rb,i)+Cb-arr[i]) > eps) { ok=false; break; }
    if (ok) return { A:Ab, r:rb, C:Cb };
  }
  return null;
}
function isPeriodic(arr) {
  if (arr.length < 4) return null;
  const eps = 0.0001;
  for (let k = 2; k <= 8 && k <= arr.length/2; k++) {
    let ok = true;
    for (let i = 0; i+k < arr.length; i++)
      if (Math.abs(arr[i]-arr[i+k]) > eps) { ok=false; break; }
    if (ok) return k;
  }
  return null;
}
function isTriangular(arr) {
  if (arr.length < 3) return null;
  const eps = 0.001;
  for (let i = 0; i < arr.length-2; i++) {
    const d2 = (arr[i+2]-arr[i+1])-(arr[i+1]-arr[i]);
    if (Math.abs(d2-1) > eps) return null;
  }
  return arr[0]-1;
}
function isFibonacci(arr) {
  if (arr.length < 4) return false;
  const eps = 0.001;
  for (let i = 2; i < arr.length; i++)
    if (Math.abs(arr[i-1]+arr[i-2]-arr[i]) > eps) return false;
  return true;
}
function isFloorPattern(arr) {
  if (arr.length < 3) return null;
  const eps2 = 0.4999;
  for (let p=1;p<=12;p++) for (let q=1;q<=12;q++) for (const s of [1,-1]) {
    const Ab=s*p/q, baseB=arr[0]-Ab;
    for (const off of [0,.1,.2,.3,.4,-.1,-.2,-.3,-.4,.5,-.5]) {
      const Bb=baseB+off; let ok=true;
      for (let i=0;i<arr.length;i++)
        if (Math.abs(Math.floor(Ab*(i+1)+Bb)-arr[i]) > eps2) { ok=false; break; }
      if (ok) return { A:Ab, B:Bb };
    }
  }
  return null;
}
function isCeilPattern(arr) {
  if (arr.length < 3) return null;
  const eps2 = 0.4999;
  for (let p=1;p<=12;p++) for (let q=1;q<=12;q++) for (const s of [1,-1]) {
    const Ab=s*p/q, baseB=arr[0]-Ab;
    for (const off of [0,.1,.2,.3,.4,-.1,-.2,-.3,-.4,.5,-.5]) {
      const Bb=baseB+off; let ok=true;
      for (let i=0;i<arr.length;i++)
        if (Math.abs(Math.ceil(Ab*(i+1)+Bb)-arr[i]) > eps2) { ok=false; break; }
      if (ok) return { A:Ab, B:Bb };
    }
  }
  return null;
}

// ── NEW detectors ─────────────────────────────────────────

// 1. Quadratic recurrence: f(n) = f(n-1)^2 + c
function isQuadraticRecurrence(arr) {
  if (arr.length < 3) return null;
  const eps = 0.01;
  // Infer c from first two terms: c = arr[1] - arr[0]^2
  const c = arr[1] - arr[0] * arr[0];
  for (let i = 1; i < arr.length; i++) {
    const expected = arr[i-1] * arr[i-1] + c;
    if (Math.abs(expected - arr[i]) > eps * (1 + Math.abs(arr[i]))) return null;
  }
  return { seed: arr[0], c };
}

// 2. Rational sequence: f(n) = (an + b) / (cn + d)
//    Try a,b,c,d in small integers — check all n
function isRational(arr) {
  if (arr.length < 4) return null;
  const eps = 0.001;
  const range = [-4,-3,-2,-1,0,1,2,3,4];
  for (const a of range) for (const b of range)
  for (const c of range) for (const d of range) {
    if (c === 0 && d === 0) continue; // denom = 0 always
    let ok = true;
    for (let i = 0; i < arr.length; i++) {
      const n = i + 1;
      const denom = c*n + d;
      if (Math.abs(denom) < 1e-9) { ok=false; break; }
      if (Math.abs((a*n + b)/denom - arr[i]) > eps) { ok=false; break; }
    }
    if (ok) {
      // Skip trivial (constant → arithmetic already caught) and pure polynomial
      if (c === 0) continue; // reduces to linear/constant
      return { a, b, c, d };
    }
  }
  return null;
}

// 3. Prime sequence: arr[i] ≈ p(n0 + i)
function isPrimeSequence(arr) {
  if (arr.length < 4) return null;
  const eps = 0.5; // primes are integers
  // All values must be positive integers
  if (!arr.every(x => x > 1 && Math.abs(x - Math.round(x)) < eps)) return null;
  const intArr = arr.map(x => Math.round(x));
  // Check every element is prime
  if (!intArr.every(isPrime)) return null;
  // Check they are consecutive primes
  const startN = (() => {
    let count = 0, num = 1;
    while (num < intArr[0]) { num++; if (isPrime(num)) count++; }
    return count; // 1-based index of intArr[0] in the primes
  })();
  for (let i = 0; i < intArr.length; i++)
    if (nthPrime(startN + i) !== intArr[i]) return null;
  return { startN };
}

// 4. Binomial coefficient: arr[i] = C(n+k, k) for some fixed k, n = i+1
function isBinomialSequence(arr) {
  if (arr.length < 3) return null;
  const eps = 0.5;
  for (let k = 1; k <= 6; k++) {
    // offset: try arr[i] = C(i+1+offset, k)
    for (let offset = 0; offset <= 4; offset++) {
      let ok = true;
      for (let i = 0; i < arr.length; i++) {
        const expected = binomialCoeff(i+1+offset, k);
        if (Math.abs(expected - arr[i]) > eps) { ok=false; break; }
      }
      if (ok) return { k, offset };
    }
  }
  return null;
}

// 5. Catalan numbers: arr[i] ≈ C(i + offset)
function isCatalanSequence(arr) {
  if (arr.length < 4) return null;
  const eps = 0.5;
  for (let offset = 0; offset <= 3; offset++) {
    let ok = true;
    for (let i = 0; i < arr.length; i++) {
      if (Math.abs(catalanNum(i + offset) - arr[i]) > eps) { ok=false; break; }
    }
    if (ok) return { offset };
  }
  return null;
}

// 6. Lucas numbers: arr[i] ≈ L(i + offset)
function isLucasSequence(arr) {
  if (arr.length < 4) return null;
  const eps = 0.5;
  for (let offset = 0; offset <= 4; offset++) {
    let ok = true;
    for (let i = 0; i < arr.length; i++) {
      if (Math.abs(lucasNum(i + offset) - arr[i]) > eps) { ok=false; break; }
    }
    if (ok) return { offset };
  }
  return null;
}


// ── Pattern detector ──────────────────────────────────────
function detectPattern(arr) {
  let best = { type:UNKNOWN, complexity:9999, params:{} };
  const pick = (p) => { if (p.complexity < best.complexity) best = p; };

  const arith = isArithmetic(arr);
  if (arith !== 0) pick({type:ARITHMETIC, complexity:1, params:{diff:Math.abs(arith)<1e-8?0:arith, a1:arr[0]}});

  const tri = isTriangular(arr);
  if (tri !== null) pick({type:TRIANGULAR, complexity:3, params:{C:tri}});

  const geo = isGeometric(arr);
  if (geo !== 0) pick({type:GEOMETRIC, complexity:2, params:{ratio:geo, a1:arr[0]}});

  const alt = isAlternating(arr);
  if (alt) pick({type:ALTERNATING, complexity:3, params:{dOdd:alt.dOdd, dEven:alt.dEven, oddStart:arr[0], evenStart:arr.length>1?arr[1]:0}});

  const expOff = isExponentialOffset(arr);
  if (expOff) pick({type:EXP_OFFSET, complexity:4, params:expOff});

  const expo = isExponential(arr);
  if (expo) pick({type:EXPONENTIAL, complexity:2, params:{k:expo}});

  const { table, degree } = buildDifferenceTable(arr);
  // Require at least degree+2 points — otherwise it's just interpolation, not pattern detection
  if (degree > 0 && arr.length >= degree + 2) pick({type:POLYNOMIAL, complexity:6+degree, params:{degree, table}});

  if (isFibonacci(arr)) pick({type:FIBONACCI, complexity:7, params:{a0:arr[0], a1:arr[1]}});

  const factC = isFactorial(arr);
  if (factC !== null) pick({type:FACTORIAL, complexity:8, params:{C:factC}});

  const period = isPeriodic(arr);
  if (period) pick({type:PERIODIC, complexity:9, params:{period, cycle:arr.slice(0,period)}});

  const rec = isRecurrence(arr);
  if (rec) pick({type:RECURRENCE, complexity:10, params:rec});

  const flr = isFloorPattern(arr);
  if (flr) pick({type:FLOOR_SEQ, complexity:4, params:flr});

  const cl = isCeilPattern(arr);
  if (cl) pick({type:CEIL_SEQ, complexity:4, params:cl});

  // NEW
  const lucas = isLucasSequence(arr);
  if (lucas) pick({type:LUCAS, complexity:6, params:lucas});

  const catalan = isCatalanSequence(arr);
  if (catalan) pick({type:CATALAN, complexity:6, params:catalan});

  const binom = isBinomialSequence(arr);
  if (binom) pick({type:BINOMIAL, complexity:5, params:binom});

  const primes = isPrimeSequence(arr);
  if (primes) pick({type:PRIME, complexity:7, params:primes});

  const qrec = isQuadraticRecurrence(arr);
  if (qrec) pick({type:QUAD_REC, complexity:5, params:qrec});

  const rat = isRational(arr);
  if (rat) pick({type:RATIONAL, complexity:2, params:rat});

  return { best, table, degree };
}

// ── predictTerm ───────────────────────────────────────────
function predictTerm(best, n, arr) {
  const p = best.params;
  switch (best.type) {
    case ARITHMETIC:  return p.a1 + (n-1)*p.diff;
    case GEOMETRIC:   return p.a1 * Math.pow(p.ratio, n-1);
    case EXPONENTIAL: return Math.pow(n, p.k);
    case EXP_OFFSET:  return p.A * Math.pow(p.r, n-1) + p.C;
    case FACTORIAL:   return factorial(n) + p.C;
    case TRIANGULAR:  return n*(n+1)/2 + p.C;
    case FLOOR_SEQ:   return Math.floor(p.A*n + p.B);
    case CEIL_SEQ:    return Math.ceil(p.A*n + p.B);
    case PERIODIC:    return p.cycle[(n-1) % p.period];
    case FIBONACCI: {
      let a=p.a0, b=p.a1;
      if (n===1) return a; if (n===2) return b;
      for (let i=2; i<n; i++) { const c=a+b; a=b; b=c; }
      return b;
    }
    case RECURRENCE: {
      const ext = [...arr];
      while (ext.length < n) ext.push(p.A*ext[ext.length-1] + p.B*ext[ext.length-2]);
      return ext[n-1];
    }
    case ALTERNATING: {
      if (n%2===1) { const k=(n+1)/2; return p.oddStart+(k-1)*p.dOdd; }
      else         { const k=n/2;     return p.evenStart+(k-1)*p.dEven; }
    }
    case POLYNOMIAL: {
      const { table, degree } = p;
      let result=0, binom=1; const nn=n-1;
      for (let k=0; k<=degree; k++) { result+=binom*table[k][0]; binom*=(nn-k)/(k+1); }
      return result;
    }
    // NEW
    case QUAD_REC: {
      let v = p.seed;
      for (let i=1; i<n; i++) v = v*v + p.c;
      return v;
    }
    case RATIONAL: return (p.a*n + p.b) / (p.c*n + p.d);
    case PRIME:    return nthPrime(p.startN + n - 1);
    case BINOMIAL: return binomialCoeff(n + p.offset, p.k);
    case CATALAN:  return catalanNum(n - 1 + p.offset);
    case LUCAS:    return lucasNum(n - 1 + p.offset);
    default: return 0;
  }
}

// ── Poly helpers ──────────────────────────────────────────
function buildPolyCoeffs(table, degree) {
  const fc = new Array(degree+1).fill(0);
  function mp(a,dA,b,dB) {
    const r=new Array(dA+dB+1).fill(0);
    for(let i=0;i<=dA;i++) for(let j=0;j<=dB;j++) r[i+j]+=a[i]*b[j];
    return r;
  }
  for (let i=0; i<=degree; i++) {
    let term=[1], td=0;
    for (let j=0; j<i; j++) { term=mp(term,td,[-(j+1),1],1); td++; }
    const coef = table[i][0]/factorial(i);
    for (let k=0; k<=td; k++) fc[k] += coef*term[k];
  }
  return fc;
}
// latexCoeff kept for any legacy callers but no longer used in formulaLatex
function latexCoeff(c, first) {
  const varStr = "";
  const t = c >= 0
    ? (first ? numLatex(c) : `+ ${numLatex(c)}`)
    : (first ? `-${numLatex(Math.abs(c))}` : `- ${numLatex(Math.abs(c))}`);
  return t;
}

function gcd(a, b) {
  a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b));
  while (b) { const t = b; b = a % b; a = t; }
  return a || 1;
}

// Render a coefficient * variable term, handling 1, -1, 0 cleanly.
// e.g. coeffTerm(1, "n") → "n", coeffTerm(-1,"n") → "-n", coeffTerm(2,"n²") → "2n²"
// `first` = whether this is the first term in the sum (controls sign display)
function coeffTerm(c, varStr, first) {
  const eps = 1e-9;
  if (Math.abs(c) < eps) return null; // zero — skip
  const abs = Math.abs(c);
  const sign = c < 0 ? "-" : "+";
  const absLatex = numLatex(abs); // always positive input to numLatex now
  const termBody = Math.abs(abs - 1) < eps ? varStr : `${absLatex}${varStr}`;
  if (first) return c < 0 ? `-${termBody}` : termBody;
  return `${sign} ${termBody}`;
}

// Render a constant term (no variable).
function constTerm(c, first) {
  const eps = 1e-9;
  if (Math.abs(c) < eps) return null;
  const abs = Math.abs(c);
  const sign = c < 0 ? "-" : "+";
  const absLatex = numLatex(abs);
  if (first) return c < 0 ? `-${absLatex}` : absLatex;
  return `${sign} ${absLatex}`;
}

// Build a linear expression string: an + b (for use in num/den of rational, floor, ceil, etc.)
// Returns LaTeX. Handles coefficient simplification.
function linearExpr(a, b) {
  const eps = 1e-9;
  const parts = [];
  const nTerm = coeffTerm(a, "n", parts.length === 0);
  if (nTerm !== null) parts.push(nTerm);
  const bTerm = constTerm(b, parts.length === 0);
  if (bTerm !== null) parts.push(bTerm);
  if (parts.length === 0) return "0";
  return parts.join(" ");
}

// ── KaTeX formula strings ─────────────────────────────────
function formulaLatex(best, arr) {
  const p = best.params;

  switch (best.type) {
    case ARITHMETIC: {
      if (Math.abs(p.diff) < 1e-8) return `f(n) = ${numLatex(arr[0])}`;
      const intercept = p.a1 - p.diff;
      const nPart = coeffTerm(p.diff, "n", true);
      if (Math.abs(intercept) < 1e-9) return `f(n) = ${nPart}`;
      const cPart = constTerm(intercept, false);
      return `f(n) = ${nPart} ${cPart}`;
    }
    case GEOMETRIC: {
      const a1Part = Math.abs(p.a1 - 1) < 1e-9 ? "" : `${numLatex(p.a1)} \\cdot `;
      return `f(n) = ${a1Part}${numLatex(p.ratio)}^{n-1}`;
    }
    case EXPONENTIAL:
      return `f(n) = n^{${p.k}}`;
    case EXP_OFFSET: {
      const aPart = Math.abs(p.A - 1) < 1e-9 ? "" : `${numLatex(p.A)} \\cdot `;
      const cPart = constTerm(p.C, false);
      return `f(n) = ${aPart}${numLatex(p.r)}^{n-1}${cPart ? ` ${cPart}` : ""}`;
    }
    case FACTORIAL:
      if (Math.abs(p.C) < 1e-9) return `f(n) = n!`;
      return `f(n) = n! ${constTerm(p.C, false)}`;
    case TRIANGULAR:
      if (Math.abs(p.C) < 1e-9) return `f(n) = \\dfrac{n(n+1)}{2}`;
      return `f(n) = \\dfrac{n(n+1)}{2} ${constTerm(p.C, false)}`;
    case RECURRENCE: {
      const aPart = Math.abs(p.A - 1) < 1e-9 ? "" : `${numLatex(p.A)} \\cdot `;
      const bAbs  = Math.abs(p.B);
      const bSign = p.B >= 0 ? "+" : "-";
      const bPart = Math.abs(bAbs - 1) < 1e-9 ? `f(n{-}2)` : `${numLatex(bAbs)} \\cdot f(n{-}2)`;
      return `f(n) = ${aPart}f(n{-}1) ${bSign} ${bPart}`;
    }
    case FIBONACCI:
      return `f(n) = f(n{-}1) + f(n{-}2)`;
    case ALTERNATING:
      return [
        `\\text{odd: } ${linearExpr(p.dOdd / 2, p.oddStart - p.dOdd / 2)}`,
        `\\quad \\text{even: } ${linearExpr(p.dEven / 2, p.evenStart - p.dEven / 2)}`
      ].join("");
    case PERIODIC:
      return `\\text{period } ${p.period}: [${p.cycle.map(numLatex).join(",\\,")}]`;
    case FLOOR_SEQ: {
      const expr = linearExpr(p.A, p.B);
      return `f(n) = \\lfloor ${expr} \\rfloor`;
    }
    case CEIL_SEQ: {
      const expr = linearExpr(p.A, p.B);
      return `f(n) = \\lceil ${expr} \\rceil`;
    }
    case POLYNOMIAL: {
      const fc = buildPolyCoeffs(p.table, p.degree);
      let parts = [];
      for (let i = p.degree; i >= 0; i--) {
        if (Math.abs(fc[i]) < 1e-9) continue;
        const varStr = i === 0 ? "" : i === 1 ? "n" : `n^{${i}}`;
        const term = i === 0
          ? constTerm(fc[i], parts.length === 0)
          : coeffTerm(fc[i], varStr, parts.length === 0);
        if (term !== null) parts.push(term);
      }
      return `f(n) = ${parts.join(" ")}`;
    }
    case QUAD_REC: {
      const cPart = constTerm(p.c, false);
      return `f(n) = f(n{-}1)^2${cPart ? ` ${cPart}` : ""}, \\quad f(1) = ${numLatex(p.seed)}`;
    }
    case RATIONAL: {
      // 1. Reduce a,b,c,d by their GCD so e.g. (-4,-4,-4,-4) → (1,1,1,1)
      let { a, b, c, d } = p;
      const g = gcd(gcd(Math.abs(a), Math.abs(b)), gcd(Math.abs(c), Math.abs(d))) || 1;
      a = Math.round(a / g); b = Math.round(b / g);
      c = Math.round(c / g); d = Math.round(d / g);
      // 2. Canonicalise sign: if leading denominator coeff is negative, flip all signs
      const denLead = c !== 0 ? c : d;
      if (denLead < 0) { a=-a; b=-b; c=-c; d=-d; }
      const numStr = linearExpr(a, b);
      const denStr = linearExpr(c, d);
      return `f(n) = \\dfrac{${numStr}}{${denStr}}`;
    }
    case PRIME:
      return `f(n) = p_n \\quad \\text{(}n\\text{-th prime)}`;
    case BINOMIAL:
      return p.offset === 0
        ? `f(n) = \\dbinom{n}{${p.k}}`
        : `f(n) = \\dbinom{n + ${p.offset}}{${p.k}}`;
    case CATALAN:
      return p.offset === 0
        ? `f(n) = C_{n-1} = \\dfrac{1}{n}\\dbinom{2(n-1)}{n-1}`
        : `f(n) = C_{n + ${p.offset - 1}}`;
    case LUCAS:
      return `f(n) = L_{n - 1} \\quad \\text{(Lucas numbers)}`;
    default:
      return `\\text{No pattern detected}`;
  }
}

// ── Pattern type names ────────────────────────────────────
const TYPE_NAMES = {
  [UNKNOWN]:    "Unknown",
  [ARITHMETIC]: "Arithmetic Sequence",
  [GEOMETRIC]:  "Geometric Sequence",
  [EXPONENTIAL]:"Power Sequence (nᵏ)",
  [POLYNOMIAL]: "Polynomial Sequence",
  [FACTORIAL]:  "Factorial Sequence",
  [RECURRENCE]: "Linear Recurrence (order 2)",
  [ALTERNATING]:"Alternating Arithmetic",
  [EXP_OFFSET]: "Exponential with Offset",
  [PERIODIC]:   "Periodic Sequence",
  [FLOOR_SEQ]:  "Floor Sequence",
  [CEIL_SEQ]:   "Ceiling Sequence",
  [TRIANGULAR]: "Triangular Numbers",
  [FIBONACCI]:  "Fibonacci-like",
  [QUAD_REC]:   "Quadratic Recurrence",
  [RATIONAL]:   "Rational Sequence",
  [PRIME]:      "Prime Numbers",
  [BINOMIAL]:   "Binomial Coefficients",
  [CATALAN]:    "Catalan Numbers",
  [LUCAS]:      "Lucas Numbers",
};

const EXAMPLES = [
  "2, 4, 6, 8, 10",
  "3, 6, 12, 24, 48",
  "1, 4, 9, 16, 25",
  "1, 1, 2, 3, 5, 8",
  "1, 3, 6, 10, 15",
  "2, 3, 5, 7, 11",
  "1, 2, 5, 14, 42",
  "2, 1, 3, 4, 7, 11",
  "1/2, 2/3, 3/4, 4/5",
];

// ── Fraction utilities ────────────────────────────────────

// Continued-fraction algorithm: returns {p, q} such that p/q ≈ x
// with the smallest denominator within `tol`, capped at maxDen.
function toFraction(x, tol = 1e-9, maxDen = 1000) {
  if (!isFinite(x)) return { p: x, q: 1 };

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  const whole = Math.floor(x);
  const frac  = x - whole;

  if (frac < tol) return { p: sign * whole, q: 1 };       // integer
  if (1 - frac < tol) return { p: sign * (whole + 1), q: 1 };

  // Stern-Brocot / mediant search
  let lo_p = 0, lo_q = 1;
  let hi_p = 1, hi_q = 1;
  let p = 1,    q = 2;

  for (let iter = 0; iter < 200; iter++) {
    const med_p = lo_p + hi_p;
    const med_q = lo_q + hi_q;
    if (med_q > maxDen) break;
    p = med_p; q = med_q;
    const val = med_p / med_q;
    if (Math.abs(val - frac) < tol) break;
    if (val < frac) { lo_p = med_p; lo_q = med_q; }
    else            { hi_p = med_p; hi_q = med_q; }
  }

  // Combine with whole part
  const totalP = sign * (whole * q + p);
  return { p: totalP, q };
}

// Returns a plain string like "3/4" or "5" — used where HTML not available (chart axis)
function fmtNum(x) {
  const v = +parseFloat(x);
  if (isNaN(v)) return "?";
  if (Number.isInteger(v) || Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
  const { p, q } = toFraction(v);
  if (q === 1) return String(p);
  // Only show as fraction if denominator is reasonable
  if (q <= 100) return `${p}/${q}`;
  return (+v.toFixed(6)).toString();
}

// Returns a LaTeX string for a number: \frac{p}{q} or plain integer.
// Always call with the actual value (including sign) — sign is handled here.
function numLatex(x) {
  const v = +parseFloat(x);
  if (isNaN(v)) return "?";
  if (!isFinite(v)) return v > 0 ? "\\infty" : "-\\infty";
  if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
  const { p, q } = toFraction(v);
  if (q === 1) return String(p);
  if (q <= 100) {
    // Always render as -\dfrac{|p|}{q} so sign is never inside the fraction bar
    const sign = p < 0 ? "-" : "";
    return `${sign}\\dfrac{${Math.abs(p)}}{${q}}`;
  }
  return (+v.toFixed(6)).toString();
}

// React component: renders a value as KaTeX fraction inline
function FracVal({ value, color }) {
  const ref = useRef();
  const latex = numLatex(value);
  useEffect(() => {
    if (ref.current && window.katex) {
      window.katex.render(latex, ref.current, { throwOnError: false, displayMode: false });
    } else if (ref.current) {
      ref.current.textContent = fmtNum(value);
    }
  }, [latex]);
  return (
    <span
      ref={ref}
      style={color ? { color } : undefined}
    />
  );
}

// ── Custom tooltip ────────────────────────────────────────
function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const pt = payload[0].payload;
  const color = pt.predicted ? "#2980b9" : "#c0392b";
  return (
    <div style={{
      background:"#fff", border:"1px solid #f0eae6", borderRadius:3,
      padding:"6px 10px", fontFamily:"'Source Serif 4',serif", fontSize:".82rem", color:"#333"
    }}>
      <div style={{color:"#999", fontSize:".65rem", marginBottom:2}}>n = {pt.n}</div>
      <div style={{display:"flex", alignItems:"center", gap:4}}>
        f(n) = <FracVal value={pt.value} color={color} />
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────
export default function App() {
  const [input,      setInput]      = useState("");
  const [result,     setResult]     = useState(null);
  const [error,      setError]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [predictN,   setPredictN]   = useState(5);
  const [predicted,  setPredicted]  = useState(null);
  const [targetIdx,  setTargetIdx]  = useState("");
  const [idxResult,  setIdxResult]  = useState(null);
  const [showDiff,   setShowDiff]   = useState(false);
  const [katexReady, setKatexReady] = useState(false);

  useEffect(() => {
    if (window.katex) { setKatexReady(true); return; }
    const check = setInterval(() => {
      if (window.katex) { setKatexReady(true); clearInterval(check); }
    }, 100);
    return () => clearInterval(check);
  }, []);

  function parseInput(raw) {
    return raw.trim().split(/[\s,]+/).map(tok => {
      if (tok.includes('/')) { const [n,d]=tok.split('/'); return d&&+d!==0?+n/+d:0; }
      return parseFloat(tok);
    }).filter(x => !isNaN(x));
  }

  function handleDetect() {
    setError(""); setResult(null); setPredicted(null); setIdxResult(null); setShowDiff(false);
    const arr = parseInput(input);
    if (arr.length < 2) { setError("Please enter at least 2 numbers."); return; }
    setLoading(true);
    setTimeout(() => {
      const { best, table, degree } = detectPattern(arr);
      setResult({ best, arr, table, degree });
      setLoading(false);
    }, 280);
  }

  function handlePredict() {
    if (!result) return;
    const { best, arr } = result;
    setPredicted(Array.from({ length: predictN }, (_, i) => ({
      n: arr.length+1+i, val: predictTerm(best, arr.length+1+i, arr)
    })));
  }

  function handleIndex() {
    if (!result || !targetIdx) return;
    const idx = parseInt(targetIdx);
    if (isNaN(idx) || idx < 1) return;
    setIdxResult({ idx, val: predictTerm(result.best, idx, result.arr) });
  }

  const origData = result
    ? result.arr.map((v,i) => ({ n:i+1, value:v, predicted:false }))
    : [];
  const predData = predicted
    ? predicted.map(({ n, val }) => ({ n, value:val, predicted:true }))
    : [];

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600&family=Source+Sans+3:wght@300;400;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#fff;color:#1a1a1a;font-family:'Source Sans 3',sans-serif;}
        .app{max-width:720px;margin:0 auto;padding:0 1.5rem 5rem;}

        .header{text-align:center;padding:4.5rem 0 2.5rem;}
        .logo{font-family:'Source Serif 4',serif;font-size:2.2rem;font-weight:300;color:#c0392b;margin-bottom:.3rem;}
        .logo b{font-weight:600;}
        .tagline{font-size:.82rem;color:#999;}

        .search-wrap{margin:1.75rem 0 .65rem;position:relative;}
        .search-input{
          width:100%;font-family:'Source Sans 3',sans-serif;font-size:1rem;font-weight:300;
          color:#1a1a1a;background:#fff;border:2px solid #e8b090;border-radius:4px;
          padding:.8rem 3.2rem .8rem 1rem;outline:none;transition:border .15s,box-shadow .15s;
        }
        .search-input:focus{border-color:#c0392b;box-shadow:0 0 0 3px rgba(192,57,43,.07);}
        .search-input::placeholder{color:#c8c8c8;font-style:italic;}
        .search-btn{
          position:absolute;right:0;top:0;bottom:0;width:3rem;
          background:none;border:none;cursor:pointer;color:#c0392b;
          display:flex;align-items:center;justify-content:center;
        }
        .search-btn:hover{opacity:.65;}

        .examples-row{display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:2rem;align-items:center;}
        .ex-label{font-size:.72rem;color:#bbb;margin-right:.1rem;}
        .ex-chip{
          font-size:.72rem;color:#c0392b;background:none;
          border:1px solid #f0c8b8;border-radius:2px;padding:.18rem .5rem;
          cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .1s;
        }
        .ex-chip:hover{background:#fdf4f2;border-color:#c0392b;}

        .error{color:#c0392b;font-size:.8rem;margin-bottom:.75rem;}

        .loading-line{height:2px;background:#f7eeeb;margin-bottom:2rem;position:relative;overflow:hidden;}
        .loading-line::after{content:'';position:absolute;left:-35%;width:35%;height:100%;background:#c0392b;animation:sweep .65s linear infinite;}
        @keyframes sweep{to{left:110%;}}

        .result{animation:fadeUp .28s ease;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}

        .result-type{font-size:.67rem;letter-spacing:.13em;text-transform:uppercase;color:#c0392b;font-weight:600;margin-bottom:.5rem;}

        .formula-box{
          margin-bottom:1.25rem;padding:.65rem .9rem;
          background:#fdf8f6;border-left:3px solid #e8b090;
          border-radius:0 3px 3px 0;font-size:1.05rem;overflow-x:auto;
        }
        .formula-box .katex{font-size:1.15rem;}

        .seq-row{display:flex;flex-wrap:wrap;border:1px solid #f0eae6;border-radius:3px;overflow:hidden;margin-bottom:1.4rem;}
        .seq-cell{display:flex;flex-direction:column;align-items:center;padding:.45rem .7rem;border-right:1px solid #f0eae6;min-width:50px;}
        .seq-cell:last-child{border-right:none;}
        .seq-val{font-family:'Source Serif 4',serif;font-size:.9rem;color:#222;}
        .seq-idx{font-size:.58rem;color:#ccc;margin-top:.12rem;}
        .seq-ellipsis{padding:.45rem .5rem;align-self:center;color:#ccc;font-size:.85rem;}

        hr.div{border:none;border-top:1px solid #f0eae6;margin:1.2rem 0;}

        .diff-toggle{background:none;border:none;font-size:.73rem;color:#c0392b;cursor:pointer;font-family:'Source Sans 3',sans-serif;padding:0;margin-bottom:.6rem;text-decoration:underline;text-underline-offset:2px;}
        .diff-table-wrap{overflow-x:auto;margin-bottom:.75rem;}
        .diff-table{border-collapse:collapse;font-size:.75rem;font-family:'Source Serif 4',serif;}
        .diff-table td{padding:.28rem .6rem;border:1px solid #f0eae6;text-align:right;min-width:46px;color:#444;}
        .diff-table tr:first-child td{color:#c0392b;}
        .diff-table .rl{color:#ccc;font-family:'Source Sans 3',sans-serif;font-size:.62rem;text-align:left;}

        .chart-section{margin-bottom:1rem;}
        .chart-label{font-size:.67rem;letter-spacing:.12em;text-transform:uppercase;color:#bbb;font-weight:600;margin-bottom:.75rem;}
        .chart-wrap{width:100%;height:260px;}
        .recharts-legend-item-text{font-family:'Source Sans 3',sans-serif;font-size:.75rem;}

        .sec-head{font-size:.67rem;letter-spacing:.12em;text-transform:uppercase;color:#bbb;font-weight:600;margin-bottom:.7rem;}
        .ctrl-row{display:flex;align-items:center;gap:.65rem;flex-wrap:wrap;margin-bottom:.9rem;}
        .ctrl-row label{font-size:.83rem;color:#555;}
        .num-input{width:64px;font-family:'Source Serif 4',serif;font-size:.9rem;border:1px solid #ddd;border-radius:3px;padding:.32rem .45rem;color:#1a1a1a;outline:none;text-align:center;}
        .num-input:focus{border-color:#c0392b;}
        .go-btn{font-family:'Source Sans 3',sans-serif;font-size:.75rem;font-weight:600;letter-spacing:.04em;padding:.34rem .85rem;background:#c0392b;color:#fff;border:none;border-radius:3px;cursor:pointer;transition:background .1s;}
        .go-btn:hover{background:#a93226;}

        .pred-row{display:flex;flex-wrap:wrap;border:1px solid #ddeef8;border-radius:3px;overflow:hidden;margin-bottom:1.4rem;}
        .pred-cell{display:flex;flex-direction:column;align-items:center;padding:.45rem .7rem;border-right:1px solid #ddeef8;min-width:56px;animation:fadeUp .2s ease backwards;}
        .pred-cell:last-child{border-right:none;}
        .pred-val{font-family:'Source Serif 4',serif;font-size:.9rem;color:#2980b9;}
        .pred-idx{font-size:.58rem;color:#ccc;margin-top:.12rem;}

        .idx-answer{font-family:'Source Serif 4',serif;font-size:1.05rem;color:#111;padding:.55rem .85rem;background:#fdf6f4;border-left:3px solid #c0392b;border-radius:0 3px 3px 0;margin-top:.25rem;}
        .idx-answer span{color:#c0392b;}
      `}</style>

      <div className="header">
        <div className="logo">Sequence<b>Detector</b></div>
        <div className="tagline">Identify patterns in number sequences</div>
      </div>

      <div className="search-wrap">
        <input className="search-input" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleDetect()}
          placeholder="e.g.  2, 4, 8, 16   or   2, 3, 5, 7, 11   or   1, 4, 9, 16, 5, 6, 7"
        />
        <button className="search-btn" onClick={handleDetect}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="examples-row">
        <span className="ex-label">Examples:</span>
        {EXAMPLES.map(s => (
          <button key={s} className="ex-chip"
            onClick={() => { setInput(s); setResult(null); setPredicted(null); setIdxResult(null); }}>
            {s}
          </button>
        ))}
      </div>

      {loading && <div className="loading-line" />}

      {result && (
        <div className="result">

          <div className="result-type">{TYPE_NAMES[result.best.type]}</div>

          {/* KaTeX formula */}
          <div className="formula-box">
            {katexReady
              ? <KatexSpan latex={formulaLatex(result.best, result.arr)} />
              : <span style={{fontFamily:"serif"}}>{formulaLatex(result.best, result.arr)}</span>
            }
          </div>

          {/* Sequence tiles */}
          <div className="seq-row">
            {result.arr.slice(0,12).map((v,i) => (
              <div key={i} className="seq-cell">
                <div className="seq-val"><FracVal value={v} /></div>
                <div className="seq-idx">n={i+1}</div>
              </div>
            ))}
            {result.arr.length > 12 && <div className="seq-ellipsis">…</div>}
          </div>

          {/* Difference table (polynomial only) */}
          {result.best.type === POLYNOMIAL && (
            <>
              <button className="diff-toggle" onClick={() => setShowDiff(v => !v)}>
                {showDiff ? "Hide" : "Show"} difference table
              </button>
              {showDiff && (
                <div className="diff-table-wrap">
                  <table className="diff-table"><tbody>
                    {Array.from({ length: result.degree+1 }, (_,lvl) => (
                      <tr key={lvl}>
                        <td className="rl">Δ{lvl}</td>
                        {Array.from({ length: result.arr.length-lvl }, (_,i) => (
                          <td key={i}><FracVal value={result.table[lvl][i]} /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody></table>
                </div>
              )}
            </>
          )}

          <hr className="div" />

          {/* Chart */}
          <div className="chart-section">
            <div className="chart-label">Plot — n vs f(n)</div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart margin={{ top:8, right:16, bottom:8, left:8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0eae6" />
                  <XAxis dataKey="n" type="number" domain={["auto","auto"]}
                    tick={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:11, fill:"#aaa" }}
                    label={{ value:"n", position:"insideBottomRight", offset:-4, fill:"#bbb", fontSize:11 }}
                  />
                  <YAxis
                    tick={{ fontFamily:"'Source Sans 3',sans-serif", fontSize:11, fill:"#aaa" }}
                    label={{ value:"f(n)", angle:-90, position:"insideLeft", offset:8, fill:"#bbb", fontSize:11 }}
                    width={52}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" align="right" height={28}
                    formatter={val => <span style={{fontSize:".75rem",color:"#666"}}>{val}</span>}
                  />
                  <Line data={origData} dataKey="value" name="Original"
                    type="monotone" stroke="#c0392b" strokeWidth={1.5}
                    dot={{ fill:"#c0392b", r:4, strokeWidth:0 }}
                    activeDot={{ r:5 }} legendType="circle"
                  />
                  {predData.length > 0 && (
                    <Line
                      data={[
                        { n:origData[origData.length-1].n, value:origData[origData.length-1].value, predicted:true },
                        ...predData
                      ]}
                      dataKey="value" name="Predicted"
                      type="monotone" stroke="#2980b9" strokeWidth={1.5} strokeDasharray="5 3"
                      dot={{ fill:"#fff", stroke:"#2980b9", r:4, strokeWidth:1.5 }}
                      activeDot={{ r:5 }} legendType="circle"
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <hr className="div" />

          {/* Predict next N */}
          <div className="sec-head">Predict Next Terms</div>
          <div className="ctrl-row">
            <label>Next</label>
            <input className="num-input" type="number" min={1} max={20} value={predictN}
              onChange={e => { setPredictN(+e.target.value); setPredicted(null); }} />
            <label>terms</label>
            <button className="go-btn" onClick={handlePredict}>Compute</button>
          </div>
          {predicted && (
            <div className="pred-row">
              {predicted.map(({ n, val }, i) => (
                <div key={n} className="pred-cell" style={{ animationDelay:`${i*35}ms` }}>
                  <div className="pred-val"><FracVal value={val} color="#2980b9" /></div>
                  <div className="pred-idx">n={n}</div>
                </div>
              ))}
            </div>
          )}

          <hr className="div" />

          {/* Term at index */}
          <div className="sec-head">Get Term at Index</div>
          <div className="ctrl-row">
            <label>f(</label>
            <input className="num-input" type="number" min={1} value={targetIdx}
              placeholder="n"
              onChange={e => { setTargetIdx(e.target.value); setIdxResult(null); }}
              onKeyDown={e => e.key === "Enter" && handleIndex()} />
            <label>)</label>
            <button className="go-btn" onClick={handleIndex}>Compute</button>
          </div>
          {idxResult && (
            <div className="idx-answer">
              f({idxResult.idx}) = <FracVal value={idxResult.val} color="#c0392b" />
            </div>
          )}

        </div>
      )}
    </div>
  );
}