// Fresh, non-repeating "review quiz" problem generators for Unit 3
// (Polynomials & Factoring), concept ids 16-21. Each function takes a
// seeded RNG and returns a brand-new, correctly-solved problem in the
// same { q, steps, a } shape used by src/data/problems.js.
import { randInt, randNonZeroInt, pick } from "../../utils/seededRandom.js";

// ---- shared formatting helpers -----------------------------------------

// Format a magnitude (nonnegative) + label, omitting a coefficient of 1
// unless the label is empty (a bare constant).
function magTerm(n, label) {
  if (label === "") return `${n}`;
  return n === 1 ? label : `${n}${label}`;
}

// Format a single signed value on its own (used for First/Outer/Inner/Last
// style lines): shows a leading "−" for negatives, nothing for positives.
function soloTerm(coef, label) {
  return buildExpr([{ coef, label }], false);
}

// Build a polynomial expression string from an ordered list of
// { coef, label } terms, skipping zero-coefficient terms. The first
// surviving term shows a leading sign only if negative; later terms
// always show an explicit "+" or "−". `spaced` toggles " + "/" − " vs "+"/"−".
function buildExpr(terms, spaced) {
  const nz = terms.filter((t) => t.coef !== 0);
  if (nz.length === 0) return "0";
  return nz
    .map((t, i) => {
      const core = magTerm(Math.abs(t.coef), t.label);
      if (i === 0) return t.coef < 0 ? `−${core}` : core;
      const sign = t.coef < 0 ? "−" : "+";
      return spaced ? ` ${sign} ${core}` : `${sign}${core}`;
    })
    .join("");
}

function fmtNum(n) {
  return n < 0 ? `−${Math.abs(n)}` : `${n}`;
}

