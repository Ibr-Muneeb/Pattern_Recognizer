# Sequence Pattern Detector

A tool that identifies mathematical patterns in number sequences and predicts future terms.

## What it detects

| Pattern | Example |
|---|---|
| Arithmetic | 2, 4, 6, 8, 10 |
| Geometric | 3, 6, 12, 24, 48 |
| Power (nᵏ) | 1, 4, 9, 16, 25 |
| Polynomial | 2, 5, 10, 17, 26 |
| Fibonacci-like | 1, 1, 2, 3, 5, 8 |
| Triangular | 1, 3, 6, 10, 15 |
| Factorial | 1, 2, 6, 24, 120 |
| Periodic | 1, 2, 1, 2, 1, 2 |
| Alternating Arithmetic | 1, 10, 3, 12, 5, 14 |
| Exponential with Offset | 3, 5, 9, 17, 33 |
| Linear Recurrence (order 2) | any a(n) = A·a(n-1) + B·a(n-2) |
| Floor / Ceiling sequences | ⌊n·√2⌋, ⌈n/3⌉, ... |

## Project structure

```
sequence-detector/
├── src/
│   ├── SequenceDetector.jsx   # React frontend + all detection logic
│   └── main.jsx
├── c-source/                  # Original C implementation
│   ├── main.c
│   ├── pattern_header.h
│   ├── arithmetic.c
│   ├── geometric.c
│   ├── polynomial.c
│   ├── exponential.c
│   ├── exp_offset.c
│   ├── factorial.c
│   ├── recurrence.c
│   ├── alternating.c
│   ├── periodic.c
│   ├── triangular_fib.c
│   ├── floor_ceil.c
│   ├── predict.c
│   ├── output.c
│   ├── sequence_input.c
│   └── Makefile
├── index.html
├── package.json
└── vite.config.js
```

## Running the web app

**Requirements:** Node.js 18+

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Building for production

```bash
npm run build
```

Output goes to the `dist/` folder.

## Running the original C version

```bash
cd c-source
make
./sequence_detector
```

## Features

- Detects 13 pattern types with a priority/complexity ranking system
- Predict the next N terms of any detected sequence
- Look up f(n) at any arbitrary index
- Fraction input supported (e.g. `1/2, 1/4, 1/8`)
- Difference table view for polynomial sequences