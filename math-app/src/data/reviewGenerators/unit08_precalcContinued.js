// Fresh, non-repeating "review quiz" problem generators for Unit 8
// (Precalculus, Continued), concept ids 44-53. Each function takes a
// seeded RNG and returns a brand-new, correctly-solved problem in the
// same { q, steps, a, diagram? } shape used by src/data/problems.js.
import { randInt, randNonZeroInt, pick } from "../../utils/seededRandom.js";

// Signed number with a unicode minus, e.g. fmt(-3) -> "−3", fmt(-0.5) -> "−0.5".
function fmt(n) {
  return n < 0 ? `−${Math.abs(n)}` : `${n}`;
}

// "a−b" with the subtrahend parenthesized if negative, e.g. diffStr(2,-3) -> "2−(−3)".
function diffStr(a, b) {
  const bs = b < 0 ? `(${fmt(b)})` : fmt(b);
  return `${fmt(a)}−${bs}`;
}

// ---- id 44: Trig Identities ---------------------------------------------

const PYTH_PAIRS_44 = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
];

function gen44(rng) {
  const variant = pick(rng, ["sincos", "conceptual", "tansec", "csccot"]);

  if (variant === "conceptual") {
    return {
      q: "Simplify sin²(x) + cos²(x).",
      steps: ["This is the Pythagorean identity — it always equals 1."],
      a: "1",
    };
  }

  if (variant === "tansec") {
    const k = randInt(rng, 2, 9);
    const sec2 = k * k + 1;
    return {
      q: `If tan(x) = ${k}, find sec²(x).`,
      steps: ["tan²(x) + 1 = sec²(x).", `${k}² + 1 = ${k * k} + 1.`],
      a: `${sec2}`,
    };
  }

  if (variant === "csccot") {
    const k = randInt(rng, 2, 10);
    return {
      q: `If csc²(x) = ${k}, find cot²(x).`,
      steps: ["1 + cot²(x) = csc²(x).", `cot²(x) = ${k} − 1.`],
      a: `${k - 1}`,
    };
  }

  // sincos: given sin(x), find cos(x) via the Pythagorean identity.
  const [leg1, leg2, hyp] = pick(rng, PYTH_PAIRS_44);
  const swap = randInt(rng, 0, 1) === 1;
  const given = swap ? leg2 : leg1;
  const other = swap ? leg1 : leg2;
  const given2 = given * given, hyp2 = hyp * hyp, other2 = other * other;
  return {
    q: `If sin(x) = ${given}/${hyp}, find cos(x) using the Pythagorean identity (x in quadrant I).`,
    steps: [
      "sin²(x) + cos²(x) = 1.",
      `cos²(x) + (${given}/${hyp})² = 1 → cos²(x) = 1 − ${given2}/${hyp2} = ${other2}/${hyp2}.`,
      `cos(x) = ${other}/${hyp}.`,
    ],
    a: `${other}/${hyp}`,
  };
}

// ---- id 45: Inverse Trigonometric Functions -----------------------------

const INV_TABLES_45 = {
  "sin⁻¹": {
    name: "sine",
    short: "sin",
    entries: [
      ["0", "0°"],
      ["1/2", "30°"],
      ["√2/2", "45°"],
      ["√3/2", "60°"],
      ["1", "90°"],
    ],
  },
  "cos⁻¹": {
    name: "cosine",
    short: "cos",
    entries: [
      ["1", "0°"],
      ["√3/2", "30°"],
      ["√2/2", "45°"],
      ["1/2", "60°"],
      ["0", "90°"],
    ],
  },
  "tan⁻¹": {
    name: "tangent",
    short: "tan",
    entries: [
      ["0", "0°"],
      ["√3/3", "30°"],
      ["1", "45°"],
      ["√3", "60°"],
    ],
  },
};

function gen45(rng) {
  const fnLabel = pick(rng, Object.keys(INV_TABLES_45));
  const table = INV_TABLES_45[fnLabel];
  const [value, angle] = pick(rng, table.entries);
  return {
    q: `Find ${fnLabel}(${value}).`,
    steps: [
      `Ask: what angle has a ${table.name} of ${value}?`,
      `${table.short}(${angle}) = ${value}.`,
    ],
    a: angle,
  };
}

