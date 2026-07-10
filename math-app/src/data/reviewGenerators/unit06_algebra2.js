// Fresh, non-repeating "review quiz" problem generators for Unit 6
// (Algebra II), concept ids 32-39. Each function takes a seeded RNG and
// returns a brand-new, correctly-solved problem in the same
// { q, steps, a, diagram? } shape used by src/data/problems.js.
import { randInt, randNonZeroInt, pick } from "../../utils/seededRandom.js";

// ---- shared formatting helpers -----------------------------------------

const MINUS = "−";

// Plain signed number, e.g. 5 -> "5", -5 -> "−5".
function fmtNum(n) {
  return n < 0 ? `${MINUS}${Math.abs(n)}` : `${n}`;
}

// Magnitude string for a term with an optional variable suffix; omits the
// literal "1" when the suffix is "x" (coefficient of 1 reads as just "x").
function magStr(n, suffix) {
  const abs = Math.abs(n);
  if (suffix === "x" && abs === 1) return "x";
  return `${abs}${suffix}`;
}

// Tight (no interior spaces) signed term, e.g. tightTerm(3,"x") -> "+3x".
function tightTerm(n, suffix = "") {
  return `${n < 0 ? MINUS : "+"}${magStr(n, suffix)}`;
}

// Leading term (no forced "+" sign), e.g. leadTerm(4,"x") -> "4x".
function leadTerm(n, suffix = "") {
  return `${n < 0 ? MINUS : ""}${magStr(n, suffix)}`;
}

// Spaced signed term for use inside a larger expression,
// e.g. spacedTerm(8,"x") -> "+ 8x", spacedTerm(-9,"") -> "− 9".
function spacedTerm(n, suffix = "") {
  return `${n < 0 ? MINUS : "+"} ${magStr(n, suffix)}`;
}

const SUP_DIGITS = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
function toSuperscript(n) {
  return String(n).split("").map((ch) => SUP_DIGITS[ch] ?? ch).join("");
}

const SUB_DIGITS = { 0: "₀", 1: "₁", 2: "₂", 3: "₃", 4: "₄", 5: "₅", 6: "₆", 7: "₇", 8: "₈", 9: "₉" };
function toSubscript(n) {
  return String(n).split("").map((ch) => SUB_DIGITS[ch] ?? ch).join("");
}

function trimNum(x, maxDecimals = 6) {
  let s = x.toFixed(maxDecimals);
  s = s.replace(/0+$/, "").replace(/\.$/, "");
  return s;
}

