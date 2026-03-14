import { useState } from "react";

const UNKNOWN=0,ARITHMETIC=1,GEOMETRIC=2,EXPONENTIAL=3,POLYNOMIAL=4,
      FACTORIAL=5,RECURRENCE=6,ALTERNATING=7,EXP_OFFSET=8,
      PERIODIC=9,FLOOR_SEQ=10,CEIL_SEQ=11,TRIANGULAR=12,FIBONACCI=13;

function isArithmetic(arr) {
  if (arr.length<2) return 0;
  const diff=arr[1]-arr[0],eps=0.0001;
  for(let i=0;i<arr.length-1;i++)
    if(Math.abs((arr[i+1]-arr[i])-diff)>eps)return 0;
  return Math.abs(diff)<eps?1e-9:diff;
}
function isGeometric(arr) {
  if(arr.length<2||arr[0]===0)return 0;
  const ratio=arr[1]/arr[0],eps=0.0001;
  for(let i=0;i<arr.length-1;i++){
    if(Math.abs(arr[i])<eps)return 0;
    if(Math.abs(arr[i+1]/arr[i]-ratio)>eps)return 0;
  }
  return ratio;
}
function isExponential(arr) {
  const eps=0.001;
  for(let i=1;i<=9;i++){
    let ok=true;
    for(let k=0;k<arr.length;k++)
      if(Math.abs(Math.pow(k+1,i)-arr[k])>eps){ok=false;break;}
    if(ok)return i;
  }
  return 0;
}
function buildDifferenceTable(arr) {
  const size=arr.length;
  const table=Array.from({length:size},()=>new Array(size).fill(0));
  for(let i=0;i<size;i++)table[0][i]=arr[i];
  const eps=0.0001;let degree=0;
  for(let level=1;level<size;level++){
    for(let i=0;i<size-level;i++)
      table[level][i]=table[level-1][i+1]-table[level-1][i];
    let constant=true;
    for(let i=0;i<size-level-1;i++)
      if(Math.abs(table[level][i]-table[level][i+1])>eps){constant=false;break;}
    if(constant){degree=level;break;}
  }
  return{table,degree};
}
function factorial(n){let r=1;for(let i=2;i<=n;i++)r*=i;return r;}
function isFactorial(arr){
  if(arr.length<2)return null;
  const eps=0.001,C=arr[0]-factorial(1);
  for(let i=0;i<arr.length;i++)
    if(Math.abs(factorial(i+1)+C-arr[i])>eps)return null;
  return C;
}
function isRecurrence(arr){
  if(arr.length<4)return null;
  const eps=0.001,[a0,a1,a2,a3]=arr;
  const det=a1*a1-a0*a2;
  if(Math.abs(det)<eps)return null;
  const A=(a2*a1-a3*a0)/det,B=(a3*a1-a2*a2)/det;
  for(let i=2;i<arr.length;i++)
    if(Math.abs(A*arr[i-1]+B*arr[i-2]-arr[i])>eps)return null;
  return{A,B};
}
function isAlternating(arr){
  if(arr.length<4)return null;
  const odd=arr.filter((_,i)=>i%2===0),even=arr.filter((_,i)=>i%2===1);
  if(odd.length<2||even.length<2)return null;
  const dOdd=isArithmetic(odd),dEven=isArithmetic(even);
  if(dOdd!==0&&dEven!==0)return{dOdd,dEven};
  return null;
}
function isExponentialOffset(arr){
  if(arr.length<4)return null;
  const eps=0.01,bases=[2,3,0.5,0.25,1/3,-1,-2,4,0.1];
  for(const rb of bases){
    if(Math.abs(rb-1)<1e-6)continue;
    const Ab=(arr[1]-arr[0])/(rb-1),Cb=arr[0]-Ab;
    let ok=true;
    for(let i=0;i<arr.length;i++)
      if(Math.abs(Ab*Math.pow(rb,i)+Cb-arr[i])>eps){ok=false;break;}
    if(ok)return{A:Ab,r:rb,C:Cb};
  }
  return null;
}
function isPeriodic(arr){
  if(arr.length<4)return null;
  const eps=0.0001;
  for(let k=2;k<=8&&k<=arr.length/2;k++){
    let ok=true;
    for(let i=0;i+k<arr.length;i++)
      if(Math.abs(arr[i]-arr[i+k])>eps){ok=false;break;}
    if(ok)return k;
  }
  return null;
}
function isTriangular(arr){
  if(arr.length<3)return null;
  const eps=0.001;
  for(let i=0;i<arr.length-2;i++){
    const d2=(arr[i+2]-arr[i+1])-(arr[i+1]-arr[i]);
    if(Math.abs(d2-1)>eps)return null;
  }
  return arr[0]-1;
}
function isFibonacci(arr){
  if(arr.length<4)return false;
  const eps=0.001;
  for(let i=2;i<arr.length;i++)
    if(Math.abs(arr[i-1]+arr[i-2]-arr[i])>eps)return false;
  return true;
}
function isFloorPattern(arr){
  if(arr.length<3)return null;
  const eps2=0.4999;
  for(let p=1;p<=12;p++)for(let q=1;q<=12;q++)for(const s of[1,-1]){
    const Ab=s*p/q,baseB=arr[0]-Ab;
    for(const off of[0,.1,.2,.3,.4,-.1,-.2,-.3,-.4,.5,-.5]){
      const Bb=baseB+off;let ok=true;
      for(let i=0;i<arr.length;i++)
        if(Math.abs(Math.floor(Ab*(i+1)+Bb)-arr[i])>eps2){ok=false;break;}
      if(ok)return{A:Ab,B:Bb};
    }
  }
  return null;
}
function isCeilPattern(arr){
  if(arr.length<3)return null;
  const eps2=0.4999;
  for(let p=1;p<=12;p++)for(let q=1;q<=12;q++)for(const s of[1,-1]){
    const Ab=s*p/q,baseB=arr[0]-Ab;
    for(const off of[0,.1,.2,.3,.4,-.1,-.2,-.3,-.4,.5,-.5]){
      const Bb=baseB+off;let ok=true;
      for(let i=0;i<arr.length;i++)
        if(Math.abs(Math.ceil(Ab*(i+1)+Bb)-arr[i])>eps2){ok=false;break;}
      if(ok)return{A:Ab,B:Bb};
    }
  }
  return null;
}