// ---- id 46: Law of Sines -------------------------------------------------

const SIN_TABLE_46 = { 30: 0.5, 45: 0.70711, 60: 0.86603, 90: 1 };

function formatNum46(x) {
  const r2 = Math.round(x * 100) / 100;
  if (Number.isInteger(r2)) return `${r2}`;
  const r1 = Math.round(x * 10) / 10;
  if (Math.abs(r1 - r2) < 1e-9) return `≈ ${r1.toFixed(1)}`;
  return `≈ ${r2.toFixed(2)}`;
}

function genAnglesTriple46(rng) {
  for (let tries = 0; tries < 100; tries++) {
    const A = randInt(rng, 20, 100);
    const B = randInt(rng, 20, 100);
    const C = 180 - A - B;
    if (C < 20 || C > 140) continue;
    if (A === B || B === C || A === C) continue;
    const sorted = [A, B, C].slice().sort((x, y) => y - x);
    if (sorted[0] - sorted[1] < 5) continue; // ensure a clear largest angle
    return { A, B, C };
  }
  return { A: 40, B: 60, C: 80 }; // fallback, always valid
}

function gen46(rng) {
  const variant = pick(rng, ["side", "side", "side", "conceptual"]);

  if (variant === "conceptual") {
    const { A, B, C } = genAnglesTriple46(rng);
    let maxLetter = "a", maxVal = A;
    if (B > maxVal) { maxLetter = "b"; maxVal = B; }
    if (C > maxVal) { maxLetter = "c"; maxVal = C; }
    const maxUpper = maxLetter.toUpperCase();
    return {
      q: `A triangle has angles A = ${A}°, B = ${B}°, C = ${C}°. Which side is the longest?`,
      steps: [
        "The largest angle is opposite the longest side.",
        `Angle ${maxUpper} = ${maxVal}° is the largest.`,
      ],
      a: `Side ${maxLetter} (opposite angle ${maxUpper})`,
      diagram: { type: "triangle", sideA: "a", sideB: "b", sideC: "c" },
    };
  }

  let A, B;
  do {
    A = pick(rng, [30, 45, 60, 90]);
    B = pick(rng, [30, 45, 60, 90]);
  } while (A === 90 && B === 90);

  const a = randInt(rng, 4, 20);
  const raw = (a * SIN_TABLE_46[B]) / SIN_TABLE_46[A];
  const bStr = formatNum46(raw);

  return {
    q: `A triangle has angle A = ${A}°, angle B = ${B}°, and side a = ${a}. Find side b using the Law of Sines.`,
    steps: [
      "a/sin(A) = b/sin(B).",
      `${a}/sin(${A}°) = b/sin(${B}°).`,
      `${a}/${SIN_TABLE_46[A]} ≈ b/${SIN_TABLE_46[B]} → b ≈ ${a} × ${SIN_TABLE_46[B]}/${SIN_TABLE_46[A]}.`,
    ],
    a: bStr,
    diagram: { type: "triangle", sideA: `${a}`, sideB: "b", sideC: "c" },
  };
}

// ---- id 47: Law of Cosines ------------------------------------------------

const COS_TABLE_47 = { 60: 0.5, 90: 0, 120: -0.5 };
const TRIPLES_47 = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [9, 12, 15],
];