function gcdInt(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

// ---- id 16: Adding & Subtracting Polynomials ---------------------------

function gen16(rng) {
  const a1 = randInt(rng, 1, 7), b1 = randInt(rng, -9, 9), c1 = randInt(rng, -9, 9);
  const a2 = randInt(rng, 1, 7), b2 = randInt(rng, -9, 9), c2 = randInt(rng, -9, 9);
  const op = pick(rng, ["+", "−"]);

  const poly1 = [{ coef: a1, label: "x²" }, { coef: b1, label: "x" }, { coef: c1, label: "" }];
  const poly2 = [{ coef: a2, label: "x²" }, { coef: b2, label: "x" }, { coef: c2, label: "" }];

  const poly1Str = buildExpr(poly1, true);
  const poly2Str = buildExpr(poly2, true);
  const q = `(${poly1Str}) ${op} (${poly2Str})`;

  // Effective second polynomial after applying the operation (negated if subtracting).
  const eff2 = op === "+" ? poly2 : poly2.map((t) => ({ coef: -t.coef, label: t.label }));

  const finalTerms = poly1.map((t, i) => ({ coef: t.coef + eff2[i].coef, label: t.label }));
  const aStr = buildExpr(finalTerms, true);

  const groupParts = poly1
    .map((t, i) => {
      const c2t = eff2[i];
      if (t.coef === 0 && c2t.coef === 0) return null;
      return `(${buildExpr([t, c2t], false)})`;
    })
    .filter(Boolean);
  const groupsJoined = groupParts.join(" + ");

  let steps;
  if (op === "+") {
    steps = [`Combine like terms: ${groupsJoined}.`, `${aStr}.`];
  } else {
    const flat = [...poly1, ...eff2];
    const distributeExpr = buildExpr(flat, false);
    steps = [`Distribute negative: ${distributeExpr}.`, `Combine: ${groupsJoined}.`];
  }

  return { q, steps, a: aStr };
}

// ---- id 17: Multiplying Polynomials (FOIL) ------------------------------

function gen17(rng) {
  const p = pick(rng, [1, 2, 3]);
  const m = randNonZeroInt(rng, -9, 9);
  const n = randNonZeroInt(rng, -9, 9);

  const poly1 = `${p === 1 ? "" : p}x ${m >= 0 ? "+" : "−"} ${Math.abs(m)}`;
  const poly2 = `x ${n >= 0 ? "+" : "−"} ${Math.abs(n)}`;
  const q = `(${poly1})(${poly2})`;

  const F = p; // p*q, q=1
  const O = p * n;
  const I = m; // m*q, q=1
  const L = m * n;
  const B = O + I;

  const steps = [
    `First: ${magTerm(F, "x²")}.`,
    `Outer: ${soloTerm(O, "x")}.`,
    `Inner: ${soloTerm(I, "x")}.`,
    `Last: ${soloTerm(L, "")}.`,
    `Combine: ${buildExpr([{ coef: F, label: "x²" }, { coef: O, label: "x" }, { coef: I, label: "x" }, { coef: L, label: "" }], false)}.`,
  ];

  const a = buildExpr([{ coef: F, label: "x²" }, { coef: B, label: "x" }, { coef: L, label: "" }], true);

  return { q, steps, a };
}

// ---- id 18: Factoring: Greatest Common Factor ---------------------------

function gen18(rng) {
  const shape = pick(rng, ["x2x", "x3x2", "xconst"]);
  const k = randInt(rng, 2, 9);

  let p, q2;
  do {
    p = randInt(rng, 1, 6);
    q2 = randInt(rng, 1, 6);
  } while (gcdInt(p, q2) !== 1);
  // Construction guarantees gcd(k*p, k*q2) === k exactly.

  const op = pick(rng, ["+", "−"]);
  const c1 = k * p;
  const c2 = k * q2;

  let label1, label2, gcfLabel, remLabel1, remLabel2;
  if (shape === "x2x") {
    label1 = "x²"; label2 = "x"; gcfLabel = "x"; remLabel1 = "x"; remLabel2 = "";
  } else if (shape === "x3x2") {
    label1 = "x³"; label2 = "x²"; gcfLabel = "x²"; remLabel1 = "x"; remLabel2 = "";
  } else {
    label1 = "x"; label2 = ""; gcfLabel = ""; remLabel1 = "x"; remLabel2 = "";
  }

  const term1Str = magTerm(c1, label1);
  const term2Str = magTerm(c2, label2);
  const gcfStr = magTerm(k, gcfLabel);
  const rem1Str = magTerm(p, remLabel1);
  const rem2Str = magTerm(q2, remLabel2);

  const q = `Factor ${term1Str} ${op} ${term2Str}.`;
  const steps = [
    `GCF of ${term1Str} and ${term2Str} is ${gcfStr}.`,
    `${term1Str}÷${gcfStr}=${rem1Str}, ${term2Str}÷${gcfStr}=${rem2Str}.`,
  ];
  const a = `${gcfStr}(${rem1Str} ${op} ${rem2Str})`;

  return { q, steps, a };
}

// ---- id 19: Factoring Trinomials -----------------------------------------

function gen19(rng) {
  const r1 = randNonZeroInt(rng, -9, 9);
  const r2 = randNonZeroInt(rng, -9, 9);
  const b = r1 + r2;
  const c = r1 * r2;

  const exprStr = buildExpr([{ coef: 1, label: "x²" }, { coef: b, label: "x" }, { coef: c, label: "" }], true);
  const q = `Factor ${exprStr}.`;

  const steps = [
    `Need two numbers that multiply to ${fmtNum(c)}, adding to ${fmtNum(b)}.`,
    `${fmtNum(r1)} and ${fmtNum(r2)} work: ${fmtNum(r1)}×${fmtNum(r2)}=${fmtNum(c)}, ${fmtNum(r1)}+${fmtNum(r2)}=${fmtNum(b)}.`,
  ];

  const a = `(x ${r1 >= 0 ? "+" : "−"} ${Math.abs(r1)})(x ${r2 >= 0 ? "+" : "−"} ${Math.abs(r2)})`;

  return { q, steps, a };
}

// ---- id 20: Difference of Squares -----------------------------------------

function gen20(rng) {
  const aCoef = pick(rng, [1, 2, 3, 4, 5]);
  const b = randInt(rng, 1, 12);

  const axLabel = aCoef === 1 ? "x" : `${aCoef}x`;
  const leadStr = magTerm(aCoef * aCoef, "x²");
  const constStr = `${b * b}`;

  const q = `Factor ${leadStr} − ${constStr}.`;
  const steps = [
    `${leadStr} = (${axLabel})², ${constStr} = ${b}².`,
    `(${axLabel}+${b})(${axLabel}−${b}).`,
  ];
  const a = `(${axLabel} + ${b})(${axLabel} − ${b})`;

  return { q, steps, a };
}

// ---- id 21: Solving Quadratics by Factoring --------------------------------

function genTwoRoots(rng) {
  const r1 = randNonZeroInt(rng, -9, 9);
  const r2 = randNonZeroInt(rng, -9, 9);
  const B = -(r1 + r2);
  const C = r1 * r2;

  const exprStr = buildExpr([{ coef: 1, label: "x²" }, { coef: B, label: "x" }, { coef: C, label: "" }], true);
  const q = `Solve ${exprStr} = 0.`;

  const sign1 = r1 >= 0 ? "−" : "+";
  const sign2 = r2 >= 0 ? "−" : "+";
  const abs1 = Math.abs(r1), abs2 = Math.abs(r2);
  const factorStr = `(x ${sign1} ${abs1})(x ${sign2} ${abs2})=0`;

  const steps = [
    `Factor: ${factorStr}.`,
    `x${sign1}${abs1}=0 or x${sign2}${abs2}=0.`,
  ];
  const a = `x = ${fmtNum(r1)} or x = ${fmtNum(r2)}`;

  return { q, steps, a };
}

function genDiffSquares(rng) {
  const k = randInt(rng, 2, 9);
  const q = `Solve x² − ${k * k} = 0.`;
  const steps = [
    `Factor: (x + ${k})(x − ${k})=0.`,
    `x + ${k}=0 or x − ${k}=0.`,
  ];
  const a = `x = −${k} or x = ${k}`;
  return { q, steps, a };
}

function genZeroRoot(rng) {
  const r = randNonZeroInt(rng, -9, 9);
  const sign = r >= 0 ? "−" : "+";
  const abs = Math.abs(r);
  const q = `Solve x² ${sign} ${abs}x = 0.`;
  const factorStr = `x(x${sign}${abs})=0`;
  const steps = [
    `Factor out x: ${factorStr}.`,
    `x=0 or x${sign}${abs}=0.`,
  ];
  const a = `x = 0 or x = ${fmtNum(r)}`;
  return { q, steps, a };
}

function gen21(rng) {
  const kind = pick(rng, ["twoRoots", "diffSquares", "zeroRoot"]);
  if (kind === "diffSquares") return genDiffSquares(rng);
  if (kind === "zeroRoot") return genZeroRoot(rng);
  return genTwoRoots(rng);
}

export default {
  16: gen16,
  17: gen17,
  18: gen18,
  19: gen19,
  20: gen20,
  21: gen21,
};
