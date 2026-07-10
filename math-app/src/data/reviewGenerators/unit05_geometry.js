// Fresh, non-repeating "review quiz" problem generators for Unit 5
// (Geometry), concept ids 26-31. Each function takes a seeded RNG and
// returns a brand-new, correctly-solved problem in the same
// { q, steps, a, diagram? } shape used by src/data/problems.js.
import { randInt, randNonZeroInt, pick } from "../../utils/seededRandom.js";

// ---- shared helpers -----------------------------------------------------

// Round to 2 decimals and strip trailing zeros (314.00 -> "314", 141.30 -> "141.3").
function fmt2(x) {
  return String(Math.round(x * 100) / 100);
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

// Unicode minus for negative numbers, matching the reference notation.
function fmtNum(n) {
  return n < 0 ? `−${Math.abs(n)}` : `${n}`;
}

// Wrap a negative number in parens when it follows a +/− in an expression,
// e.g. "6+(−2)" or "1−(−2)".
function wrapNeg(n) {
  return n < 0 ? `(${fmtNum(n)})` : fmtNum(n);
}

// ---- id 26: Triangle Congruence & Similarity ----------------------------

function genScaleFactor(rng) {
  const k = randInt(rng, 2, 5);
  const s = randInt(rng, 2, 12);
  const bigger = s * k;
  return {
    q: `Two similar triangles have a scale factor of ${k}. A side of the smaller triangle is ${s}. Find the corresponding side of the larger triangle.`,
    steps: [`Multiply by the scale factor: ${s} × ${k}.`],
    a: `${bigger}`,
  };
}

function genAA(rng) {
  const A = randInt(rng, 20, 80);
  const maxB = 170 - A;
  const B = randInt(rng, 20, maxB);
  const matches = pick(rng, [true, false]);

  if (matches) {
    return {
      q: `Two triangles both have angles ${A}° and ${B}°. Are they similar?`,
      steps: [
        "If two angles match, the third angle must also match (180° total).",
        "Matching angles (AA) means the triangles are similar.",
      ],
      a: "Yes, similar (AA)",
    };
  }

  let B2 = B;
  let guard = 0;
  while (B2 === B && guard < 20) {
    B2 = randInt(rng, 20, maxB);
    guard++;
  }
  if (B2 === B) B2 = B === maxB ? B - 1 : B + 1;

  return {
    q: `One triangle has angles ${A}° and ${B}°. Another has angles ${A}° and ${B2}°. Are they similar?`,
    steps: [
      "For AA similarity, both pairs of angles must match.",
      `${B}° ≠ ${B2}°, so the triangles are not necessarily similar.`,
    ],
    a: "No — angles don't match",
  };
}

const CONGRUENCE_TRIPLES = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
];

function genTripleScale(rng) {
  const [a0, b0, c0] = pick(rng, CONGRUENCE_TRIPLES);
  // Even multiplier so half-integer scale factors stay clean.
  const f = pick(rng, [2, 4]);
  const a = a0 * f, b = b0 * f, c = c0 * f; // shortest, middle, longest

  const sf = pick(rng, [1.5, 2, 2.5, 3]);
  const newShortest = a * sf;
  const newLongest = c * sf;
  const sfStr = String(sf);

  return {
    q: `A triangle has sides ${a}, ${b}, ${c}. A similar triangle has its shortest side equal to ${newShortest}. Find its longest side.`,
    steps: [
      `Scale factor = ${newShortest}/${a} = ${sfStr}.`,
      `Longest side: ${c} × ${sfStr}.`,
    ],
    a: `${newLongest}`,
  };
}

function genCongruent(rng) {
  const s = randInt(rng, 2, 20);
  return {
    q: `Two congruent triangles both have a side of length ${s}. What is the corresponding side in the second triangle?`,
    steps: ["Congruent triangles have identical corresponding sides."],
    a: `${s}`,
  };
}

function gen26(rng) {
  const type = pick(rng, ["scale", "aa", "triple", "congruent"]);
  if (type === "scale") return genScaleFactor(rng);
  if (type === "aa") return genAA(rng);
  if (type === "triple") return genTripleScale(rng);
  return genCongruent(rng);
}

// ---- id 27: Special Right Triangles --------------------------------------

