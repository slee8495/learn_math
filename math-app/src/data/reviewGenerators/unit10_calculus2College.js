// Fresh, non-repeating "review quiz" problem generators for Unit 10
// (Calculus II & Intro College Math), concept ids 67-74. Each function
// takes a seeded RNG and returns a brand-new, correctly-solved problem in
// the same { q, steps, a } shape used by src/data/problems.js. No
// diagrams — none of the reference problems for these ids use them.
import { randInt, randNonZeroInt, pick } from "../../utils/seededRandom.js";

// ---- shared formatting helpers -----------------------------------------

// "3" for non-negative n, "−3" (unicode minus) for negative n.
function fmtSigned(n) {
  return n < 0 ? `−${Math.abs(n)}` : `${n}`;
}

// "x" / "−x" / "4x" / "−4x" — coefficient times x, own leading sign.
function coefXsigned(k) {
  if (k === 1) return "x";
  if (k === -1) return "−x";
  return `${fmtSigned(k)}x`;
}

const SUP_DIGITS = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
function sup(n) {
  return String(n)
    .split("")
    .map((d) => SUP_DIGITS[Number(d)])
    .join("");
}

function gcdAbs(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

// Reduced fraction {num, den}, den always > 0.
function reduceFrac(num, den) {
  const g = gcdAbs(num, den) || 1;
  let n = num / g;
  let d = den / g;
  if (d < 0) {
    n = -n;
    d = -d;
  }
  return { num: n, den: d };
}

// Signed, reduced fraction display string, e.g. fracDisplay(-7,4) -> "−7/4".
function fracDisplay(num, den) {
  const r = reduceFrac(num, den);
  if (r.den === 1) return fmtSigned(r.num);
  return r.num < 0 ? `−${Math.abs(r.num)}/${r.den}` : `${r.num}/${r.den}`;
}

// Non-negative reduced fraction display string (for probabilities).
function fracDisplayPos(num, den) {
  const r = reduceFrac(num, den);
  return r.den === 1 ? `${r.num}` : `${r.num}/${r.den}`;
}

function fact(n) {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

function fmtDecimal2(x) {
  let s = x.toFixed(2);
  if (s.endsWith("0")) s = s.slice(0, -1);
  if (s.endsWith(".")) s = s.slice(0, -1);
  return s;
}

// ---- id 67: Integration by Parts ----------------------------------------
// ∫u dv = uv − ∫v du. Four families: k·x·cos(ax), k·x·sin(ax), k·ln(x),
// k·x·e^(ax) (all derived symbolically below), plus a fixed conceptual.

// Coefficient (num/den, both > 0) times x, e.g. "x", "2x", "(x/2)", "(3x/2)".
function fracCoefXStr(num, den) {
  const r = reduceFrac(num, den);
  if (r.den === 1) return r.num === 1 ? "x" : `${r.num}x`;
  return r.num === 1 ? `(x/${r.den})` : `(${r.num}x/${r.den})`;
}
// Bare coefficient (num/den, both > 0): "" (means 1), "2", "1/2", "3/2".
function fracCoefStr(num, den) {
  const r = reduceFrac(num, den);
  if (r.den === 1) return r.num === 1 ? "" : `${r.num}`;
  return r.num === 1 ? `1/${r.den}` : `${r.num}/${r.den}`;
}
// "coef * fnStr", e.g. coefTimesFn(1,4,"e^(2x)") -> "(1/4)e^(2x)".
function coefTimesFn(num, den, fnStr) {
  const c = fracCoefStr(num, den);
  const r = reduceFrac(num, den);
  if (c === "") return fnStr;
  if (r.den === 1) return `${c}${fnStr}`;
  return `(${c})${fnStr}`;
}

const IBP_CONCEPT_VARIANTS = [
  {
    q: "When integrating ∫x·eˣ dx by parts, why do we choose u = x instead of u = eˣ?",
    steps: ["u=x has a simple derivative (u'=1), which shrinks the remaining integral. eˣ stays eˣ under both differentiation and integration, so it should be dv."],
    a: "Because u=x simplifies to a constant on differentiation, making the resulting integral easier",
  },
  {
    q: "In integration by parts, what does the LIPET priority order help you decide?",
    steps: ["LIPET: Log, Inverse trig, Polynomial, Exponential, Trig — earlier types make better choices for u."],
    a: "Which factor to pick as u (favor Logs, then Inverse trig, then Polynomials, then Exponentials, then Trig)",
  },
];

function gen67(rng) {
  const family = pick(rng, ["cos", "sin", "ln", "exp", "concept"]);

  if (family === "cos") {
    const k = randInt(rng, 1, 5);
    const a = randInt(rng, 1, 4);
    const kx = k === 1 ? "x" : `${k}x`;
    const aStr = a === 1 ? "x" : `${a}x`;
    const term1 = `${fracCoefXStr(k, a)}·sin(${aStr})`;
    const term2 = coefTimesFn(k, a * a, `cos(${aStr})`);
    return {
      q: `Find ∫${kx}·cos(${aStr}) dx using integration by parts.`,
      steps: [
        `u=${kx}, dv=cos(${aStr}) dx → du=${k} dx, v=sin(${aStr})/${a}.`,
        `∫u dv = uv − ∫v du = (${kx})(sin(${aStr})/${a}) − ∫(${k}/${a})sin(${aStr}) dx.`,
        `= ${term1} + ${term2} + C.`,
      ],
      a: `${term1} + ${term2} + C`,
    };
  }

  if (family === "sin") {
    const k = randInt(rng, 1, 5);
    const a = randInt(rng, 1, 4);
    const kx = k === 1 ? "x" : `${k}x`;
    const aStr = a === 1 ? "x" : `${a}x`;
    const term1 = `${fracCoefXStr(k, a)}·cos(${aStr})`;
    const term2 = coefTimesFn(k, a * a, `sin(${aStr})`);
    return {
      q: `Find ∫${kx}·sin(${aStr}) dx using integration by parts.`,
      steps: [
        `u=${kx}, dv=sin(${aStr}) dx → du=${k} dx, v=−cos(${aStr})/${a}.`,
        `∫u dv = uv − ∫v du = (${kx})(−cos(${aStr})/${a}) − ∫(−${k}/${a})cos(${aStr}) dx.`,
        `= −${term1} + ${term2} + C.`,
      ],
      a: `−${term1} + ${term2} + C`,
    };
  }

  if (family === "ln") {
    const k = randInt(rng, 1, 6);
    const kx = k === 1 ? "x" : `${k}x`;
    return {
      q: `Find ∫${k}·ln(x) dx using integration by parts.`,
      steps: [
        `u=ln(x), dv=${k} dx → du=(1/x) dx, v=${kx}.`,
        `∫u dv = uv − ∫v du = ${kx}·ln(x) − ∫${k} dx.`,
        `= ${kx}·ln(x) − ${kx} + C.`,
      ],
      a: `${kx}·ln(x) − ${kx} + C`,
    };
  }

  if (family === "exp") {
    const k = randInt(rng, 1, 5);
    const a = randInt(rng, 1, 4);
    const kx = k === 1 ? "x" : `${k}x`;
    const aStr = a === 1 ? "x" : `${a}x`;
    const term1 = `${fracCoefXStr(k, a)}·e^(${aStr})`;
    const term2 = coefTimesFn(k, a * a, `e^(${aStr})`);
    return {
      q: `Find ∫${kx}·e^(${aStr}) dx, given dv=e^(${aStr}) dx, v=(1/${a})e^(${aStr}).`,
      steps: [
        `u=${kx} (du=${k} dx), v=(1/${a})e^(${aStr}).`,
        `uv − ∫v du = (${kx})(1/${a})e^(${aStr}) − ∫(${k}/${a})e^(${aStr}) dx.`,
        `= ${term1} − ${term2} + C.`,
      ],
      a: `${term1} − ${term2} + C`,
    };
  }

  // concept
  const v = pick(rng, IBP_CONCEPT_VARIANTS);
  return { q: v.q, steps: [...v.steps], a: v.a };
}

// ---- id 68: Series Convergence Tests -------------------------------------

function gen68(rng) {
  const family = pick(rng, ["geoFrac", "geoInt", "divergence", "concept"]);

  if (family === "geoFrac") {
    const neg = randInt(rng, 1, 2) === 2;
    const k = randInt(rng, 2, 9);
    const display = neg ? `(−1/${k})` : `(1/${k})`;
    const rStr = neg ? `−1/${k}` : `1/${k}`;
    return {
      q: `Does the series Σ${display}ⁿ (n = 0 to ∞) converge or diverge?`,
      steps: [`This is geometric with r = ${rStr}.`, `|r| = 1/${k} < 1, so it converges.`],
      a: "Converges",
    };
  }

  if (family === "geoInt") {
    const neg = randInt(rng, 1, 2) === 2;
    const k = randInt(rng, 2, 9);
    const display = neg ? `(−${k})` : `${k}`;
    return {
      q: `Does the series Σ${display}ⁿ (n = 0 to ∞) converge or diverge?`,
      steps: [`This is geometric with r = ${display}.`, `|r| = ${k} ≥ 1, so it diverges.`],
      a: "Diverges",
    };
  }

  if (family === "divergence") {
    const c = randInt(rng, 1, 5);
    const mult = pick(rng, [1, 2]);
    const numStr = mult === 1 ? "n" : "2n";
    return {
      q: `Does the series Σ(${numStr}/(n+${c})) (n = 1 to ∞) converge or diverge?`,
      steps: [
        `As n→∞, ${numStr}/(n+${c}) → ${mult} (a nonzero constant).`,
        "Since the terms don't approach 0, the series diverges by the divergence test.",
      ],
      a: "Diverges",
    };
  }

  // concept
  return {
    q: "For a geometric series Σrⁿ, what is the condition on r for the series to converge?",
    steps: ["Geometric series Σrⁿ converges exactly when the common ratio satisfies |r| < 1."],
    a: "|r| < 1",
  };
}

// ---- id 69: Taylor Series -------------------------------------------------

function joinSigned(terms) {
  return terms
    .map((t, i) => (i === 0 ? (t.sign < 0 ? `−${t.mag}` : t.mag) : t.sign < 0 ? ` − ${t.mag}` : ` + ${t.mag}`))
    .join("");
}

function exTerms(N) {
  const terms = [];
  for (let i = 0; i < N; i++) {
    let mag;
    if (i === 0) mag = "1";
    else if (i === 1) mag = "x";
    else mag = `x${sup(i)}/${fact(i)}`;
    terms.push({ sign: 1, mag });
  }
  return terms;
}
function sinTerms(N) {
  const terms = [];
  for (let j = 0; j < N; j++) {
    const exp = 2 * j + 1;
    const sign = j % 2 === 0 ? 1 : -1;
    const mag = exp === 1 ? "x" : `x${sup(exp)}/${fact(exp)}`;
    terms.push({ sign, mag });
  }
  return terms;
}
function cosTerms(N) {
  const terms = [];
  for (let j = 0; j < N; j++) {
    const exp = 2 * j;
    const sign = j % 2 === 0 ? 1 : -1;
    const mag = exp === 0 ? "1" : `x${sup(exp)}/${fact(exp)}`;
    terms.push({ sign, mag });
  }
  return terms;
}

function gen69(rng) {
  const family = pick(rng, ["ex", "sin", "cos", "centered", "moreTerms"]);

  if (family === "ex" || family === "sin" || family === "cos") {
    const N = pick(rng, [2, 3]);
    const fnName = family === "ex" ? "eˣ" : family === "sin" ? "sin(x)" : "cos(x)";
    const terms = family === "ex" ? exTerms(N) : family === "sin" ? sinTerms(N) : cosTerms(N);
    const joined = joinSigned(terms);
    const seriesHint =
      family === "ex"
        ? "eˣ = Σxⁿ/n! = 1 + x + x²/2! + x³/3! + ..."
        : family === "sin"
        ? "sin(x) = x − x³/3! + x⁵/5! − ..."
        : "cos(x) = 1 − x²/2! + x⁴/4! − ...";
    return {
      q: `Write the first ${N} nonzero terms of the Maclaurin series for ${fnName} (${seriesHint}).`,
      steps: [
        family === "ex"
          ? "Coefficients are 1/n!, so terms are 1, x, x²/2, x³/6, ..."
          : family === "sin"
          ? "Odd powers only, alternating sign, denominators 1!, 3!=6, 5!=120, ..."
          : "Even powers only, alternating sign, denominators 0!=1, 2!=2, 4!=24, ...",
        `First ${N} terms: ${joined}.`,
      ],
      a: joined,
    };
  }

  if (family === "centered") {
    return {
      q: "What point is a Maclaurin series always centered at?",
      steps: ["A Maclaurin series is just a Taylor series centered at a=0."],
      a: "a = 0",
    };
  }

  // moreTerms
  return {
    q: "As you add more terms to a Taylor series approximation, what happens to its accuracy near the center?",
    steps: ["Each additional term captures a higher-order correction, so the approximation gets closer to the true function near the center."],
    a: "It gets more accurate",
  };
}

// ---- id 70: Systems of Linear Equations (Matrix Form) ---------------------

function eqStr(p, q, r) {
  const pTerm = coefXsigned(p);
  const qAbs = Math.abs(q);
  const qTerm = (q >= 0 ? " + " : " − ") + (qAbs === 1 ? "y" : `${qAbs}y`);
  return `${pTerm}${qTerm} = ${fmtSigned(r)}`;
}

const NO_SOLUTION_VARIANTS = [
  {
    q: "What does it mean if a system of linear equations has no solution?",
    steps: ["The lines (or planes) never meet — there's no (x,y) that satisfies every equation."],
    a: "The equations are inconsistent",
  },
  {
    q: "If row reduction leads to a statement like 0 = 5, what does that tell you about the system?",
    steps: ["A false numeric statement means no values of the variables can satisfy all the equations."],
    a: "The equations are inconsistent (no solution)",
  },
];

function gen70(rng) {
  const family = pick(rng, ["writeMatrix", "numEquations", "identitySolve", "noSolution"]);

  if (family === "writeMatrix") {
    const p1 = randNonZeroInt(rng, -9, 9);
    const q1 = randNonZeroInt(rng, -9, 9);
    const r1 = randInt(rng, -9, 9);
    const p2 = randNonZeroInt(rng, -9, 9);
    const q2 = randNonZeroInt(rng, -9, 9);
    const r2 = randInt(rng, -9, 9);
    return {
      q: `Write the system ${eqStr(p1, q1, r1)}, ${eqStr(p2, q2, r2)} in matrix form Ax=b.`,
      steps: ["Coefficients form A, the right-hand sides form b."],
      a: `A = [[${fmtSigned(p1)}, ${fmtSigned(q1)}], [${fmtSigned(p2)}, ${fmtSigned(q2)}]], b = [${fmtSigned(r1)}, ${fmtSigned(r2)}]`,
    };
  }

  if (family === "numEquations") {
    const N = pick(rng, [2, 3, 4]);
    return {
      q: `If a system has ${N} unknowns, how many independent equations are generally needed to solve for them?`,
      steps: ["Each independent equation pins down one degree of freedom."],
      a: `${N}`,
    };
  }

  if (family === "identitySolve") {
    const v1 = randInt(rng, -9, 9);
    const v2 = randInt(rng, -9, 9);
    return {
      q: `Solve Ax = b for x, given that A is the 2×2 identity matrix and b = [${fmtSigned(v1)}, ${fmtSigned(v2)}].`,
      steps: ["Ax=b with A=I (identity) means x=b directly."],
      a: `x = ${fmtSigned(v1)}, y = ${fmtSigned(v2)}`,
    };
  }

  // noSolution
  const v = pick(rng, NO_SOLUTION_VARIANTS);
  return { q: v.q, steps: [...v.steps], a: v.a };
}

// ---- id 71: Determinants ---------------------------------------------------

function gen71(rng) {
  const family = pick(rng, ["generic", "diagonal", "singular", "concept"]);

  if (family === "generic") {
    const a = randInt(rng, -9, 9);
    const b = randInt(rng, -9, 9);
    const c = randInt(rng, -9, 9);
    const d = randInt(rng, -9, 9);
    const det = a * d - b * c;
    return {
      q: `Find the determinant of [[${fmtSigned(a)}, ${fmtSigned(b)}], [${fmtSigned(c)}, ${fmtSigned(d)}]].`,
      steps: [`det = ad − bc = (${fmtSigned(a)})(${fmtSigned(d)}) − (${fmtSigned(b)})(${fmtSigned(c)}) = ${fmtSigned(det)}.`],
      a: `${fmtSigned(det)}`,
    };
  }

  if (family === "diagonal") {
    const k = randInt(rng, 1, 9);
    return {
      q: `Find the determinant of [[${k}, 0], [0, ${k}]].`,
      steps: [`Diagonal matrix: det = product of diagonal entries = ${k}×${k}.`],
      a: `${k * k}`,
    };
  }

  if (family === "singular") {
    const rowA = randNonZeroInt(rng, -9, 9);
    const rowB = randInt(rng, -9, 9);
    const m = pick(rng, [2, 3]);
    const row2A = m * rowA;
    const row2B = m * rowB;
    return {
      q: `Find the determinant of [[${fmtSigned(rowA)}, ${fmtSigned(rowB)}], [${fmtSigned(row2A)}, ${fmtSigned(row2B)}]].`,
      steps: ["The second row is a multiple of the first row (proportional rows), so the determinant is 0."],
      a: "0",
    };
  }

  // concept
  return {
    q: "If det(A) = 0, does A have an inverse?",
    steps: ["A matrix is invertible only when its determinant is nonzero."],
    a: "No",
  };
}

// ---- id 72: Eigenvalues & Eigenvectors (Introduction) ----------------------

function gen72(rng) {
  const family = pick(rng, ["distinct", "repeated", "eqConcept", "lambdaConcept"]);

  if (family === "distinct") {
    const p = randNonZeroInt(rng, -9, 9);
    let qv;
    do {
      qv = randNonZeroInt(rng, -9, 9);
    } while (qv === p);
    return {
      q: `Find the eigenvalues of [[${fmtSigned(p)}, 0], [0, ${fmtSigned(qv)}]].`,
      steps: ["For a diagonal matrix, the eigenvalues are just the diagonal entries."],
      a: `λ = ${fmtSigned(p)} and λ = ${fmtSigned(qv)}`,
    };
  }

  if (family === "repeated") {
    const p = randNonZeroInt(rng, -9, 9);
    return {
      q: `Find the eigenvalues of [[${fmtSigned(p)}, 0], [0, ${fmtSigned(p)}]].`,
      steps: ["For a diagonal matrix, the eigenvalues are just the diagonal entries."],
      a: `λ = ${fmtSigned(p)} (repeated)`,
    };
  }

  if (family === "eqConcept") {
    return {
      q: "What equation is used to find the eigenvalues of a matrix A?",
      steps: ["Eigenvalues are the values of λ that make (A−λI) singular, i.e. det(A−λI)=0."],
      a: "det(A − λI) = 0",
    };
  }

  // lambdaConcept
  return {
    q: "If Av = λv for a nonzero vector v, what does λ represent?",
    steps: ["λ tells you how much the matrix stretches or shrinks the eigenvector v."],
    a: "The eigenvalue (scaling factor)",
  };
}

// ---- id 73: Introduction to Probability ------------------------------------

function gen73(rng) {
  const family = pick(rng, ["coins", "marbles", "die", "independent"]);

  if (family === "coins") {
    const N = pick(rng, [2, 3]);
    const total = 2 ** N;
    return {
      q: `If you flip a fair coin ${N} times, what is the probability that all ${N} flips are heads?`,
      steps: ["Each flip is independent with P(heads)=1/2.", `P(all heads) = (1/2)${sup(N)} = 1/${total}.`],
      a: `1/${total}`,
    };
  }

  if (family === "marbles") {
    const r = randInt(rng, 1, 8);
    const b = randInt(rng, 1, 8);
    const color = pick(rng, ["red", "blue"]);
    const favorable = color === "red" ? r : b;
    const total = r + b;
    const ansStr = fracDisplayPos(favorable, total);
    return {
      q: `A bag has ${r} red marbles and ${b} blue marbles. If you draw one marble at random, what is the probability it's ${color}?`,
      steps: [
        `Total marbles = ${r} + ${b} = ${total}.`,
        `P(${color}) = ${favorable}/${total}${ansStr !== `${favorable}/${total}` ? ` = ${ansStr}` : ""}.`,
      ],
      a: ansStr,
    };
  }

  if (family === "die") {
    const sub = pick(rng, ["greaterThan", "notNumber"]);
    if (sub === "greaterThan") {
      const K = randInt(rng, 1, 5);
      const favorable = 6 - K;
      const ansStr = fracDisplayPos(favorable, 6);
      return {
        q: `If you roll a fair 6-sided die, what is the probability of rolling a number greater than ${K}?`,
        steps: [
          `Favorable outcomes: ${K + 1} through 6, so ${favorable} out of 6.`,
          `P = ${favorable}/6${ansStr !== `${favorable}/6` ? ` = ${ansStr}` : ""}.`,
        ],
        a: ansStr,
      };
    }
    const m = randInt(rng, 1, 6);
    return {
      q: `If you roll a fair 6-sided die, what is the probability of NOT rolling a ${m}?`,
      steps: [`5 of the 6 outcomes are not ${m}.`, "P = 5/6."],
      a: "5/6",
    };
  }

  // independent
  const set = [0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
  const p1 = pick(rng, set);
  const p2 = pick(rng, set);
  const p1c = Math.round(p1 * 100);
  const p2c = Math.round(p2 * 100);
  const rawc = p1c * p2c; // scale: 1/10000
  const roundedc = Math.round(rawc / 100); // scale: 1/100 (cents)
  const productStr = fmtDecimal2(roundedc / 100);
  return {
    q: `Two independent events have probabilities ${p1} and ${p2}. What's the probability that both occur?`,
    steps: ["Independent events: multiply the probabilities.", `P = ${p1} × ${p2} ≈ ${productStr}.`],
    a: productStr,
  };
}

// ---- id 74: Introduction to Statistics: Mean, Variance & Distributions ----

function gen74(rng) {
  const family = pick(rng, ["mean", "varOrStd", "concept", "constant"]);

  if (family === "mean") {
    const N = randInt(rng, 3, 5);
    const meanTarget = randInt(rng, -5, 15);
    const vals = [];
    for (let i = 0; i < N - 1; i++) vals.push(randInt(rng, -9, 20));
    const sumOthers = vals.reduce((s, v) => s + v, 0);
    const last = N * meanTarget - sumOthers;
    if (last >= -9 && last <= 20) {
      vals.push(last);
    } else {
      vals.push(randInt(rng, -9, 20));
    }
    const sum = vals.reduce((s, v) => s + v, 0);
    const ansStr = fracDisplay(sum, N);
    return {
      q: `Find the mean of the data set: ${vals.map(fmtSigned).join(", ")}.`,
      steps: [`Sum = ${fmtSigned(sum)}, count = ${N}.`, `Mean = ${fmtSigned(sum)}/${N} = ${ansStr}.`],
      a: ansStr,
    };
  }

  if (family === "varOrStd") {
    const N = randInt(rng, 3, 4);
    const vals = [];
    for (let i = 0; i < N; i++) vals.push(randInt(rng, -9, 9));
    const sum = vals.reduce((s, v) => s + v, 0);
    const sumSq = vals.reduce((s, v) => s + v * v, 0);
    const numerator = N * sumSq - sum * sum; // = N²·Var, always ≥ 0
    const denom = N * N;
    const varFrac = reduceFrac(numerator, denom);
    const varDecimal = numerator / denom;
    const varStr = varFrac.den === 1 ? `${varFrac.num}` : `${varFrac.num}/${varFrac.den} ≈ ${varDecimal.toFixed(2)}`;

    const askStdDev = randInt(rng, 1, 2) === 2;
    if (!askStdDev) {
      return {
        q: `Find the variance of the data set: ${vals.map(fmtSigned).join(", ")}.`,
        steps: [
          `Mean = ${fmtSigned(sum)}/${N}.`,
          `Variance = average of squared deviations from the mean = ${numerator}/${denom} = ${varStr}.`,
        ],
        a: varStr,
      };
    }
    const stdVal = Math.sqrt(varDecimal);
    const stdStr = `≈ ${stdVal.toFixed(2)}`;
    return {
      q: `Find the standard deviation of the data set: ${vals.map(fmtSigned).join(", ")}.`,
      steps: [`Variance = ${varStr}.`, `Std dev = √variance ${stdStr}.`],
      a: stdStr,
    };
  }

  if (family === "concept") {
    return {
      q: "What shape does a normal distribution have?",
      steps: ["A normal distribution is symmetric about its mean and shaped like a bell."],
      a: "Symmetric, bell-shaped",
    };
  }

  // constant
  const v = randInt(rng, -9, 20);
  const N = randInt(rng, 3, 5);
  return {
    q: `Find the variance of the data set: ${Array(N).fill(fmtSigned(v)).join(", ")}.`,
    steps: [`All values equal the mean (${fmtSigned(v)}), so every squared deviation is 0.`, "Variance = 0."],
    a: "0",
  };
}

export default {
  67: gen67,
  68: gen68,
  69: gen69,
  70: gen70,
  71: gen71,
  72: gen72,
  73: gen73,
  74: gen74,
};
