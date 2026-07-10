// Fresh, non-repeating "review quiz" problem generators for Unit 4
// (Quadratics, Exponents & Radicals), concept ids 22-25. Each function
// takes a seeded RNG and returns a brand-new, correctly-solved problem
// in the same { q, steps, a, diagram? } shape used by src/data/problems.js.
import { randInt, randNonZeroInt, pick } from "../../utils/seededRandom.js";

// ---- shared formatting helpers -----------------------------------------

// "3" for non-negative n, "−3" (unicode minus) for negative n.
function fmtSigned(n) {
  return n < 0 ? `−${Math.abs(n)}` : `${n}`;
}

// "5" for non-negative n, "(−5)" for negative n — used inside expressions
// like "4+(−2)" where a bare minus sign would be ambiguous.
function numTerm(n) {
  return n < 0 ? `(−${Math.abs(n)})` : `${n}`;
}

const SUP_DIGITS = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
function sup(n) {
  const neg = n < 0;
  const digits = String(Math.abs(n))
    .split("")
    .map((d) => SUP_DIGITS[Number(d)])
    .join("");
  return (neg ? "⁻" : "") + digits;
}

// ---- id 22: The Quadratic Formula --------------------------------------

// "x²" (+/-)Bx (+/-)C" ... " = 0" with a shown only when a > 1 (a is always
// positive here, since it's built from {1,2,3}).
function formatQuadraticEq0(a, b, c) {
  let s = a === 1 ? "x²" : `${a}x²`;
  if (b !== 0) {
    const ab = Math.abs(b);
    s += (b > 0 ? " + " : " − ") + (ab === 1 ? "x" : `${ab}x`);
  }
  if (c !== 0) {
    s += (c > 0 ? " + " : " − ") + Math.abs(c);
  }
  return `${s} = 0`;
}

function gen22(rng) {
  const a = pick(rng, [1, 1, 2, 3]); // a=1 most common, matching the reference pool
  const r1 = randInt(rng, -9, 9);
  // ~20% chance of a repeated root (matches the reference's x²−4x+4 case).
  const r2 = randInt(rng, 1, 5) === 1 ? r1 : randInt(rng, -9, 9);

  // ax²+bx+c built so it factors exactly as a(x-r1)(x-r2) — all integers,
  // and the quadratic formula reproduces r1, r2 regardless of a.
  const b = -a * (r1 + r2);
  const c = a * r1 * r2;

  const discriminant = b * b - 4 * a * c; // = a²(r1−r2)², always a perfect square
  const sqrtD = Math.round(Math.sqrt(discriminant));

  const x1 = Math.round((-b + sqrtD) / (2 * a));
  const x2 = Math.round((-b - sqrtD) / (2 * a));
  const bigger = Math.max(x1, x2);
  const smaller = Math.min(x1, x2);

  const term1 = b * b;
  const term2 = -4 * a * c;

  const steps = [
    `a=${a},b=${fmtSigned(b)},c=${fmtSigned(c)}.`,
    `Discriminant: ${term1}${term2 >= 0 ? "+" : "−"}${Math.abs(term2)}=${discriminant}.`,
    `x=(${fmtSigned(-b)}±${sqrtD})/${2 * a}.`,
  ];

  const ans =
    r1 === r2
      ? `x = ${fmtSigned(bigger)} (one repeated solution)`
      : `x = ${fmtSigned(bigger)} or x = ${fmtSigned(smaller)}`;

  return {
    q: `Solve ${formatQuadraticEq0(a, b, c)} using the quadratic formula.`,
    steps,
    a: ans,
  };
}

// ---- id 23: Graphing Quadratics (Parabolas) ----------------------------

// "y = ax² + bx + c" with a's ±1 shown bare ("x²"/"−x²") and zero terms
// dropped, matching the reference pool's formatting exactly.
function formatQuadraticY(a, b, c) {
  let s = "y = ";
  s += a === 1 ? "x²" : a === -1 ? "−x²" : `${fmtSigned(a)}x²`;
  if (b !== 0) {
    const ab = Math.abs(b);
    s += (b > 0 ? " + " : " − ") + (ab === 1 ? "x" : `${ab}x`);
  }
  if (c !== 0) {
    s += (c > 0 ? " + " : " − ") + Math.abs(c);
  }
  return s;
}