function gen47(rng) {
  const variant = pick(rng, ["c", "c", "c2", "sss"]);

  if (variant === "sss") {
    const [a, b, c] = pick(rng, TRIPLES_47);
    const num = a * a + b * b - c * c;
    const den = 2 * a * b;
    return {
      q: `A triangle has sides a=${a}, b=${b}, c=${c}. Find angle C using the Law of Cosines (is it 90°?).`,
      steps: [
        `cos(C) = (a²+b²−c²)/(2ab) = (${a * a}+${b * b}−${c * c})/(2·${a}·${b}).`,
        `= ${num}/${den} = 0.`,
        "cos(C)=0 means C=90°.",
      ],
      a: "90°",
      diagram: { type: "triangle", sideA: `${a}`, sideB: `${b}`, sideC: `${c}`, angleC: "C" },
    };
  }

  const C = pick(rng, [60, 90, 120]);
  const cosC = COS_TABLE_47[C];
  const a = randInt(rng, 3, 12);
  const b = randInt(rng, 3, 12);
  const cross = 2 * a * b * cosC; // always an integer (cosC is 0, 0.5, or -0.5)
  const c2 = a * a + b * b - cross;
  const root = Math.round(Math.sqrt(c2));
  const isPerfectSquare = root * root === c2;
  const cStr = isPerfectSquare ? `${root}` : `√${c2} ≈ ${Math.sqrt(c2).toFixed(1)}`;
  const sign = cross >= 0 ? "−" : "+";

  if (variant === "c2") {
    return {
      q: `A triangle has sides a=${a}, b=${b}, included angle C=${C}° (cos ${C}° = ${fmt(cosC)}). Find c².`,
      steps: [
        `c² = ${a}² + ${b}² − 2(${a})(${b})(${fmt(cosC)}).`,
        `= ${a * a}+${b * b} ${sign} ${Math.abs(cross)}.`,
      ],
      a: `${c2}`,
      diagram: { type: "triangle", sideA: `${a}`, sideB: `${b}`, sideC: "c", angleC: `${C}°` },
    };
  }

  return {
    q: `A triangle has sides a=${a}, b=${b}, and included angle C=${C}° (cos ${C}°=${fmt(cosC)}). Find side c.`,
    steps: [
      `c² = ${a}² + ${b}² − 2(${a})(${b})cos(${C}°).`,
      `= ${a * a} + ${b * b} − 2(${a})(${b})(${fmt(cosC)}) = ${a * a + b * b} ${sign} ${Math.abs(cross)}.`,
      `c² = ${c2} → c = √${c2}.`,
    ],
    a: cStr,
    diagram: { type: "triangle", sideA: `${a}`, sideB: `${b}`, sideC: "c", angleC: `${C}°` },
  };
}

// ---- id 48: Vectors: Introduction -----------------------------------------

const TRIPLES_48 = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [9, 12, 15],
];

function fmtAdd48(x, y) {
  return y < 0 ? `${fmt(x)}+(${fmt(y)})=${fmt(x + y)}` : `${fmt(x)}+${fmt(y)}=${fmt(x + y)}`;
}
function fmtSub48(x, y) {
  return y < 0 ? `${fmt(x)}−(${fmt(y)})=${fmt(x - y)}` : `${fmt(x)}−${fmt(y)}=${fmt(x - y)}`;
}