function gen27(rng) {
  const kind = pick(rng, ["45-45-90", "30-60-90"]);
  const k = randInt(rng, 2, 12);

  if (kind === "45-45-90") {
    const askHyp = randInt(rng, 1, 2) === 1;
    if (askHyp) {
      return {
        q: `A 45-45-90 triangle has legs of length ${k}. Find the hypotenuse.`,
        steps: ["Hypotenuse = leg × √2.", `${k} × √2.`],
        a: `${k}√2`,
        diagram: { type: "specialRightTriangle", kind: "45-45-90", short: String(k) },
      };
    }
    return {
      q: `A 45-45-90 triangle has a hypotenuse of ${k}√2. Find each leg.`,
      steps: ["Leg = hypotenuse ÷ √2.", `${k}√2 ÷ √2 = ${k}.`],
      a: `${k}`,
      diagram: { type: "specialRightTriangle", kind: "45-45-90", short: String(k) },
    };
  }

  // 30-60-90, k is the short leg.
  const askHyp = randInt(rng, 1, 2) === 1;
  if (askHyp) {
    return {
      q: `A 30-60-90 triangle has a short leg of ${k}. Find the hypotenuse.`,
      steps: ["Hypotenuse = short leg × 2.", `${k} × 2.`],
      a: `${2 * k}`,
      diagram: { type: "specialRightTriangle", kind: "30-60-90", short: String(k) },
    };
  }
  return {
    q: `A 30-60-90 triangle has a short leg of ${k}. Find the long leg.`,
    steps: ["Long leg = short leg × √3.", `${k} × √3.`],
    a: `${k}√3`,
    diagram: { type: "specialRightTriangle", kind: "30-60-90", short: String(k) },
  };
}

// ---- id 28: Trigonometric Ratios (SOH-CAH-TOA) ---------------------------

const TRIG = {
  30: { sin: 0.5, cos: 0.866, tan: 0.577 },
  45: { sin: 0.707, cos: 0.707, tan: 1 },
  60: { sin: 0.866, cos: 0.5, tan: 1.732 },
};

// (angle, func) combos that produce an exact result with the table above.
function isExact(angle, func) {
  return (angle === 30 && func === "sin") || (angle === 60 && func === "cos");
}

function genTrigHyp(rng) {
  const angle = pick(rng, [30, 45, 60]);
  const func = pick(rng, ["sin", "cos"]);
  const ratio = TRIG[angle][func];
  const sideLabel = func === "sin" ? "opposite" : "adjacent";
  const funcName = func === "sin" ? "sine" : "cosine";
  const side = randInt(rng, 3, 20);
  const hypExact = side / ratio;
  const exact = isExact(angle, func);
  const hyp = exact ? hypExact : fmt2(hypExact);

  return {
    q: `A right triangle has angle ${angle}°, ${sideLabel} side ${side}, and hypotenuse h. Find h using ${funcName}.`,
    steps: [
      `${func}(${angle}°) = ${sideLabel}/hypotenuse = ${side}/h.`,
      `${func}(${angle}°) ${exact ? "=" : "≈"} ${ratio}, so h = ${side}/${ratio}.`,
    ],
    a: exact ? `${hyp}` : `≈ ${hyp}`,
    diagram: { type: "trigRatio", angleLabel: `${angle}°`, opposite: String(side), hyp: "h" },
  };
}

function genTrigLeg(rng) {
  const angle = pick(rng, [30, 45, 60]);
  const func = pick(rng, ["sin", "cos"]);
  const ratio = TRIG[angle][func];
  const sideLabel = func === "sin" ? "opposite" : "adjacent";
  const funcName = func === "sin" ? "sine" : "cosine";
  const hyp = randInt(rng, 3, 20);
  const legExact = hyp * ratio;
  const exact = isExact(angle, func);
  const leg = exact ? legExact : fmt2(legExact);

  return {
    q: `A right triangle has hypotenuse ${hyp} and angle ${angle}°. Find the ${sideLabel} side using ${funcName}.`,
    steps: [
      `${func}(${angle}°) = ${sideLabel}/hypotenuse.`,
      exact
        ? `${ratio} = ${sideLabel}/${hyp} → ${sideLabel} = ${leg}.`
        : `${func}(${angle}°) ≈ ${ratio}, ${sideLabel} = ${hyp} × ${ratio}.`,
    ],
    a: exact ? `${leg}` : `≈ ${leg}`,
    diagram: { type: "trigRatio", angleLabel: `${angle}°`, opposite: "?", hyp: String(hyp) },
  };
}

const TAN_TRIPLES = [
  [3, 4],
  [6, 8],
  [5, 12],
  [8, 15],
];

function genTanRatio(rng) {
  const [p, q] = pick(rng, TAN_TRIPLES);
  const m = randInt(rng, 1, 3);
  const legs = pick(rng, [[p * m, q * m], [q * m, p * m]]); // [adjacent, opposite]
  const [adjacent, opposite] = legs;
  const g = gcd(opposite, adjacent);
  const num = opposite / g;
  const den = adjacent / g;
  const decimal = fmt2(opposite / adjacent);

  return {
    q: `A right triangle has opposite side ${opposite} and adjacent side ${adjacent}. Find tan of that angle.`,
    steps: [`tan = opposite/adjacent = ${opposite}/${adjacent}.`],
    a: `${num}/${den} (${decimal})`,
    diagram: { type: "rightTriangle", legs: [adjacent, opposite], hyp: "?" },
  };
}