function detectPattern(arr){
  let best={type:UNKNOWN,complexity:9999,params:{}};
  const pick=(p)=>{if(p.complexity<best.complexity)best=p;};
  const arith=isArithmetic(arr);
  if(arith!==0)pick({type:ARITHMETIC,complexity:1,params:{diff:Math.abs(arith)<1e-8?0:arith,a0:arr[0]}});
  const tri=isTriangular(arr);
  if(tri!==null)pick({type:TRIANGULAR,complexity:3,params:{C:tri}});
  const geo=isGeometric(arr);
  if(geo!==0)pick({type:GEOMETRIC,complexity:2,params:{ratio:geo,a1:arr[0]}});
  const alt=isAlternating(arr);
  if(alt)pick({type:ALTERNATING,complexity:3,params:{dOdd:alt.dOdd,dEven:alt.dEven,oddStart:arr[0],evenStart:arr.length>1?arr[1]:0}});
  const expOff=isExponentialOffset(arr);
  if(expOff)pick({type:EXP_OFFSET,complexity:4,params:expOff});
  const expo=isExponential(arr);
  if(expo)pick({type:EXPONENTIAL,complexity:5,params:{k:expo}});
  const{table,degree}=buildDifferenceTable(arr);
  if(degree>0)pick({type:POLYNOMIAL,complexity:6+degree,params:{degree,table}});
  if(isFibonacci(arr))pick({type:FIBONACCI,complexity:7,params:{a0:arr[0],a1:arr[1]}});
  const factC=isFactorial(arr);
  if(factC!==null)pick({type:FACTORIAL,complexity:8,params:{C:factC}});
  const period=isPeriodic(arr);
  if(period)pick({type:PERIODIC,complexity:9,params:{period,cycle:arr.slice(0,period)}});
  const rec=isRecurrence(arr);
  if(rec)pick({type:RECURRENCE,complexity:10,params:rec});
  const flr=isFloorPattern(arr);
  if(flr)pick({type:FLOOR_SEQ,complexity:4,params:flr});
  const cl=isCeilPattern(arr);
  if(cl)pick({type:CEIL_SEQ,complexity:4,params:cl});
  return{best,table,degree};
}