function gen48(rng) {
  const op = pick(rng, ["add", "subtract", "magnitude", "scalar"]);

  if (op === "add") {
    const x1 = randInt(rng, -9, 9), y1 = randInt(rng, -9, 9);
    const x2 = randInt(rng, -9, 9), y2 = randInt(rng, -9, 9);
    const rx = x1 + x2, ry = y1 + y2;
    return {
      q: `Add the vectors ⟨${fmt(x1)}, ${fmt(y1)}⟩ and ⟨${fmt(x2)}, ${fmt(y2)}⟩.`,
      steps: [`Add x-components: ${fmtAdd48(x1, x2)}.`, `Add y-components: ${fmtAdd48(y1, y2)}.`],
      a: `⟨${fmt(rx)}, ${fmt(ry)}⟩`,
      diagram: { type: "vector", x: rx, y: ry },
    };
  }

  if (op === "subtract") {
    const x1 = randInt(rng, -9, 9), y1 = randInt(rng, -9, 9);
    const x2 = randInt(rng, -9, 9), y2 = randInt(rng, -9, 9);
    const rx = x1 - x2, ry = y1 - y2;
    return {
      q: `Subtract ⟨${fmt(x1)}, ${fmt(y1)}⟩ − ⟨${fmt(x2)}, ${fmt(y2)}⟩.`,
      steps: [`Subtract x-components: ${fmtSub48(x1, x2)}.`, `Subtract y-components: ${fmtSub48(y1, y2)}.`],
      a: `⟨${fmt(rx)}, ${fmt(ry)}⟩`,
      diagram: { type: "vector", x: rx, y: ry },
    };
  }

  if (op === "magnitude") {
    const [xa, ya, mag] = pick(rng, TRIPLES_48);
    const x = pick(rng, [1, -1]) * xa;
    const y = pick(rng, [1, -1]) * ya;
    return {
      q: `Find the magnitude of the vector ⟨${fmt(x)}, ${fmt(y)}⟩.`,
      steps: [`Magnitude = √(x²+y²) = √(${x * x}+${y * y}).`, `√${x * x + y * y}.`],
      a: `${mag}`,
    };
  }

  // scalar
  const x = randInt(rng, -9, 9), y = randInt(rng, -9, 9);
  let k;
  do { k = randInt(rng, -5, 5); } while (k === 0 || k === 1);
  const rx = k * x, ry = k * y;
  return {
    q: `Multiply the vector ⟨${fmt(x)}, ${fmt(y)}⟩ by the scalar ${fmt(k)}.`,
    steps: [`Multiply each component by ${fmt(k)}: ${fmt(k)}×${fmt(x)}=${fmt(rx)}, ${fmt(k)}×${fmt(y)}=${fmt(ry)}.`],
    a: `⟨${fmt(rx)}, ${fmt(ry)}⟩`,
    diagram: { type: "vector", x: rx, y: ry },
  };
}

// ---- id 49: Matrices: Introduction -----------------------------------------

function gen49(rng) {
  const op = pick(rng, ["add", "subtract", "scalar", "dims"]);

  if (op === "add") {
    const a1 = randInt(rng, -9, 9), b1 = randInt(rng, -9, 9), c1 = randInt(rng, -9, 9), d1 = randInt(rng, -9, 9);
    const a2 = randInt(rng, -9, 9), b2 = randInt(rng, -9, 9), c2 = randInt(rng, -9, 9), d2 = randInt(rng, -9, 9);
    return {
      q: `Add the matrices [[${fmt(a1)},${fmt(b1)}],[${fmt(c1)},${fmt(d1)}]] and [[${fmt(a2)},${fmt(b2)}],[${fmt(c2)},${fmt(d2)}]].`,
      steps: [`Add corresponding entries: ${fmt(a1)}+${fmt(a2)}, ${fmt(b1)}+${fmt(b2)}, ${fmt(c1)}+${fmt(c2)}, ${fmt(d1)}+${fmt(d2)}.`],
      a: `[[${fmt(a1 + a2)},${fmt(b1 + b2)}],[${fmt(c1 + c2)},${fmt(d1 + d2)}]]`,
    };
  }

  if (op === "subtract") {
    const a1 = randInt(rng, -9, 9), b1 = randInt(rng, -9, 9), c1 = randInt(rng, -9, 9), d1 = randInt(rng, -9, 9);
    const a2 = randInt(rng, -9, 9), b2 = randInt(rng, -9, 9), c2 = randInt(rng, -9, 9), d2 = randInt(rng, -9, 9);
    return {
      q: `Subtract [[${fmt(a1)},${fmt(b1)}],[${fmt(c1)},${fmt(d1)}]] − [[${fmt(a2)},${fmt(b2)}],[${fmt(c2)},${fmt(d2)}]].`,
      steps: [`Subtract corresponding entries: ${diffStr(a1, a2)},${diffStr(b1, b2)},${diffStr(c1, c2)},${diffStr(d1, d2)}.`],
      a: `[[${fmt(a1 - a2)},${fmt(b1 - b2)}],[${fmt(c1 - c2)},${fmt(d1 - d2)}]]`,
    };
  }

  if (op === "scalar") {
    const a = randInt(rng, -9, 9), b = randInt(rng, -9, 9), c = randInt(rng, -9, 9), d = randInt(rng, -9, 9);
    let k;
    do { k = randInt(rng, -5, 5); } while (k === 0 || k === 1);
    return {
      q: `Multiply the matrix [[${fmt(a)},${fmt(b)}],[${fmt(c)},${fmt(d)}]] by the scalar ${fmt(k)}.`,
      steps: [`Multiply every entry by ${fmt(k)}: ${fmt(k * a)},${fmt(k * b)},${fmt(k * c)},${fmt(k * d)}.`],
      a: `[[${fmt(k * a)},${fmt(k * b)}],[${fmt(k * c)},${fmt(k * d)}]]`,
    };
  }

  // dims
  const r = randInt(rng, 2, 4), c = randInt(rng, 2, 4);
  const rows = [];
  for (let i = 0; i < r; i++) {
    const row = [];
    for (let j = 0; j < c; j++) row.push(fmt(randInt(rng, -9, 9)));
    rows.push(`[${row.join(",")}]`);
  }
  const matStr = `[${rows.join(",")}]`;
  return {
    q: `What is the size (dimensions) of the matrix ${matStr}?`,
    steps: [`Count rows (${r}) and columns (${c}).`],
    a: `${r} × ${c}`,
  };
}