function gen28(rng) {
  const mode = pick(rng, ["hyp", "hyp", "leg", "ratio"]);
  if (mode === "hyp") return genTrigHyp(rng);
  if (mode === "leg") return genTrigLeg(rng);
  return genTanRatio(rng);
}

// ---- id 29: Circles: Arcs, Angles & Sectors ------------------------------

function genCentralAngle(rng) {
  const theta = randInt(rng, 10, 350);
  return {
    q: `Find the arc measure cut off by a ${theta}° central angle.`,
    steps: ["A central angle's measure equals its arc's measure."],
    a: `${theta}°`,
    diagram: { type: "circle", radius: "r", sectorDeg: theta },
  };
}

function genInscribedAngle(rng) {
  const arc = randInt(rng, 10, 170) * 2; // even, so half is a whole number
  const inscribed = arc / 2;
  return {
    q: `An inscribed angle cuts off an arc of ${arc}°. Find the inscribed angle.`,
    steps: [`Inscribed angle = half the arc = ${arc}/2.`],
    a: `${inscribed}°`,
    diagram: { type: "circle", radius: "r", sectorDeg: arc },
  };
}

// Angles whose /360 fraction is a clean terminating decimal.
const SECTOR_ANGLES = [45, 90, 180, 270];

function genSectorArea(rng) {
  const r = randInt(rng, 2, 10);
  const angle = pick(rng, SECTOR_ANGLES);
  const r2 = r * r;
  const frac = angle / 360;
  const fracDec = fmt2(frac);
  const piR2 = fmt2(3.14 * r2);
  const area = fmt2(frac * 3.14 * r2);

  return {
    q: `Find the area of a sector with radius ${r} and central angle ${angle}° (π ≈ 3.14).`,
    steps: [
      `Sector area = (${angle}/360) × πr² = ${fracDec} × 3.14 × ${r2}.`,
      `${fracDec} × ${piR2}.`,
    ],
    a: area,
    diagram: { type: "circle", radius: String(r), sectorDeg: angle },
  };
}

function genSectorFraction(rng) {
  const angle = randInt(rng, 10, 350);
  const g = gcd(angle, 360);
  const num = angle / g;
  const den = 360 / g;
  return {
    q: `A central angle is ${angle}°. What fraction of the whole circle's area does its sector cover?`,
    steps: [`${angle}/360 simplifies to ${num}/${den}.`],
    a: `${num}/${den}`,
    diagram: { type: "circle", radius: "r", sectorDeg: angle },
  };
}

function gen29(rng) {
  const type = pick(rng, ["central", "inscribed", "sector", "fraction"]);
  if (type === "central") return genCentralAngle(rng);
  if (type === "inscribed") return genInscribedAngle(rng);
  if (type === "sector") return genSectorArea(rng);
  return genSectorFraction(rng);
}

// ---- id 30: Volume & Surface Area of Cylinders, Cones & Spheres ----------

function genConeVolume(rng) {
  const r = randInt(rng, 2, 7);
  const h = randInt(rng, 2, 7);
  const r2 = r * r;
  const p1 = 3.14 * r2;
  const p2 = p1 * h;
  const vol = p2 / 3;
  return {
    q: `Find the volume of a cone with radius ${r} and height ${h} (π ≈ 3.14).`,
    steps: [
      `Volume = (1/3)πr²h = (1/3)(3.14)(${r2})(${h}).`,
      `3.14×${r2}=${fmt2(p1)}, ${fmt2(p1)}×${h}=${fmt2(p2)}.`,
      `${fmt2(p2)} ÷ 3.`,
    ],
    a: fmt2(vol),
    diagram: { type: "cone", r, h },
  };
}

function genSphereVolume(rng) {
  const r = randInt(rng, 2, 7);
  const r3 = r * r * r;
  const p1 = 3.14 * r3;
  const vol = (4 / 3) * p1;
  return {
    q: `Find the volume of a sphere with radius ${r} (π ≈ 3.14).`,
    steps: [
      `Volume = (4/3)πr³ = (4/3)(3.14)(${r3}).`,
      `3.14×${r3}=${fmt2(p1)}.`,
      `(4/3)×${fmt2(p1)}.`,
    ],
    a: fmt2(vol),
    diagram: { type: "sphere", r },
  };
}

function genSphereSA(rng) {
  const r = randInt(rng, 2, 7);
  const r2 = r * r;
  const p1 = 4 * 3.14;
  const sa = p1 * r2;
  return {
    q: `Find the surface area of a sphere with radius ${r} (π ≈ 3.14).`,
    steps: [
      `Surface area = 4πr² = 4 × 3.14 × ${r2}.`,
      `4×3.14=${fmt2(p1)}, ${fmt2(p1)}×${r2}.`,
    ],
    a: fmt2(sa),
    diagram: { type: "sphere", r },
  };
}

