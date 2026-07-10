// Fresh, non-repeating "review quiz" problem generators for Unit 7
// (Precalculus Foundations), concept ids 40-43. Each function takes a
// seeded RNG and returns a brand-new, correctly-solved problem in the
// same { q, steps, a, diagram? } shape used by src/data/problems.js.
import { randInt, randNonZeroInt, pick } from "../../utils/seededRandom.js";

// Signed number with a unicode minus, e.g. fmt(-3) -> "−3".
function fmt(n) {
  return n < 0 ? `−${Math.abs(n)}` : `${n}`;
}

// "a−b" with the subtrahend parenthesized if negative, e.g. diffStr(3,-1) -> "3−(−1)".
function diffStr(a, b) {
  const bs = b < 0 ? `(${fmt(b)})` : fmt(b);
  return `${fmt(a)}−${bs}`;
}

// ---- id 40: Arithmetic & Geometric Sequences ----------------------------

function genGeometricNth(rng) {
  const a1 = randInt(rng, 1, 6);
  const r = pick(rng, [2, 3, -2]);
  const n = randInt(rng, 3, 6);
  const t2 = a1 * r;
  const t3 = a1 * r * r;
  const an = a1 * Math.pow(r, n - 1);
  return {
    q: `Find the ${n}th term of the geometric sequence ${fmt(a1)}, ${fmt(t2)}, ${fmt(t3)}...`,
    steps: [`Common ratio r = ${fmt(r)}.`, `a${subscript(n)} = ${fmt(a1)} × ${fmt(r)}^${n - 1}.`],
    a: `${fmt(an)}`,
  };
}

function genArithmeticNth(rng) {
  const a1 = randInt(rng, -9, 15);
  const d = randNonZeroInt(rng, -6, 6);
  const n = randInt(rng, 5, 12);
  const t2 = a1 + d;
  const t3 = a1 + 2 * d;
  const an = a1 + (n - 1) * d;
  return {
    q: `Find the ${n}th term of the arithmetic sequence ${fmt(a1)}, ${fmt(t2)}, ${fmt(t3)}...`,
    steps: [
      `a₁=${fmt(a1)}, d=${fmt(d)}.`,
      `a${subscript(n)} = ${fmt(a1)} + (${n}−1)(${fmt(d)}) = ${fmt(a1)} + ${fmt((n - 1) * d)}.`,
    ],
    a: `${fmt(an)}`,
  };
}

function genIdentifyType(rng) {
  const isArithmetic = randInt(rng, 1, 2) === 1;
  const a1 = randInt(rng, -9, 12);

  if (isArithmetic) {
    const d = randNonZeroInt(rng, -9, 9);
    const terms = [a1, a1 + d, a1 + 2 * d, a1 + 3 * d];
    return {
      q: `Is ${terms.map(fmt).join(", ")}... arithmetic or geometric?`,
      steps: [
        `Check the difference between terms: ${diffStr(terms[1], terms[0])}=${fmt(d)}, ${diffStr(terms[2], terms[1])}=${fmt(d)}, ${diffStr(terms[3], terms[2])}=${fmt(d)} — constant difference.`,
      ],
      a: `Arithmetic (d = ${fmt(d)})`,
    };
  }

  const start = randInt(rng, 1, 6);
  const r = pick(rng, [2, 3, -2]);
  const terms = [start, start * r, start * r * r, start * r * r * r];
  return {
    q: `Is ${terms.map(fmt).join(", ")}... arithmetic or geometric?`,
    steps: [
      `Check the ratio between terms: ${fmt(terms[1])}/${fmt(terms[0])}=${fmt(r)}, ${fmt(terms[2])}/${fmt(terms[1])}=${fmt(r)}, ${fmt(terms[3])}/${fmt(terms[2])}=${fmt(r)} — constant ratio.`,
    ],
    a: `Geometric (r = ${fmt(r)})`,
  };
}

function genCommonDifference(rng) {
  const a1 = randInt(rng, -20, 30);
  const d = randNonZeroInt(rng, -9, 9);
  const terms = [a1, a1 + d, a1 + 2 * d, a1 + 3 * d];
  return {
    q: `Find the common difference of the sequence ${terms.map(fmt).join(", ")}...`,
    steps: [`Subtract consecutive terms: ${diffStr(terms[1], terms[0])}=${fmt(d)}.`],
    a: `${fmt(d)}`,
  };
}

function subscript(n) {
  // Matches reference terseness: aₙ style subscripts aren't practical for
  // arbitrary n, so we spell "nth"-style numerals directly (e.g. a10, a4).
  return `${n}`;
}

function gen40(rng) {
  const variant = pick(rng, ["geometric", "arithmetic", "identify", "commonDiff"]);
  if (variant === "geometric") return genGeometricNth(rng);
  if (variant === "arithmetic") return genArithmeticNth(rng);
  if (variant === "identify") return genIdentifyType(rng);
  return genCommonDifference(rng);
}

// ---- id 41: Series & Summation Notation ---------------------------------

function genConsecutiveIntSum(rng) {
  const n = randInt(rng, 3, 6);
  const terms = Array.from({ length: n }, (_, i) => i + 1);
  const sum = (n * (n + 1)) / 2;
  return {
    q: `Find the sum of the first ${n} terms of ${terms.join(", ")}.`,
    steps: [`S_n = n(a₁+aₙ)/2 = ${n}(1+${n})/2.`, `${n} × ${n + 1} / 2.`],
    a: `${sum}`,
  };
}