function predictTerm(best,n,arr){
  const p=best.params;
  switch(best.type){
    case ARITHMETIC:  return p.a0+(n-1)*p.diff+p.diff;
    case GEOMETRIC:   return p.a1*Math.pow(p.ratio,n-1);
    case EXPONENTIAL: return Math.pow(n,p.k);
    case EXP_OFFSET:  return p.A*Math.pow(p.r,n-1)+p.C;
    case FACTORIAL:   return factorial(n)+p.C;
    case TRIANGULAR:  return n*(n+1)/2+p.C;
    case FLOOR_SEQ:   return Math.floor(p.A*n+p.B);
    case CEIL_SEQ:    return Math.ceil(p.A*n+p.B);
    case PERIODIC:    return p.cycle[(n-1)%p.period];
    case FIBONACCI:{let a=p.a0,b=p.a1;if(n===1)return a;if(n===2)return b;for(let i=2;i<n;i++){const c=a+b;a=b;b=c;}return b;}
    case RECURRENCE:{const ext=[...arr];while(ext.length<n)ext.push(p.A*ext[ext.length-1]+p.B*ext[ext.length-2]);return ext[n-1];}
    case ALTERNATING:{if(n%2===1){const k=(n+1)/2;return p.oddStart+(k-1)*p.dOdd;}else{const k=n/2;return p.evenStart+(k-1)*p.dEven;}}
    case POLYNOMIAL:{const{table,degree}=p;let result=0,binom=1;const nn=n-1;for(let k=0;k<=degree;k++){result+=binom*table[k][0];binom*=(nn-k)/(k+1);}return result;}
    default:return 0;
  }
}

function buildPolyString(table,degree){
  const fc=new Array(degree+1).fill(0);
  function mp(a,dA,b,dB){const r=new Array(dA+dB+1).fill(0);for(let i=0;i<=dA;i++)for(let j=0;j<=dB;j++)r[i+j]+=a[i]*b[j];return r;}
  for(let i=0;i<=degree;i++){
    let term=[1],td=0;
    for(let j=0;j<i;j++){term=mp(term,td,[-(j+1),1],1);td++;}
    const coef=table[i][0]/factorial(i);
    for(let k=0;k<=td;k++)fc[k]+=coef*term[k];
  }
  let parts=[],first=true;
  for(let i=degree;i>=0;i--){
    if(Math.abs(fc[i])<0.0001)continue;
    const c=+fc[i].toFixed(4);
    if(!first&&c>0)parts.push('+');
    if(i===0)parts.push(`${c}`);
    else if(i===1)parts.push(`${c}n`);
    else parts.push(`${c}n^${i}`);
    first=false;
  }
  return`f(n) = ${parts.join(' ')}`;
}

function formulaString(best,arr){
  const p=best.params,f=(x)=>+x.toFixed(4);
  switch(best.type){
    case ARITHMETIC:
      if(Math.abs(p.diff)<1e-8)return`f(n) = ${f(arr[0])}  (constant)`;
      return`f(n) = ${f(p.diff)}n + ${f(p.a0)}`;
    case GEOMETRIC:   return`f(n) = ${f(p.a1)} · ${f(p.ratio)}^(n−1)`;
    case EXPONENTIAL: return`f(n) = n^${p.k}`;
    case EXP_OFFSET:  return`f(n) = ${f(p.A)} · ${f(p.r)}^(n−1) + ${f(p.C)}`;
    case FACTORIAL:   return Math.abs(p.C)<0.001?`f(n) = n!`:`f(n) = n! + ${f(p.C)}`;
    case TRIANGULAR:  return Math.abs(p.C)<0.001?`f(n) = n(n+1)/2`:`f(n) = n(n+1)/2 + ${f(p.C)}`;
    case RECURRENCE:  return`f(n) = ${f(p.A)}·f(n−1) + ${f(p.B)}·f(n−2)`;
    case FIBONACCI:   return`f(n) = f(n−1) + f(n−2)`;
    case ALTERNATING: return`Odd: d = ${f(p.dOdd)}, start = ${f(p.oddStart)}   ·   Even: d = ${f(p.dEven)}, start = ${f(p.evenStart)}`;
    case PERIODIC:    return`Period ${p.period}:  [ ${p.cycle.map(f).join(', ')} ]`;
    case FLOOR_SEQ:   return`f(n) = ⌊${f(p.A)}n + ${f(p.B)}⌋`;
    case CEIL_SEQ:    return`f(n) = ⌈${f(p.A)}n + ${f(p.B)}⌉`;
    case POLYNOMIAL:  return buildPolyString(p.table,p.degree);
    default:return"No pattern detected";
  }
}

