// Fresh, non-repeating "review quiz" problem generators for Unit 1
// (Coordinate Plane & Solids), concept ids 1-5. Each function takes a
// seeded RNG and returns a brand-new, correctly-solved problem in the
// same { q, steps, a, diagram? } shape used by src/data/problems.js.
import { randInt, randNonZeroInt, pick } from "../../utils/seededRandom.js";

// Signed number with a unicode minus, e.g. fmt(-3) -> "−3".
function fmt(n) {
  return n < 0 ? `−${Math.abs(n)}` : `${n}`;
}

// ---- id 1: The Coordinate Plane ----------------------------------------

function quadrantOf(x, y) {
  if (x > 0 && y > 0) return "I";
  if (x < 0 && y > 0) return "II";
  if (x < 0 && y < 0) return "III";
  return "IV"; // x > 0 && y < 0
}

function genQuadrant(rng) {
  const x = randNonZeroInt(rng, -9, 9);
  const y = randNonZeroInt(rng, -9, 9);
  const quadrant = quadrantOf(x, y);
  const xDesc = x > 0 ? "positive (right)" : "negative (left)";
  const yDesc = y > 0 ? "positive (up)" : "negative (down)";
  const combo =
    x > 0 && y > 0 ? "Right and up" :
    x < 0 && y > 0 ? "Left and up" :
    x < 0 && y < 0 ? "Left and down" :
    "Right and down";
  return {
    q: `Which quadrant is (${fmt(x)}, ${fmt(y)}) in?`,
    steps: [
      `x is ${xDesc}, y is ${yDesc}.`,
      `${combo} is Quadrant ${quadrant}.`,
    ],
    a: `Quadrant ${quadrant}`,
    diagram: { type: "coordinatePlane", points: [{ x, y }], quadrantHighlight: quadrant },
  };
}

function genOrigin() {
  return {
    q: "What are the coordinates of the origin?",
    steps: ["The origin is where both axes meet."],
    a: "(0, 0)",
    diagram: { type: "coordinatePlane", points: [{ x: 0, y: 0, label: "origin" }] },
  };
}

function gen1(rng) {
  // Mostly randomized quadrant questions, occasionally the fixed origin variant.
  if (randInt(rng, 1, 10) === 1) return genOrigin();
  return genQuadrant(rng);
}

// ---- id 2: Graphing Points & Basic Relations ---------------------------

function gen2(rng) {
  const family = pick(rng, ["kx", "x+k", "kx+c"]);
  const xs = pick(rng, [
    [1, 2, 3],
    [0, 1, 2],
  ]);

  let formula, aStr;
  if (family === "kx") {
    const k = randInt(rng, 2, 9);
    formula = (x) => k * x;
    aStr = `y = ${k}x`;
  } else if (family === "x+k") {
    const k = randInt(rng, 1, 9);
    formula = (x) => x + k;
    aStr = `y = x + ${k}`;
  } else {
    const k = randInt(rng, 2, 9);
    const c = randInt(rng, 1, 9);
    formula = (x) => k * x + c;
    aStr = `y = ${k}x + ${c}`;
  }

  const points = xs.map((x) => `(${x},${formula(x)})`).join(", ");

  let stepText;
  if (family === "kx") {
    const k = formula(1);
    stepText = `Each y-value is ${k} times the x-value.`;
  } else if (family === "x+k") {
    const k = formula(0) - 0;
    stepText = `Each y-value is ${k} more than the x-value.`;
  } else {
    stepText = `Each y-value is the x-value times a constant plus a fixed amount: ${aStr}.`;
  }

  return {
    q: `Describe the pattern: ${points}.`,
    steps: [stepText],
    a: aStr,
  };
}

// ---- id 3: Volume of Rectangular Prisms --------------------------------