function gen23(rng) {
  const a = pick(rng, [-3, -2, -1, 1, 2, 3]);
  const k = randInt(rng, -6, 6); // intended vertex x-coordinate
  const b = -2 * a * k; // guarantees −b/(2a) = k exactly
  const c = randInt(rng, -9, 9);

  const eqStr = formatQuadraticY(a, b, c);
  const askVertex = randInt(rng, 1, 2) === 1;

  if (askVertex) {
    const numText = fmtSigned(-b);
    const denText = a < 0 ? `(${fmtSigned(a)})` : `${a}`;
    return {
      q: `Find the vertex x-coordinate of ${eqStr}.`,
      steps: [
        `a=${fmtSigned(a)},b=${fmtSigned(b)}.`,
        `x=${numText}/(2·${denText})=${fmtSigned(k)}.`,
      ],
      a: `x = ${fmtSigned(k)}`,
      diagram: { type: "parabola", direction: a > 0 ? "up" : "down", vertexLabel: `(${fmtSigned(k)}, ?)` },
    };
  }

  return {
    q: `Does ${eqStr} open up or down?`,
    steps: [`a=${fmtSigned(a)}, which is ${a > 0 ? "positive" : "negative"}.`],
    a: a > 0 ? "Opens upward" : "Opens downward",
  };
}

// ---- id 24: Exponent Rules ----------------------------------------------

function randExp(rng) {
  // Occasionally use a negative exponent (like the reference's x⁴·x⁻²).
  if (randInt(rng, 1, 4) === 1) return randNonZeroInt(rng, -4, -1);
  return randInt(rng, 1, 9);
}

function gen24(rng) {
  const rule = pick(rng, ["mul", "div", "pow"]);
  const a = randExp(rng);
  const b = randExp(rng);

  let q, result, stepLabel;
  if (rule === "mul") {
    result = a + b;
    q = `Simplify x${sup(a)} · x${sup(b)}.`;
    stepLabel = `Same base, add exponents: ${numTerm(a)}+${numTerm(b)}.`;
  } else if (rule === "div") {
    result = a - b;
    q = `Simplify x${sup(a)} / x${sup(b)}.`;
    stepLabel = `Same base, subtract exponents: ${numTerm(a)}−${numTerm(b)}.`;
  } else {
    result = a * b;
    q = `Simplify (x${sup(a)})${sup(b)}.`;
    stepLabel = `Power to a power, multiply exponents: ${numTerm(a)}×${numTerm(b)}.`;
  }

  const ans = result === 1 ? "x" : result === 0 ? "1" : `x${sup(result)}`;
  return { q, steps: [stepLabel], a: ans };
}

// ---- id 25: Simplifying Radical Expressions ------------------------------

const PERFECT_SQUARE_ROOTS = [2, 3, 4, 5, 6, 7, 8, 9, 10]; // k, so s=k²
const SQUAREFREE_REMAINDERS = [2, 3, 5, 6, 7, 10, 11, 13];

// Largest d such that d² divides n (used to verify s=k² is truly the
// largest perfect-square factor of n, not just *a* perfect-square factor).
function largestSquareFactor(n) {
  let best = 1;
  for (let d = 2; d * d <= n; d++) {
    if (n % (d * d) === 0) best = d * d;
  }
  return best;
}

function gen25(rng) {
  let k, m, n, s;
  do {
    k = pick(rng, PERFECT_SQUARE_ROOTS);
    m = pick(rng, SQUAREFREE_REMAINDERS);
    s = k * k;
    n = s * m;
  } while (largestSquareFactor(n) !== s);

  return {
    q: `Simplify √${n}.`,
    steps: [
      `${n} = ${s} × ${m}, and ${s} is a perfect square.`,
      `√${n} = √${s} · √${m} = ${k}√${m}.`,
    ],
    a: `${k}√${m}`,
  };
}

export default {
  22: gen22,
  23: gen23,
  24: gen24,
  25: gen25,
};