function genArithmeticSeriesFormula(rng) {
  const a1 = randInt(rng, 1, 10);
  const d = randInt(rng, 1, 6);
  const n = randInt(rng, 4, 8);
  const t2 = a1 + d;
  const t3 = a1 + 2 * d;
  const an = a1 + (n - 1) * d;
  const sum = (n * (a1 + an)) / 2;
  return {
    q: `Find the sum of the first ${n} terms of the arithmetic sequence ${a1}, ${t2}, ${t3}...`,
    steps: [
      `a${n} = a1+(n−1)d=${a1}+(${n}−1)(${d})=${an}.`,
      `S${n} = n(a1+a${n})/2 = ${n}(${a1}+${an})/2 = ${n}×${a1 + an}/2.`,
    ],
    a: `${sum}`,
  };
}

function genGeometricSeriesDirect(rng) {
  const a1 = randInt(rng, 1, 5);
  const r = pick(rng, [2, 3]);
  const n = pick(rng, [3, 4]);
  const terms = [];
  let t = a1;
  for (let i = 0; i < n; i++) {
    terms.push(t);
    t *= r;
  }
  const sum = terms.reduce((s, v) => s + v, 0);
  return {
    q: `Find the sum of the first ${n} terms of the geometric sequence ${terms.join(", ")}.`,
    steps: [`Just add them directly: ${terms.join("+")}.`],
    a: `${sum}`,
  };
}

function genEvenlySpacedSum(rng) {
  const a1 = randInt(rng, 1, 5) * 10;
  const d = randInt(rng, 5, 20);
  const n = randInt(rng, 4, 6);
  const terms = Array.from({ length: n }, (_, i) => a1 + i * d);
  const an = terms[n - 1];
  const sum = (n * (a1 + an)) / 2;
  return {
    q: `Find the sum of the first ${n} terms of ${terms.join(", ")}.`,
    steps: [`S_n = n(a₁+aₙ)/2 = ${n}(${a1}+${an})/2.`, `${n} × ${a1 + an} / 2.`],
    a: `${sum}`,
  };
}

function gen41(rng) {
  const variant = pick(rng, ["consecutive", "arithmeticFormula", "geometricDirect", "evenlySpaced"]);
  if (variant === "consecutive") return genConsecutiveIntSum(rng);
  if (variant === "arithmeticFormula") return genArithmeticSeriesFormula(rng);
  if (variant === "geometricDirect") return genGeometricSeriesDirect(rng);
  return genEvenlySpacedSum(rng);
}

// ---- id 42: The Unit Circle & Radian Measure ----------------------------

const NICE_DEGREES = [30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

// Reduce deg/180 to lowest terms and format as a π-fraction string.
function degToRadianString(deg) {
  let num = deg;
  let den = 180;
  const g = gcd(num, den) || 1;
  num /= g;
  den /= g;
  if (den === 1) {
    return num === 1 ? "π" : `${num}π`;
  }
  return num === 1 ? `π/${den}` : `${num}π/${den}`;
}

function gen42(rng) {
  const deg = pick(rng, NICE_DEGREES);
  const radStr = degToRadianString(deg);
  const toRadians = randInt(rng, 1, 2) === 1;

  if (toRadians) {
    return {
      q: `Convert ${deg}° to radians.`,
      steps: [`Multiply by π/180: ${deg} × π/180.`],
      a: `${radStr} radians`,
      diagram: { type: "unitCircle", angleDeg: deg },
    };
  }

  return {
    q: `Convert ${radStr} radians to degrees.`,
    steps: [`Multiply by 180/π: (${radStr}) × (180/π).`],
    a: `${deg}°`,
    diagram: { type: "unitCircle", angleDeg: deg },
  };
}

// ---- id 43: Graphing Sine & Cosine Functions ----------------------------

function gen43(rng) {
  const variants = [
    () => ({
      q: "What is the amplitude and period of y = sin(x)?",
      steps: ["Amplitude: max distance from midline = 1.", "Period: length before it repeats = 2π."],
      a: "Amplitude 1, period 2π",
      diagram: { type: "sineCosine", which: "sin" },
    }),
    () => ({
      q: "What is the amplitude and period of y = cos(x)?",
      steps: ["Amplitude: max distance from midline = 1.", "Period: length before it repeats = 2π."],
      a: "Amplitude 1, period 2π",
      diagram: { type: "sineCosine", which: "cos" },
    }),
    () => ({
      q: "At x = 0, what is the value of sin(x)?",
      steps: ["sin(0) = 0, and the graph is rising there."],
      a: "0",
      diagram: { type: "sineCosine", which: "sin" },
    }),
    () => ({
      q: "At x = 0, what is the value of cos(x)?",
      steps: ["cos(0) = 1, and the graph is at its maximum there."],
      a: "1",
      diagram: { type: "sineCosine", which: "cos" },
    }),
    () => ({
      q: "What is the maximum value that both sin(x) and cos(x) ever reach?",
      steps: ["Both oscillate between −1 and 1 — their amplitude is 1."],
      a: "1",
      diagram: { type: "sineCosine", which: "sin" },
    }),
    () => ({
      q: "What is the minimum value that both sin(x) and cos(x) ever reach?",
      steps: ["Both oscillate between −1 and 1 — their amplitude is 1."],
      a: "−1",
      diagram: { type: "sineCosine", which: "cos" },
    }),
  ];
  return pick(rng, variants)();
}

export default {
  40: gen40,
  41: gen41,
  42: gen42,
  43: gen43,
};