// ---- id 50: Conic Sections: Circles & Ellipses -----------------------------

const SQUARES_50 = [4, 9, 16, 25, 36, 49, 64, 81, 100];
const SQUARES_50_SMALL = [4, 9, 16, 25, 36, 49];

function fmtBinom50(v, h) {
  if (h === 0) return `${v}²`;
  if (h > 0) return `(${v}−${h})²`;
  return `(${v}+${Math.abs(h)})²`;
}

function gen50(rng) {
  const variant = pick(rng, ["radius", "writeEq", "ellipse", "identify"]);

  if (variant === "radius") {
    const R2 = pick(rng, SQUARES_50);
    const h = randInt(rng, -9, 9), k = randInt(rng, -9, 9);
    const R = Math.sqrt(R2);
    return {
      q: `Find the radius of the circle ${fmtBinom50("x", h)} + ${fmtBinom50("y", k)} = ${R2}.`,
      steps: [`Compare to (x−h)²+(y−k)²=r²: h=${fmt(h)}, k=${fmt(k)}, r²=${R2}.`, `r = √${R2} = ${R}.`],
      a: `${R}`,
      diagram: { type: "conic", kind: "circle" },
    };
  }

  if (variant === "writeEq") {
    const h = randInt(rng, -9, 9), k = randInt(rng, -9, 9), r = randInt(rng, 2, 12);
    const r2 = r * r;
    return {
      q: `Write the equation of a circle centered at (${fmt(h)},${fmt(k)}) with radius ${r}.`,
      steps: [`(x−h)²+(y−k)²=r² with h=${fmt(h)}, k=${fmt(k)}, r=${r}.`],
      a: `${fmtBinom50("x", h)} + ${fmtBinom50("y", k)} = ${r2}`,
      diagram: { type: "conic", kind: "circle" },
    };
  }

  if (variant === "ellipse") {
    let a2, b2;
    do {
      a2 = pick(rng, SQUARES_50_SMALL);
      b2 = pick(rng, SQUARES_50_SMALL);
    } while (a2 === b2);
    const a = Math.sqrt(a2), b = Math.sqrt(b2);
    return {
      q: `For the ellipse x²/${a2} + y²/${b2} = 1, find a and b.`,
      steps: [`Compare to x²/a² + y²/b² = 1: a²=${a2}, b²=${b2}.`, `a=${a}, b=${b}.`],
      a: `a = ${a}, b = ${b}`,
    };
  }

  // identify
  const N = pick(rng, SQUARES_50);
  return {
    q: `Is x² + y² = ${N} a circle or an ellipse?`,
    steps: [
      `The coefficients under x² and y² are equal (both effectively 1 after dividing by ${N}).`,
      "Equal a and b means it's a circle.",
    ],
    a: `Circle (radius ${Math.sqrt(N)})`,
    diagram: { type: "conic", kind: "circle" },
  };
}