function gen3(rng) {
  const variant = pick(rng, ["volume", "volume", "missingHeight", "cube"]);

  if (variant === "cube") {
    const s = randInt(rng, 2, 9);
    const vol = s * s * s;
    return {
      q: `Find the volume of a cube with side ${s}.`,
      steps: [`Volume = side³ = ${s}×${s}×${s}.`, `${s}×${s}=${s * s}, ${s * s}×${s}=${vol}.`],
      a: `${vol} cubic units`,
      diagram: { type: "box", l: s, w: s, h: s },
    };
  }

  if (variant === "missingHeight") {
    const l = randInt(rng, 2, 9);
    const w = randInt(rng, 2, 9);
    const h = randInt(rng, 2, 9);
    const baseArea = l * w;
    const vol = baseArea * h;
    return {
      q: `A box has volume ${vol} and base ${l}×${w}. Find its height.`,
      steps: [`Base area = ${l}×${w}=${baseArea}.`, `Height = volume ÷ base area = ${vol}÷${baseArea}.`],
      a: `${h}`,
      diagram: { type: "box", l, w, h: "?" },
    };
  }

  const l = randInt(rng, 2, 9);
  const w = randInt(rng, 2, 9);
  const h = randInt(rng, 2, 9);
  const lw = l * w;
  const vol = lw * h;
  return {
    q: `Find the volume of a box ${l} × ${w} × ${h}.`,
    steps: [`${l}×${w}=${lw}.`, `${lw}×${h}=${vol}.`],
    a: `${vol} cubic units`,
    diagram: { type: "box", l, w, h },
  };
}

// ---- id 4: Surface Area -------------------------------------------------

function gen4(rng) {
  const isCube = randInt(rng, 1, 2) === 1;

  if (isCube) {
    const s = randInt(rng, 2, 9);
    const face = s * s;
    const sa = 6 * face;
    return {
      q: `Find the surface area of a cube with side ${s}.`,
      steps: [`Each face: ${s}×${s}=${face}.`, `6 faces: 6×${face}.`],
      a: `${sa} square units`,
      diagram: { type: "box", l: s, w: s, h: s },
    };
  }

  const l = randInt(rng, 2, 9);
  const w = randInt(rng, 2, 9);
  const h = randInt(rng, 2, 9);
  const lw = l * w, lh = l * h, wh = w * h;
  const sa = 2 * (lw + lh + wh);
  return {
    q: `Find the surface area of a rectangular prism ${l}×${w}×${h}.`,
    steps: [
      `Faces: 2(${l}×${w}) + 2(${l}×${h}) + 2(${w}×${h}).`,
      `2(${lw}) + 2(${lh}) + 2(${wh}) = ${2 * lw}+${2 * lh}+${2 * wh}.`,
    ],
    a: `${sa} square units`,
    diagram: { type: "box", l, w, h },
  };
}

// ---- id 5: Pythagorean Theorem ------------------------------------------

const BASE_TRIPLES = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [9, 12, 15],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
  [9, 40, 41],
  [12, 35, 37],
  [10, 24, 26],
];

function gen5(rng) {
  const [a0, b0, c0] = pick(rng, BASE_TRIPLES);
  const scale = pick(rng, [1, 1, 2, 3]);
  const a = a0 * scale, b = b0 * scale, c = c0 * scale;

  const askHyp = randInt(rng, 1, 2) === 1;

  if (askHyp) {
    const a2 = a * a, b2 = b * b, sum = a2 + b2;
    return {
      q: `A right triangle has legs ${a} and ${b}. Find the hypotenuse.`,
      steps: [`${a}²+${b}²=${a2}+${b2}=${sum}.`, `√${sum}=${c}.`],
      a: `${c}`,
      diagram: { type: "rightTriangle", legs: [a, b], hyp: "?" },
    };
  }

  // Find a missing leg given hypotenuse and one known leg.
  const knownLeg = pick(rng, [a, b]);
  const missingLeg = knownLeg === a ? b : a;
  const known2 = knownLeg * knownLeg, c2 = c * c, missing2 = c2 - known2;
  return {
    q: `A right triangle has hypotenuse ${c} and one leg ${knownLeg}. Find the other leg.`,
    steps: [
      `${knownLeg}²+b²=${c}².`,
      `${known2}+b²=${c2} → b²=${missing2}.`,
      `√${missing2}=${missingLeg}.`,
    ],
    a: `${missingLeg}`,
    diagram: { type: "rightTriangle", legs: [knownLeg, "?"], hyp: c },
  };
}

export default {
  1: gen1,
  2: gen2,
  3: gen3,
  4: gen4,
  5: gen5,
};