function formatMoney(amount) {
  const rounded = Math.round(amount * 100) / 100;
  if (Number.isInteger(rounded)) {
    return `$${rounded.toLocaleString("en-US")}`;
  }
  return `$${rounded.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function reduceFrac(num, den) {
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = gcd(num, den) || 1;
  return [num / g, den / g];
}

// ---- id 32: Rational Exponents & Radical Equations ---------------------

const PERFECT_SQUARES = [4, 9, 16, 25, 36, 49, 64, 81, 100];
const PERFECT_CUBES = [8, 27, 64, 125];

function gen32(rng) {
  const variant = pick(rng, ["sqrt", "twothirds", "radicalEq", "threehalves"]);

  if (variant === "sqrt") {
    const base = pick(rng, PERFECT_SQUARES);
    const answer = Math.round(Math.sqrt(base));
    return {
      q: `Evaluate ${base}^(1/2).`,
      steps: [`${base}^(1/2) means the square root of ${base}.`],
      a: `${answer}`,
    };
  }

  if (variant === "twothirds") {
    const base = pick(rng, PERFECT_CUBES);
    const cubeRoot = Math.round(Math.cbrt(base));
    const answer = cubeRoot * cubeRoot;
    return {
      q: `Evaluate ${base}^(2/3).`,
      steps: [`${base}^(1/3) = ${cubeRoot} (cube root of ${base}).`, `${cubeRoot}² = ${answer}.`],
      a: `${answer}`,
    };
  }

  if (variant === "threehalves") {
    const base = pick(rng, PERFECT_SQUARES);
    const sqrtVal = Math.round(Math.sqrt(base));
    const answer = sqrtVal * sqrtVal * sqrtVal;
    return {
      q: `Evaluate ${base}^(3/2).`,
      steps: [`${base}^(1/2) = ${sqrtVal} (square root of ${base}).`, `${sqrtVal}³ = ${answer}.`],
      a: `${answer}`,
    };
  }

  // radicalEq: solve √(x + k) = m  ->  x = m² − k
  let k, m, x;
  do {
    k = randInt(rng, -9, 9);
    m = randInt(rng, 2, 9);
    x = m * m - k;
  } while (x < -50 || x > 200);

  const radicand = k === 0 ? "x" : `x ${spacedTerm(k, "")}`;
  return {
    q: `Solve √(${radicand}) = ${m}.`,
    steps: [`Square both sides: ${radicand} = ${m * m}.`, `x = ${fmtNum(x)}.`],
    a: `x = ${fmtNum(x)}`,
  };
}

// ---- id 33: Complex Numbers ---------------------------------------------

function fmtComplexNumber(re, im) {
  const sign = im < 0 ? MINUS : "+";
  const absIm = Math.abs(im);
  const imStr = absIm === 1 ? "i" : `${absIm}i`;
  return `${fmtNum(re)} ${sign} ${imStr}`;
}

function imagTermDisplay(n) {
  const abs = Math.abs(n);
  const body = abs === 1 ? "i" : `${abs}i`;
  return n < 0 ? `${MINUS}${body}` : body;
}

function gen33(rng) {
  const roll = randInt(rng, 1, 100);
  if (roll <= 15) {
    const which = pick(rng, ["i2", "i3", "i4"]);
    if (which === "i2") {
      return { q: "Simplify i².", steps: ["By definition, i² = −1."], a: "−1" };
    }
    if (which === "i3") {
      return { q: "Simplify i³.", steps: ["i³ = i²·i = −1·i = −i."], a: "−i" };
    }
    return { q: "Simplify i⁴.", steps: ["i⁴ = (i²)² = (−1)² = 1."], a: "1" };
  }

  const op = pick(rng, ["+", "−"]);
  let a1, a2, b1, b2, imag;
  do {
    a1 = randInt(rng, -9, 9);
    a2 = randInt(rng, -9, 9);
    b1 = randNonZeroInt(rng, -9, 9);
    b2 = randNonZeroInt(rng, -9, 9);
    imag = op === "+" ? b1 + b2 : b1 - b2;
  } while (imag === 0);
  const real = op === "+" ? a1 + a2 : a1 - a2;

  const q = `Simplify (${fmtComplexNumber(a1, b1)}) ${op} (${fmtComplexNumber(a2, b2)}).`;
  const steps = [
    `Real parts: ${fmtNum(a1)} ${op} ${fmtNum(a2)} = ${fmtNum(real)}.`,
    `Imaginary parts: ${imagTermDisplay(b1)} ${op} ${imagTermDisplay(b2)} = ${imagTermDisplay(imag)}.`,
  ];
  const a = fmtComplexNumber(real, imag);
  return { q, steps, a };
}

// ---- id 34: Completing the Square ---------------------------------------

function gen34(rng) {
  if (randInt(rng, 1, 100) <= 15) {
    const B = randInt(rng, 1, 10) * 2; // even, 2..20
    const half = B / 2;
    const answer = half * half;
    return {
      q: `What number completes the square for x² + ${B}x?`,
      steps: [`Take half of ${B}, then square it: (${B}/2)² = ${half}².`],
      a: `${answer}`,
    };
  }

  let r1, r2, b;
  do {
    r1 = randInt(rng, -9, 9);
    let r2Candidate;
    do {
      const delta = randInt(rng, -9, 9);
      r2Candidate = r1 + 2 * delta;
    } while (r2Candidate < -9 || r2Candidate > 9);
    r2 = r2Candidate;
    b = -(r1 + r2);
  } while (b === 0);

  const c = r1 * r2;
  const half = b / 2;
  const square = half * half;
  const rhs = square - c; // guaranteed perfect square: ((r1-r2)/2)^2
  const sqrtRhs = Math.abs(r1 - r2) / 2;
  const x1 = -half + sqrtRhs;
  const x2 = -half - sqrtRhs;

  const bTerm = `x² ${spacedTerm(b, "x")}`;
  const negC = -c;
  const halfTerm = tightTerm(half, "");

  const q = `Solve ${bTerm} ${spacedTerm(c, "")} = 0 by completing the square.`;
  const steps = [
    `Move constant: ${bTerm} = ${fmtNum(negC)}.`,
    `Add (${fmtNum(b)}/2)²=${square}: ${bTerm} + ${square} = ${rhs}.`,
    `(x${halfTerm})² = ${rhs} → x${halfTerm} = ±${sqrtRhs}.`,
  ];
  const a = x1 === x2 ? `x = ${fmtNum(x1)} (repeated)` : `x = ${fmtNum(x1)} or x = ${fmtNum(x2)}`;
  return { q, steps, a };
}

// ---- id 35: Polynomial Long Division -------------------------------------

function gen35(rng) {
  const k = randNonZeroInt(rng, -9, 9); // divisor is x + k, root is -k
  const r = randNonZeroInt(rng, -9, 9); // the other root
  const b = k + r;
  const c = k * r;

  const dividendParts = ["x²"];
  if (b !== 0) dividendParts.push(spacedTerm(b, "x"));
  dividendParts.push(spacedTerm(c, ""));
  const dividendStr = dividendParts.join(" ");
  const divisorStr = `x ${spacedTerm(k, "")}`;

  const remainder1 = `${leadTerm(r, "x")}${tightTerm(c, "")}`;
  const rk = r * k;
  const secondProduct = `${leadTerm(r, "x")}${tightTerm(rk, "")}`;

  const q = `Divide ${dividendStr} by ${divisorStr}.`;
  const steps = [
    `x² ÷ x = x; x(x${tightTerm(k, "")})=x²${tightTerm(k, "x")}; subtract: ${remainder1}.`,
    `${leadTerm(r, "x")} ÷ x = ${fmtNum(r)}; ${fmtNum(r)}(x${tightTerm(k, "")})=${secondProduct}; subtract: 0.`,
  ];
  const a = `x ${spacedTerm(r, "")} (no remainder)`;
  return { q, steps, a };
}

// ---- id 36: Rational Functions & Asymptotes ------------------------------

function gen36(rng) {
  const p = pick(rng, [1, 2, 3]);
  const q = randInt(rng, 1, 12);
  const sign = pick(rng, ["+", "−"]);
  const useLinearNumerator = randInt(rng, 1, 10) <= 3; // ~30%

  let xNum = sign === "+" ? -q : q;
  let xDen = p;
  [xNum, xDen] = reduceFrac(xNum, xDen);
  const Vstr = xDen === 1 ? fmtNum(xNum) : `${fmtNum(xNum)}/${xDen}`;

  const denomStr = `${p === 1 ? "x" : `${p}x`} ${sign} ${q}`;

  const steps = [`Set denominator to 0: ${denomStr} = 0.`];
  if (p !== 1) {
    const rhsValue = sign === "+" ? -q : q;
    steps.push(`${p}x = ${fmtNum(rhsValue)} → x = ${Vstr}.`);
  }

  let qStr;
  if (useLinearNumerator) {
    const k = randInt(rng, 1, 9);
    const numStr = k === 1 ? "x" : `${k}x`;
    qStr = `For f(x) = ${numStr}/(${denomStr}), what x-value is excluded from the domain?`;
  } else {
    const k = randInt(rng, 1, 9);
    qStr = `Find the vertical asymptote of f(x) = ${k}/(${denomStr}).`;
  }
  const aStr = `x = ${Vstr}`;

  const problem = { q: qStr, steps, a: aStr };
  if (xDen === 1 && Math.abs(xNum) <= 12) {
    problem.diagram = { type: "coordinatePlane", lines: [{ vertical: xNum, dashed: true, label: `x = ${Vstr}` }] };
  }
  return problem;
}

// ---- id 37: Exponential Functions: Growth & Decay ------------------------

const MONEY_AMOUNTS = [100, 200, 500, 1000, 2000, 5000, 10000];
const POP_AMOUNTS = [20, 50, 100, 200, 500, 1000];
const RATES = [2, 3, 4, 5, 6, 7, 8, 10, 15, 20];

function gen37(rng) {
  const variant = pick(rng, ["investment", "depreciation", "doubling", "decayPercent"]);
  const t = randInt(rng, 1, 4);

  if (variant === "investment") {
    const a = pick(rng, MONEY_AMOUNTS);
    const r = pick(rng, RATES);
    const base = 1 + r / 100;
    const powVal = Math.pow(base, t);
    const y = a * powVal;
    return {
      q: `A $${a.toLocaleString("en-US")} investment grows ${r}% per year. Find its value after ${t} year${t === 1 ? "" : "s"}.`,
      steps: [
        `y = ${a}(${trimNum(base)})^${t}.`,
        `${trimNum(base)}^${t} = ${trimNum(powVal)}.`,
        `${a} × ${trimNum(powVal)}.`,
      ],
      a: formatMoney(y),
    };
  }

  if (variant === "depreciation") {
    const a = pick(rng, MONEY_AMOUNTS);
    const r = pick(rng, RATES);
    const base = 1 - r / 100;
    const powVal = Math.pow(base, t);
    const y = a * powVal;
    return {
      q: `An item worth $${a.toLocaleString("en-US")} depreciates ${r}% per year. Find its value after ${t} year${t === 1 ? "" : "s"}.`,
      steps: [
        `y = ${a}(${trimNum(base)})^${t}.`,
        `${trimNum(base)}^${t} = ${trimNum(powVal)}.`,
        `${a} × ${trimNum(powVal)}.`,
      ],
      a: formatMoney(y),
    };
  }

  if (variant === "doubling") {
    const a = pick(rng, POP_AMOUNTS);
    const factor = pick(rng, [2, 3]);
    const y = a * Math.pow(factor, t);
    const verb = factor === 2 ? "doubles" : "triples";
    return {
      q: `A bacteria colony of ${a} ${verb} every hour. Find the population after ${t} hour${t === 1 ? "" : "s"}.`,
      steps: [
        `y = ${a}(${factor})^${t}.`,
        `${factor}^${t} = ${Math.pow(factor, t)}.`,
        `${a} × ${Math.pow(factor, t)}.`,
      ],
      a: `${y}`,
    };
  }

  // decayPercent
  const a = pick(rng, POP_AMOUNTS);
  const r = pick(rng, RATES);
  const base = 1 - r / 100;
  const powVal = Math.pow(base, t);
  const y = a * powVal;
  return {
    q: `A population of ${a} decays ${r}% per year. Find the population after ${t} year${t === 1 ? "" : "s"}.`,
    steps: [
      `y = ${a}(${trimNum(base)})^${t}.`,
      `${trimNum(base)}^${t} = ${trimNum(powVal)}.`,
      `${a} × ${trimNum(powVal)}.`,
    ],
    a: `≈ ${y.toFixed(1)}`,
  };
}

// ---- id 38: Logarithms: Introduction & Rules -----------------------------

const LOG_BASES = [2, 3, 4, 5, 10];

function gen38(rng) {
  if (randInt(rng, 1, 100) <= 25) {
    const b = pick(rng, LOG_BASES);
    const n1 = randInt(rng, 1, 4);
    const n2 = randInt(rng, 1, 4);
    const x1 = Math.pow(b, n1);
    const x2 = Math.pow(b, n2);
    const sub = toSubscript(b);
    return {
      q: `Simplify log${sub}(${x1}) + log${sub}(${x2}).`,
      steps: [`log${sub}(${x1})=${n1}, log${sub}(${x2})=${n2}.`, `${n1} + ${n2}.`],
      a: `${n1 + n2}`,
    };
  }

  const b = pick(rng, LOG_BASES);
  const n = randInt(rng, 1, 4);
  const x = Math.pow(b, n);
  const sub = toSubscript(b);
  return {
    q: `Evaluate log${sub}(${x}).`,
    steps: [`Ask: ${b} to what power gives ${x}?`, `${b}${toSuperscript(n)} = ${x}.`],
    a: `${n}`,
  };
}

// ---- id 39: Solving Exponential & Logarithmic Equations ------------------

const EQ_BASES = [2, 3, 4, 5];

function gen39(rng) {
  const variant = pick(rng, ["exp", "log"]);
  const b = pick(rng, EQ_BASES);
  const n = randInt(rng, 1, 5);

  if (variant === "exp") {
    const rhs = Math.pow(b, n);
    return {
      q: `Solve ${b}^x = ${rhs}.`,
      steps: [`Rewrite ${rhs} as a power of ${b}: ${rhs} = ${b}${toSuperscript(n)}.`, `So x = ${n}.`],
      a: `x = ${n}`,
    };
  }

  const x = Math.pow(b, n);
  const sub = toSubscript(b);
  return {
    q: `Solve log${sub}(x) = ${n}.`,
    steps: [`Rewrite in exponential form: ${b}${toSuperscript(n)} = x.`, `${b}${toSuperscript(n)} = ${x}.`],
    a: `x = ${x}`,
  };
}

export default {
  32: gen32,
  33: gen33,
  34: gen34,
  35: gen35,
  36: gen36,
  37: gen37,
  38: gen38,
  39: gen39,
};