// ---- id 51: Conic Sections: Parabolas & Hyperbolas -------------------------

const SQUARES_51 = [4, 9, 16, 25, 36, 49];

function fmtCoef51(a) {
  if (a === 1) return "";
  if (a === -1) return "−";
  return a < 0 ? `−${Math.abs(a)}` : `${a}`;
}

function fmtParabola51(a, h, k) {
  const coefStr = fmtCoef51(a);
  const xPart = h === 0 ? "x²" : h > 0 ? `(x−${h})²` : `(x+${Math.abs(h)})²`;
  const kTerm = k === 0 ? "" : k > 0 ? ` + ${k}` : ` − ${Math.abs(k)}`;
  return `y = ${coefStr}${xPart}${kTerm}`;
}

function gen51(rng) {
  const variant = pick(rng, ["updown", "vertex", "conic"]);

  if (variant === "updown") {
    const a = randNonZeroInt(rng, -5, 5);
    const h = randInt(rng, -9, 9), k = randInt(rng, -9, 9);
    const full = fmtParabola51(a, h, k);
    return {
      q: `Does ${full} open up or down?`,
      steps: [`The coefficient a=${fmt(a)} is ${a > 0 ? "positive" : "negative"}.`],
      a: a > 0 ? "Opens upward" : "Opens downward",
    };
  }

  if (variant === "vertex") {
    const a = randNonZeroInt(rng, -5, 5);
    const h = randInt(rng, -9, 9), k = randInt(rng, -9, 9);
    const full = fmtParabola51(a, h, k);
    return {
      q: `Find the vertex of the parabola ${full}.`,
      steps: [`Compare to y=a(x−h)²+k: h=${fmt(h)}, k=${fmt(k)}.`],
      a: `(${fmt(h)}, ${fmt(k)})`,
    };
  }

  // conic: ellipse vs hyperbola
  let a2, b2;
  do {
    a2 = pick(rng, SQUARES_51);
    b2 = pick(rng, SQUARES_51);
  } while (a2 === b2);
  const isEllipse = pick(rng, ["+", "-"]) === "+";
  return {
    q: `Does x²/${a2} ${isEllipse ? "+" : "−"} y²/${b2} = 1 describe an ellipse or a hyperbola?`,
    steps: [`The two squared terms are separated by a ${isEllipse ? "plus" : "minus"} sign.`],
    a: isEllipse ? "Ellipse" : "Hyperbola",
    diagram: { type: "conic", kind: isEllipse ? "ellipse" : "hyperbola" },
  };
}

// ---- id 52: Limits: Intuitive Introduction ---------------------------------

function gen52(rng) {
  const variant = pick(rng, ["direct", "removable", "constant", "removableLinear"]);

  if (variant === "direct") {
    const k = randInt(rng, -9, 9);
    const a = randInt(rng, -9, 9);
    const kStr = k >= 0 ? `+ ${k}` : `− ${Math.abs(k)}`;
    return {
      q: `Find lim(x→${fmt(a)}) (x ${kStr}).`,
      steps: [`This function is continuous everywhere, so just substitute: ${fmt(a)} ${kStr}.`],
      a: `${fmt(a + k)}`,
    };
  }

  if (variant === "constant") {
    const c = randInt(rng, -9, 20);
    const t = randInt(rng, -9, 9);
    return {
      q: `Find lim(x→${fmt(t)}) ${fmt(c)}.`,
      steps: ["The limit of a constant is just that constant, regardless of x."],
      a: `${fmt(c)}`,
    };
  }

  if (variant === "removable") {
    const r = randNonZeroInt(rng, -9, 9);
    const xMinusR = r >= 0 ? `x − ${r}` : `x + ${Math.abs(r)}`;
    const xPlusR = r >= 0 ? `x+${r}` : `x−${Math.abs(r)}`;
    return {
      q: `Find lim(x→${fmt(r)}) (x² − ${r * r})/(${xMinusR}).`,
      steps: [
        `Factor: (${xMinusR})(${xPlusR})/(${xMinusR}) = ${xPlusR} for x≠${fmt(r)}.`,
        `As x→${fmt(r)}, ${xPlusR} → ${fmt(2 * r)}.`,
      ],
      a: `${fmt(2 * r)}`,
    };
  }

  // removableLinear: (x² − rx)/(x − r) = x(x−r)/(x−r) = x → limit r
  const r = randNonZeroInt(rng, -9, 9);
  const xMinusR = r >= 0 ? `x − ${r}` : `x + ${Math.abs(r)}`;
  const rxTerm = r >= 0 ? `− ${r}x` : `+ ${Math.abs(r)}x`;
  return {
    q: `Find lim(x→${fmt(r)}) (x² ${rxTerm})/(${xMinusR}).`,
    steps: [
      `Factor: x² ${rxTerm} = x(${xMinusR}).`,
      `x(${xMinusR})/(${xMinusR}) = x for x≠${fmt(r)}.`,
      `As x→${fmt(r)}, x → ${fmt(r)}.`,
    ],
    a: `${fmt(r)}`,
  };
}