const TYPE_NAMES={
  [UNKNOWN]:"Unknown",[ARITHMETIC]:"Arithmetic Sequence",
  [GEOMETRIC]:"Geometric Sequence",[EXPONENTIAL]:"Power Sequence (nᵏ)",
  [POLYNOMIAL]:"Polynomial Sequence",[FACTORIAL]:"Factorial Sequence",
  [RECURRENCE]:"Linear Recurrence",[ALTERNATING]:"Alternating Arithmetic",
  [EXP_OFFSET]:"Exponential with Offset",[PERIODIC]:"Periodic Sequence",
  [FLOOR_SEQ]:"Floor Sequence",[CEIL_SEQ]:"Ceiling Sequence",
  [TRIANGULAR]:"Triangular Numbers",[FIBONACCI]:"Fibonacci-like",
};

const EXAMPLES=["2, 4, 6, 8, 10","3, 6, 12, 24, 48","1, 4, 9, 16, 25","1, 1, 2, 3, 5, 8","1, 3, 6, 10, 15","1, 2, 6, 24, 120","1, 2, 1, 2, 1, 2","2, 5, 10, 17, 26"];

const fmt=(x)=>{const n=+parseFloat(x).toFixed(6);return isNaN(n)?"?":n.toString();};

export default function App(){
  const[input,setInput]=useState("");
  const[result,setResult]=useState(null);
  const[error,setError]=useState("");
  const[loading,setLoading]=useState(false);
  const[predictN,setPredictN]=useState(5);
  const[predicted,setPredicted]=useState(null);
  const[targetIdx,setTargetIdx]=useState("");
  const[idxResult,setIdxResult]=useState(null);
  const[showDiff,setShowDiff]=useState(false);

  function parseInput(raw){
    return raw.trim().split(/[\s,]+/).map(tok=>{
      if(tok.includes('/')){const[n,d]=tok.split('/');return d&&+d!==0?+n/+d:0;}
      return parseFloat(tok);
    }).filter(x=>!isNaN(x));
  }

  function handleDetect(){
    setError("");setResult(null);setPredicted(null);setIdxResult(null);setShowDiff(false);
    const arr=parseInput(input);
    if(arr.length<2){setError("Please enter at least 2 numbers.");return;}
    setLoading(true);
    setTimeout(()=>{
      const{best,table,degree}=detectPattern(arr);
      setResult({best,arr,table,degree});
      setLoading(false);
    },280);
  }

  function handlePredict(){
    if(!result)return;
    const{best,arr}=result;
    setPredicted(Array.from({length:predictN},(_,i)=>({
      n:arr.length+1+i,val:predictTerm(best,arr.length+1+i,arr)
    })));
  }

  function handleIndex(){
    if(!result||!targetIdx)return;
    const idx=parseInt(targetIdx);
    if(isNaN(idx)||idx<1)return;
    setIdxResult({idx,val:predictTerm(result.best,idx,result.arr)});
  }

  return(
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300&family=Source+Sans+3:wght@300;400;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#fff;color:#1a1a1a;font-family:'Source Sans 3',sans-serif;}
        .app{max-width:700px;margin:0 auto;padding:0 1.5rem 5rem;}

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
          background:none;border:none;cursor:pointer;color:#c0392b;font-size:1rem;
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

        .result-type{font-size:.67rem;letter-spacing:.13em;text-transform:uppercase;color:#c0392b;font-weight:600;margin-bottom:.35rem;}
        .result-formula{font-family:'Source Serif 4',serif;font-size:1.35rem;font-weight:300;color:#111;margin-bottom:1.2rem;line-height:1.5;word-break:break-word;}

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

        .sec-head{font-size:.67rem;letter-spacing:.12em;text-transform:uppercase;color:#bbb;font-weight:600;margin-bottom:.7rem;}
        .ctrl-row{display:flex;align-items:center;gap:.65rem;flex-wrap:wrap;margin-bottom:.9rem;}
        .ctrl-row label{font-size:.83rem;color:#555;}
        .num-input{width:64px;font-family:'Source Serif 4',serif;font-size:.9rem;border:1px solid #ddd;border-radius:3px;padding:.32rem .45rem;color:#1a1a1a;outline:none;text-align:center;}
        .num-input:focus{border-color:#c0392b;}
        .go-btn{font-family:'Source Sans 3',sans-serif;font-size:.75rem;font-weight:600;letter-spacing:.04em;padding:.34rem .85rem;background:#c0392b;color:#fff;border:none;border-radius:3px;cursor:pointer;transition:background .1s;}
        .go-btn:hover{background:#a93226;}

        .pred-row{display:flex;flex-wrap:wrap;border:1px solid #f0eae6;border-radius:3px;overflow:hidden;margin-bottom:1.4rem;}
        .pred-cell{display:flex;flex-direction:column;align-items:center;padding:.45rem .7rem;border-right:1px solid #f0eae6;min-width:56px;animation:fadeUp .2s ease backwards;}
        .pred-cell:last-child{border-right:none;}
        .pred-val{font-family:'Source Serif 4',serif;font-size:.9rem;color:#c0392b;}
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
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&handleDetect()}
          placeholder="e.g.  2, 4, 8, 16, 32   or   1 1 2 3 5 8   or   1/2, 1/4, 1/8"
        />
        <button className="search-btn" onClick={handleDetect}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </div>

      {error&&<div className="error">{error}</div>}

      <div className="examples-row">
        <span className="ex-label">Examples:</span>
        {EXAMPLES.map(s=>(
          <button key={s} className="ex-chip"
            onClick={()=>{setInput(s);setResult(null);setPredicted(null);setIdxResult(null);}}>
            {s}
          </button>
        ))}
      </div>

      {loading&&<div className="loading-line"/>}

      {result&&(
        <div className="result">
          <div className="result-type">{TYPE_NAMES[result.best.type]}</div>
          <div className="result-formula">{formulaString(result.best,result.arr)}</div>

          <div className="seq-row">
            {result.arr.slice(0,10).map((v,i)=>(
              <div key={i} className="seq-cell">
                <div className="seq-val">{fmt(v)}</div>
                <div className="seq-idx">n={i+1}</div>
              </div>
            ))}
            {result.arr.length>10&&<div className="seq-ellipsis">…</div>}
          </div>

          {result.best.type===POLYNOMIAL&&(
            <>
              <button className="diff-toggle" onClick={()=>setShowDiff(v=>!v)}>
                {showDiff?"Hide":"Show"} difference table
              </button>
              {showDiff&&(
                <div className="diff-table-wrap">
                  <table className="diff-table"><tbody>
                    {Array.from({length:result.degree+1},(_,lvl)=>(
                      <tr key={lvl}>
                        <td className="rl">Δ{lvl}</td>
                        {Array.from({length:result.arr.length-lvl},(_,i)=>(
                          <td key={i}>{+result.table[lvl][i].toFixed(3)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody></table>
                </div>
              )}
            </>
          )}

          <hr className="div"/>

          <div className="sec-head">Predict Next Terms</div>
          <div className="ctrl-row">
            <label>Next</label>
            <input className="num-input" type="number" min={1} max={20} value={predictN}
              onChange={e=>{setPredictN(+e.target.value);setPredicted(null);}}/>
            <label>terms</label>
            <button className="go-btn" onClick={handlePredict}>Compute</button>
          </div>
          {predicted&&(
            <div className="pred-row">
              {predicted.map(({n,val},i)=>(
                <div key={n} className="pred-cell" style={{animationDelay:`${i*35}ms`}}>
                  <div className="pred-val">{fmt(val)}</div>
                  <div className="pred-idx">n={n}</div>
                </div>
              ))}
            </div>
          )}

          <hr className="div"/>

          <div className="sec-head">Get Term at Index</div>
          <div className="ctrl-row">
            <label>f(</label>
            <input className="num-input" type="number" min={1} value={targetIdx}
              placeholder="n"
              onChange={e=>{setTargetIdx(e.target.value);setIdxResult(null);}}
              onKeyDown={e=>e.key==='Enter'&&handleIndex()}/>
            <label>)</label>
            <button className="go-btn" onClick={handleIndex}>Compute</button>
          </div>
          {idxResult&&(
            <div className="idx-answer">
              f({idxResult.idx}) = <span>{fmt(idxResult.val)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}