function genCylinderSA(rng) {
  const r = randInt(rng, 2, 7);
  const h = randInt(rng, 2, 7);
  const term1 = 2 * 3.14 * r * r;
  const term2 = 2 * 3.14 * r * h;
  const sa = term1 + term2;
  return {
    q: `Find the surface area of a cylinder with radius ${r} and height ${h} (π ≈ 3.14).`,
    steps: [
      `SA = 2πr² + 2πrh = 2(3.14)(${r * r}) + 2(3.14)(${r})(${h}).`,
      `${fmt2(term1)} + ${fmt2(term2)}.`,
    ],
    a: fmt2(sa),
    diagram: { type: "cylinder", r, h },
  };
}

function genCylinderVolume(rng) {
  const r = randInt(rng, 2, 7);
  const h = randInt(rng, 2, 7);
  const r2 = r * r;
  const p1 = 3.14 * r2;
  const vol = p1 * h;
  return {
    q: `Find the volume of a cylinder with radius ${r} and height ${h} (π ≈ 3.14).`,
    steps: [
      `Volume = πr²h = 3.14 × ${r}² × ${h}.`,
      `3.14 × ${r2} = ${fmt2(p1)}.`,
      `${fmt2(p1)} × ${h}.`,
    ],
    a: fmt2(vol),
    diagram: { type: "cylinder", r, h },
  };
}

function gen30(rng) {
  const type = pick(rng, ["coneVolume", "sphereVolume", "sphereSA", "cylinderSA", "cylinderVolume"]);
  if (type === "coneVolume") return genConeVolume(rng);
  if (type === "sphereVolume") return genSphereVolume(rng);
  if (type === "sphereSA") return genSphereSA(rng);
  if (type === "cylinderSA") return genCylinderSA(rng);
  return genCylinderVolume(rng);
}

// ---- id 31: Coordinate Geometry: Distance & Midpoint ---------------------

const DISTANCE_TRIPLES = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [9, 12, 15],
];

function genDistance(rng) {
  const [dx0, dy0, d] = pick(rng, DISTANCE_TRIPLES);
  const signDx = randNonZeroInt(rng, -1, 1);
  const signDy = randNonZeroInt(rng, -1, 1);
  const dx = dx0 * signDx;
  const dy = dy0 * signDy;
  const x1 = randInt(rng, -6, 6);
  const y1 = randInt(rng, -6, 6);
  const x2 = x1 + dx;
  const y2 = y1 + dy;

  return {
    q: `Find the distance between (${fmtNum(x1)},${fmtNum(y1)}) and (${fmtNum(x2)},${fmtNum(y2)}).`,
    steps: [
      `d = √[(${fmtNum(x2)}−${wrapNeg(x1)})² + (${fmtNum(y2)}−${wrapNeg(y1)})²] = √[${dx0 * dx0}+${dy0 * dy0}].`,
      `√${dx0 * dx0 + dy0 * dy0}.`,
    ],
    a: `${d}`,
    diagram: {
      type: "coordinatePlane",
      points: [{ x: x1, y: y1 }, { x: x2, y: y2 }],
      segment: [[x1, y1], [x2, y2]],
    },
  };
}

function genMidpoint(rng) {
  let x1 = randInt(rng, -9, 9);
  let x2 = randInt(rng, -9, 9);
  if (((x1 + x2) % 2 + 2) % 2 !== 0) x2 = x2 < 9 ? x2 + 1 : x2 - 1;

  let y1 = randInt(rng, -9, 9);
  let y2 = randInt(rng, -9, 9);
  if (((y1 + y2) % 2 + 2) % 2 !== 0) y2 = y2 < 9 ? y2 + 1 : y2 - 1;

  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  return {
    q: `Find the midpoint of (${fmtNum(x1)},${fmtNum(y1)}) and (${fmtNum(x2)},${fmtNum(y2)}).`,
    steps: [
      `M = ((${fmtNum(x1)}+${wrapNeg(x2)})/2, (${fmtNum(y1)}+${wrapNeg(y2)})/2) = (${fmtNum(x1 + x2)}/2, ${fmtNum(y1 + y2)}/2).`,
    ],
    a: `(${fmtNum(mx)}, ${fmtNum(my)})`,
    diagram: {
      type: "coordinatePlane",
      points: [{ x: x1, y: y1 }, { x: x2, y: y2 }],
      segment: [[x1, y1], [x2, y2]],
    },
  };
}

function gen31(rng) {
  const type = pick(rng, ["distance", "midpoint"]);
  return type === "distance" ? genDistance(rng) : genMidpoint(rng);
}

export default {
  26: gen26,
  27: gen27,
  28: gen28,
  29: gen29,
  30: gen30,
  31: gen31,
};