// ---- id 53: Continuity ------------------------------------------------------

function genRationalForm53(rng) {
  const k = randInt(rng, 1, 9);
  const sign = pick(rng, ["+", "-"]);
  const formStr = sign === "+" ? `x+${k}` : `x−${k}`;
  const discontinuityPoint = sign === "+" ? -k : k;
  return { formStr, discontinuityPoint };
}

function gen53(rng) {
  const variant = pick(rng, ["polyYes", "rationalCheck", "whereDiscontinuous", "conceptual"]);

  if (variant === "conceptual") {
    return {
      q: "Is every polynomial function continuous everywhere?",
      steps: ["Polynomials have no denominators or breaks — they're defined and smooth for every real x."],
      a: "Yes",
    };
  }

  if (variant === "polyYes") {
    const k = randInt(rng, -9, 9);
    const kStr = k === 0 ? "" : k > 0 ? ` + ${k}` : ` − ${Math.abs(k)}`;
    const a = randInt(rng, -9, 9);
    return {
      q: `Is f(x) = x²${kStr} continuous at x = ${fmt(a)}?`,
      steps: [`Polynomials are continuous everywhere, including x=${fmt(a)}.`],
      a: "Yes",
    };
  }

  if (variant === "whereDiscontinuous") {
    const { formStr, discontinuityPoint } = genRationalForm53(rng);
    return {
      q: `Where is f(x) = 1/(${formStr}) discontinuous?`,
      steps: [`The denominator is 0 when ${formStr}=0.`, `x = ${fmt(discontinuityPoint)}.`],
      a: `x = ${fmt(discontinuityPoint)}`,
    };
  }

  // rationalCheck
  const { formStr, discontinuityPoint } = genRationalForm53(rng);
  const isDiscontinuousCase = randInt(rng, 1, 2) === 1;
  let testPoint;
  if (isDiscontinuousCase) {
    testPoint = discontinuityPoint;
  } else {
    do { testPoint = randInt(rng, -9, 9); } while (testPoint === discontinuityPoint);
  }

  if (isDiscontinuousCase) {
    return {
      q: `Is f(x) = 1/(${formStr}) continuous at x = ${fmt(testPoint)}?`,
      steps: [`f(${fmt(testPoint)}) is undefined (division by zero).`],
      a: `No — discontinuous at x = ${fmt(testPoint)}`,
    };
  }

  return {
    q: `Is f(x) = 1/(${formStr}) continuous at x = ${fmt(testPoint)}?`,
    steps: [`The denominator (${formStr}) isn't 0 at x=${fmt(testPoint)}, so f(${fmt(testPoint)}) is defined.`],
    a: "Yes",
  };
}

export default {
  44: gen44,
  45: gen45,
  46: gen46,
  47: gen47,
  48: gen48,
  49: gen49,
  50: gen50,
  51: gen51,
  52: gen52,
  53: gen53,
};
