// Fresh, non-repeating "review quiz" problem generators for Unit 2
// (Linear Equations), concept ids 6-15. Each function takes a seeded RNG
// and returns a brand-new, correctly-solved problem in the same
// { q, steps, a, diagram? } shape used by src/data/problems.js.
import { randInt, randNonZeroInt, pick } from "../../utils/seededRandom.js";

// ---- shared formatting helpers ------------------------------------------

// Signed number with a unicode minus, e.g. fmt(-3) -> "−3".
function fmt(n) {
  return n < 0 ? `−${Math.abs(n)}` : `${n}`;
}

// " + 5" / " − 5" / "" (for building "y = mx + b" style strings).
function spacedConst(n) {
  if (n === 0) return "";
  return n > 0 ? ` + ${n}` : ` − ${Math.abs(n)}`;
}

// "+5" / "−5" / "" (for compact in-line arithmetic steps).
function compactConst(n) {
  if (n === 0) return "";
  return n > 0 ? `+${n}` : `−${Math.abs(n)}`;
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

// Integer coefficient of x, e.g. mTermInt(1) -> "x", mTermInt(-1) -> "−x", mTermInt(3) -> "3x".
function mTermInt(m) {
  if (m === 1) return "x";
  if (m === -1) return "−x";
  return `${fmt(m)}x`;
}

// "a−b" with the subtrahend parenthesized if negative, e.g. diffStr(3,-1) -> "3−(−1)".
function diffStr(a, b) {
  const bs = b < 0 ? `(${fmt(b)})` : fmt(b);
  return `${fmt(a)}−${bs}`;
}

// A slope that may be a clean integer or a simple reduced fraction.
// { num, den, sign, value } where value = sign*num/den.
function genSlopeGeneral(rng, { fracProb = 0.3, fracDens = [2, 3], intMax = 6 } = {}) {
  if (rng() < fracProb) {
    const den = pick(rng, fracDens);
    let num;
    do {
      num = randInt(rng, 1, den * 2 + 1);
    } while (num % den === 0);
    const sign = pick(rng, [1, -1]);
    return { num, den, sign, value: (sign * num) / den };
  }
  const v = randNonZeroInt(rng, -intMax, intMax);
  return { num: Math.abs(v), den: 1, sign: v < 0 ? -1 : 1, value: v };
}

function mDescStr(s) {
  if (s.den === 1) return fmt(s.value);
  return `${s.sign < 0 ? "−" : ""}${s.num}/${s.den}`;
}

function mTermStr(s) {
  if (s.den === 1) return mTermInt(s.value);
  return `${s.sign < 0 ? "−" : ""}(${s.num}/${s.den})x`;
}

// ---- id 6: Slope ----------------------------------------------------------

function gen6(rng) {
  const r = rng();

  if (r < 0.15) {
    // Special case: vertical line -> undefined slope.
    const x0 = randInt(rng, -8, 8);
    const y1 = randInt(rng, -8, 4);
    const y2 = y1 + randInt(rng, 1, 8);
    const dy = y2 - y1;
    return {
      q: `Find the slope between (${fmt(x0)},${fmt(y1)}) and (${fmt(x0)},${fmt(y2)}).`,
      steps: [
        `m=(${diffStr(y2, y1)})/(${diffStr(x0, x0)})=${fmt(dy)}/0.`,
        "Division by zero means the slope is undefined.",
      ],
      a: "Undefined (vertical line)",
      diagram: {
        type: "coordinatePlane",
        points: [{ x: x0, y: y1 }, { x: x0, y: y2 }],
        lines: [{ vertical: x0, dashed: true }],
      },
    };
  }

  const useFraction = r >= 0.65;
  const dx = useFraction ? randInt(rng, 2, 4) : randInt(rng, 1, 4);
  const dy = useFraction ? randNonZeroInt(rng, -9, 9) : randNonZeroInt(rng, -6, 6) * dx;

  const x1 = randInt(rng, -8, 8);
  const y1 = randInt(rng, -8, 8);
  const x2 = x1 + dx;
  const y2 = y1 + dy;

  const g = gcd(dy, dx);
  const rn = dy / g;
  const rd = dx / g;
  const aStr = rd === 1 ? fmt(rn) : `${fmt(rn)}/${rd}`;

  return {
    q: `Find the slope between (${fmt(x1)},${fmt(y1)}) and (${fmt(x2)},${fmt(y2)}).`,
    steps: [`m=${diffStr(y2, y1)}/${diffStr(x2, x1)}=${fmt(dy)}/${fmt(dx)}.`],
    a: aStr,
    diagram: {
      type: "coordinatePlane",
      points: [{ x: x1, y: y1 }, { x: x2, y: y2 }],
      segment: [[x1, y1], [x2, y2]],
      riseRun: { from: [x1, y1], to: [x2, y2] },
    },
  };
}

// ---- id 7: Slope-Intercept Form -------------------------------------------

function gen7(rng) {
  const slope = genSlopeGeneral(rng);
  const b = randInt(rng, -9, 9);
  const mDesc = mDescStr(slope);
  const mTerm = mTermStr(slope);

  if (rng() < 0.5) {
    return {
      q: `A line has slope ${mDesc} and y-intercept ${fmt(b)}. Write its equation.`,
      steps: [`Plug into y=mx+b: m=${mDesc}, b=${fmt(b)}.`],
      a: `y = ${mTerm}${spacedConst(b)}`,
      diagram: { type: "coordinatePlane", lines: [{ slope: slope.value, intercept: b }] },
    };
  }

  const eqStr = `${mTerm}${spacedConst(b)}`;
  return {
    q: `Find the slope and y-intercept of y = ${eqStr}.`,
    steps: [`Compare to y=mx+b: m=${mDesc}, b=${fmt(b)}.`],
    a: `slope ${mDesc}, y-intercept ${fmt(b)}`,
    diagram: { type: "coordinatePlane", lines: [{ slope: slope.value, intercept: b }] },
  };
}

// ---- id 8: Graphing Linear Equations ---------------------------------------

function gen8(rng) {
  const slope = genSlopeGeneral(rng, { fracProb: 0.4, fracDens: [2, 3], intMax: 4 });
  const p = slope.sign * slope.num; // signed rise
  const q = slope.den; // run
  const b = randInt(rng, -9, 9);
  const mDesc = mDescStr(slope);
  const mTerm = mTermStr(slope);
  const secondY = b + p;

  const step1 = b === 0 ? "Y-intercept is (0,0)." : `Start at y-intercept (0,${fmt(b)}).`;
  let step2;
  if (p > 0) {
    const fracPart = q === 1 ? ` = ${p}/1` : "";
    step2 = `Slope ${mDesc}${fracPart}: go up ${p}, right ${q} to (${q},${fmt(secondY)}).`;
  } else {
    step2 = `Slope ${mDesc}: go down ${Math.abs(p)}, right ${q} to (${q},${fmt(secondY)}).`;
  }

  return {
    q: `Describe how to graph y = ${mTerm}${spacedConst(b)}.`,
    steps: [step1, step2],
    a: `Line through (0,${fmt(b)}) and (${q},${fmt(secondY)})`,
    diagram: {
      type: "coordinatePlane",
      lines: [{ slope: slope.value, intercept: b }],
      points: [{ x: 0, y: b }, { x: q, y: secondY }],
    },
  };
}

// ---- id 9: Writing Equations of Lines --------------------------------------

function gen9(rng) {
  if (rng() < 0.55) {
    // Style A: point + slope, distribute point-slope form.
    const x1 = randInt(rng, -9, 9);
    const y1 = randInt(rng, -9, 9);
    const m = randNonZeroInt(rng, -6, 6);
    const b = y1 - m * x1;
    const constVal = b - y1; // = -m*x1

    const y1w = y1 < 0 ? `(${fmt(y1)})` : fmt(y1);
    const x1w = x1 < 0 ? `(${fmt(x1)})` : fmt(x1);
    const mT = mTermInt(m);
    const leftStep2 = y1 < 0 ? `y+${Math.abs(y1)}` : y1 > 0 ? `y−${y1}` : "y";

    const step1 = `y−${y1w}=${fmt(m)}(x−${x1w}).`;
    const step2 = `${leftStep2}=${mT}${compactConst(constVal)}.`;
    const step3 = `y=${mT}${compactConst(b)}.`;

    return {
      q: `Write the equation of the line through (${fmt(x1)},${fmt(y1)}) with slope ${fmt(m)}.`,
      steps: [step1, step2, step3],
      a: `y = ${mT}${spacedConst(b)}`,
      diagram: {
        type: "coordinatePlane",
        lines: [{ slope: m, intercept: b }],
        points: [{ x: x1, y: y1, label: `(${fmt(x1)}, ${fmt(y1)})` }],
      },
    };
  }

  // Style B: two points, one at x=0 (y-intercept is directly readable).
  const y1 = randInt(rng, -9, 9); // this is b
  const x2 = randNonZeroInt(rng, -9, 9);
  const m = randNonZeroInt(rng, -6, 6);
  const y2 = y1 + m * x2;
  const mT = mTermInt(m);
  const y1w = y1 < 0 ? `(${fmt(y1)})` : fmt(y1);

  return {
    q: `Write the equation of the line through (0,${fmt(y1)}) and (${fmt(x2)},${fmt(y2)}).`,
    steps: [
      `Slope = (${fmt(y2)}−${y1w})/(${fmt(x2)}−0)=${fmt(m)}.`,
      `y-intercept is ${fmt(y1)} (given the point (0,${fmt(y1)})).`,
    ],
    a: `y = ${mT}${spacedConst(y1)}`,
    diagram: {
      type: "coordinatePlane",
      lines: [{ slope: m, intercept: y1 }],
      points: [{ x: 0, y: y1 }, { x: x2, y: y2 }],
    },
  };
}

// ---- id 10: Systems of Equations: Substitution -----------------------------

function gen10(rng) {
  const x = randInt(rng, -8, 8);
  const y = randInt(rng, -8, 8);

  if (rng() < 0.65) {
    // eq1: y = mx + c   eq2: Ax + y = C
    const m = randNonZeroInt(rng, -3, 3);
    const c = y - m * x;
    let A;
    do {
      A = randInt(rng, 1, 4);
    } while (A + m === 0);
    const C = A * x + y;

    const mT = mTermInt(m);
    const AxTerm = A === 1 ? "x" : `${A}x`;
    const eq1Disp = `y = ${mT}${spacedConst(c)}`;
    const eq2Disp = `${AxTerm} + y = ${fmt(C)}`;

    const substTerm = c === 0 ? mT : `(${mT}${compactConst(c)})`;
    const step1 = `Substitute: ${AxTerm} + ${substTerm} = ${fmt(C)}.`;

    const combinedCoef = A + m;
    const coefStr = combinedCoef === 1 ? "" : combinedCoef === -1 ? "−" : fmt(combinedCoef);
    let step2;
    if (c === 0) {
      step2 = `${coefStr}x=${fmt(C)} → x=${fmt(x)}.`;
    } else {
      step2 = `${coefStr}x${compactConst(c)}=${fmt(C)} → ${coefStr}x=${fmt(C - c)} → x=${fmt(x)}.`;
    }

    const yExprStr = m === 1 ? fmt(x) : m === -1 ? fmt(-x) : `${fmt(m)}(${fmt(x)})`;
    const yStep = c === 0 ? `y=${yExprStr}=${fmt(y)}.` : `y=${yExprStr}${compactConst(c)}=${fmt(y)}.`;

    return {
      q: `Solve: ${eq1Disp} and ${eq2Disp}.`,
      steps: [step1, step2, yStep],
      a: `x = ${fmt(x)}, y = ${fmt(y)}`,
      diagram: {
        type: "coordinatePlane",
        lines: [{ slope: m, intercept: c }, { slope: -A, intercept: C }],
        points: [{ x, y, label: `(${fmt(x)}, ${fmt(y)})` }],
      },
    };
  }

  // eq1: x = y + k   eq2: By + x = C
  const k = x - y;
  const B = randInt(rng, 1, 4);
  const C = B * y + x;

  const kDisp = k >= 0 ? `y + ${k}` : `y − ${Math.abs(k)}`;
  const eq1Disp = `x = ${kDisp}`;
  const ByTerm = B === 1 ? "y" : `${B}y`;
  const eq2Disp = `${ByTerm} + x = ${fmt(C)}`;

  const step1 = `Substitute: ${ByTerm} + (y${compactConst(k)}) = ${fmt(C)}.`;
  const combinedCoef = B + 1;
  const step2 = `${combinedCoef}y${compactConst(k)}=${fmt(C)} → ${combinedCoef}y=${fmt(C - k)} → y=${fmt(y)}.`;
  const step3 = `x=${fmt(y)}${compactConst(k)}=${fmt(x)}.`;

  return {
    q: `Solve: ${eq1Disp} and ${eq2Disp}.`,
    steps: [step1, step2, step3],
    a: `x = ${fmt(x)}, y = ${fmt(y)}`,
    diagram: {
      type: "coordinatePlane",
      lines: [{ slope: 1, intercept: -k }, { slope: -1 / B, intercept: C / B }],
      points: [{ x, y, label: `(${fmt(x)}, ${fmt(y)})` }],
    },
  };
}

// ---- id 11: Systems of Equations: Elimination ------------------------------

function eqStrAxBy(A, B, C) {
  const xt = A === 1 ? "x" : A === -1 ? "−x" : `${fmt(A)}x`;
  const bt = B === 1 ? " + y" : B === -1 ? " − y" : B > 0 ? ` + ${B}y` : ` − ${Math.abs(B)}y`;
  return `${xt}${bt} = ${fmt(C)}`;
}

function gen11(rng) {
  const x = randInt(rng, -8, 8);
  const y = randInt(rng, -8, 8);
  const variant = pick(rng, ["addY", "addY", "subtractX"]);

  if (variant === "addY") {
    const A1 = randInt(rng, 1, 4);
    const A2 = randInt(rng, 1, 4);
    const C1 = A1 * x + y;
    const C2 = A2 * x - y;
    const eq1Str = `${A1 === 1 ? "" : A1}x + y = ${fmt(C1)}`;
    const eq2Str = `${A2 === 1 ? "" : A2}x − y = ${fmt(C2)}`;
    const sumA = A1 + A2;
    const sumC = C1 + C2;
    const xTerm = A1 === 1 ? fmt(x) : `${A1}(${fmt(x)})`;

    return {
      q: `Solve: ${eq1Str} and ${eq2Str}.`,
      steps: [
        `Add the equations: ${sumA}x = ${fmt(sumC)} → x = ${fmt(x)}.`,
        `Plug in: ${xTerm} + y = ${fmt(C1)} → y = ${fmt(y)}.`,
      ],
      a: `x = ${fmt(x)}, y = ${fmt(y)}`,
      diagram: {
        type: "coordinatePlane",
        lines: [{ slope: -A1, intercept: C1 }, { slope: A2, intercept: -C2 }],
        points: [{ x, y, label: `(${fmt(x)}, ${fmt(y)})` }],
      },
    };
  }

  const A = randInt(rng, 1, 4);
  let B1 = randNonZeroInt(rng, -4, 4);
  let B2;
  do {
    B2 = randNonZeroInt(rng, -4, 4);
  } while (B2 === B1);
  if (B1 < B2) {
    [B1, B2] = [B2, B1];
  }
  const C1 = A * x + B1 * y;
  const C2 = A * x + B2 * y;
  const eq1Str = eqStrAxBy(A, B1, C1);
  const eq2Str = eqStrAxBy(A, B2, C2);
  const diffB = B1 - B2;
  const diffC = C1 - C2;
  const Axt = A === 1 ? "x" : `${A}x`;
  const prod = B2 * y;
  const opStr = prod >= 0 ? "+" : "−";

  return {
    q: `Solve: ${eq1Str} and ${eq2Str}.`,
    steps: [
      `Subtract the equations: ${diffB === 1 ? "" : diffB}y = ${fmt(diffC)} → y = ${fmt(y)}.`,
      `Plug in: ${Axt} ${opStr} ${Math.abs(prod)} = ${fmt(C2)} → x = ${fmt(x)}.`,
    ],
    a: `x = ${fmt(x)}, y = ${fmt(y)}`,
    diagram: {
      type: "coordinatePlane",
      lines: [
        { slope: -A / B1, intercept: C1 / B1 },
        { slope: -A / B2, intercept: C2 / B2 },
      ],
      points: [{ x, y, label: `(${fmt(x)}, ${fmt(y)})` }],
    },
  };
}

// ---- id 12: Graphing Systems of Equations ----------------------------------

function gen12(rng) {
  const kase = pick(rng, ["cross", "cross", "noSolution", "infinite"]);

  if (kase === "cross") {
    const x0 = randInt(rng, -8, 8);
    const y0 = randInt(rng, -8, 8);
    let m1, m2;
    do {
      m1 = randNonZeroInt(rng, -4, 4);
      m2 = randNonZeroInt(rng, -4, 4);
    } while (m1 === m2);
    const b1 = y0 - m1 * x0;
    const b2 = y0 - m2 * x0;
    const mT1 = mTermInt(m1);
    const mT2 = mTermInt(m2);
    const leftC = b1 - b2;
    const rightCoef = m2 - m1;
    const product = m1 * x0;

    return {
      q: `Lines y = ${mT1}${spacedConst(b1)} and y = ${mT2}${spacedConst(b2)} — where do they cross?`,
      steps: [
        `Set equal: ${mT1}${compactConst(b1)}=${mT2}${compactConst(b2)}.`,
        `${fmt(leftC)}=${fmt(rightCoef)}x → x=${fmt(x0)}.`,
        `y=${fmt(product)}${compactConst(b1)}=${fmt(y0)}.`,
      ],
      a: `(${fmt(x0)}, ${fmt(y0)})`,
      diagram: {
        type: "coordinatePlane",
        lines: [{ slope: m1, intercept: b1 }, { slope: m2, intercept: b2 }],
        points: [{ x: x0, y: y0, label: `(${fmt(x0)}, ${fmt(y0)})` }],
      },
    };
  }

  if (kase === "noSolution") {
    const m = randNonZeroInt(rng, -4, 4);
    const b1 = randInt(rng, -9, 9);
    let b2;
    do {
      b2 = randInt(rng, -9, 9);
    } while (b2 === b1);
    const mT = mTermInt(m);

    return {
      q: `Lines y = ${mT}${spacedConst(b1)} and y = ${mT}${spacedConst(b2)} — how many solutions?`,
      steps: [`Both have slope ${fmt(m)} (parallel).`, "Different intercepts, so they never meet."],
      a: "No solution",
      diagram: {
        type: "coordinatePlane",
        lines: [{ slope: m, intercept: b1 }, { slope: m, intercept: b2 }],
      },
    };
  }

  // infinite
  const m = randNonZeroInt(rng, -4, 4);
  const b = randInt(rng, -9, 9);
  const mT = mTermInt(m);
  const eqDisp = `${mT}${spacedConst(b)}`;

  return {
    q: `Lines y = ${eqDisp} and y = ${eqDisp} — how many solutions?`,
    steps: ["Identical equations describe the same line.", "Every point on the line is a solution."],
    a: "Infinitely many solutions",
    diagram: { type: "coordinatePlane", lines: [{ slope: m, intercept: b }] },
  };
}

// ---- id 13: Linear Inequalities in Two Variables ---------------------------

function gen13(rng) {
  const m = randNonZeroInt(rng, -4, 4);
  const b = randNonZeroInt(rng, -8, 8);
  const op = pick(rng, ["<", ">", "≤", "≥"]);
  const mT = mTermInt(m);
  const isSolid = op === "≤" || op === "≥";
  const dashed = !isSolid;

  const testTrue = op === "<" ? 0 < b : op === ">" ? 0 > b : op === "≤" ? 0 <= b : 0 >= b;
  const containingSide = b < 0 ? "above" : "below";
  const shadeSide = testTrue ? containingSide : containingSide === "above" ? "below" : "above";
  const qEqStr = `y ${op} ${mT}${spacedConst(b)}`;

  if (rng() < 0.75) {
    const step1 = `Test (0,0): is 0 ${op} 0${spacedConst(b)}? 0 ${op} ${fmt(b)} is ${testTrue ? "true" : "false"}.`;
    const step2 = testTrue
      ? `Shade the side containing (0,0)${isSolid ? ", including the boundary line." : "."}`
      : "Shade the side NOT containing (0,0).";
    const a = `Shade ${shadeSide} the line${isSolid ? " (solid boundary)" : ""}`;

    return {
      q: `Which side do you shade for ${qEqStr}?`,
      steps: [step1, step2],
      a,
      diagram: {
        type: "coordinatePlane",
        lines: [{ slope: m, intercept: b, dashed }],
        shade: { slope: m, intercept: b, side: shadeSide },
      },
    };
  }

  const strictNote = dashed
    ? `Strict inequality (${op}) means points on the line aren't included.`
    : `Non-strict inequality (${op}) means points on the line ARE included.`;

  return {
    q: `Is the boundary line dashed or solid for ${qEqStr}?`,
    steps: [strictNote],
    a: dashed ? "Dashed" : "Solid",
    diagram: {
      type: "coordinatePlane",
      lines: [{ slope: m, intercept: b, dashed }],
      shade: { slope: m, intercept: b, side: shadeSide },
    },
  };
}

// ---- id 14: Introduction to Functions --------------------------------------

function gen14(rng) {
  if (rng() < 0.5) {
    // Build 3 pairs with unique inputs -> a function.
    const xs = [];
    while (xs.length < 3) {
      const v = randInt(rng, -6, 9);
      if (!xs.includes(v)) xs.push(v);
    }
    const ys = xs.map(() => randInt(rng, -9, 9));
    const pairsStr = xs.map((x, i) => `(${fmt(x)},${fmt(ys[i])})`).join(", ");

    const counts = {};
    ys.forEach((v) => {
      counts[v] = (counts[v] || 0) + 1;
    });
    const dupVal = Object.keys(counts).find((k) => counts[k] > 1);

    let steps;
    if (dupVal !== undefined && counts[dupVal] === 3) {
      steps = [`Each input has exactly one output (${fmt(Number(dupVal))}).`];
    } else if (dupVal !== undefined) {
      steps = [
        `Each input (${xs.map(fmt).join(", ")}) has exactly one output.`,
        `Two inputs mapping to the same output (${fmt(Number(dupVal))}) is fine — that's still a function.`,
      ];
    } else {
      steps = [`Each input (${xs.map(fmt).join(", ")}) has exactly one output.`];
    }

    return { q: `Is {${pairsStr}} a function?`, steps, a: "Yes — it's a function" };
  }

  // Repeated input mapping to two different outputs -> not a function.
  const xDup = randInt(rng, -6, 9);
  const yA = randInt(rng, -9, 9);
  let yB;
  do {
    yB = randInt(rng, -9, 9);
  } while (yB === yA);
  let xOther;
  do {
    xOther = randInt(rng, -6, 9);
  } while (xOther === xDup);
  const yOther = randInt(rng, -9, 9);
  const pairsStr = `(${fmt(xDup)},${fmt(yA)}), (${fmt(xDup)},${fmt(yB)}), (${fmt(xOther)},${fmt(yOther)})`;

  return {
    q: `Is {${pairsStr}} a function?`,
    steps: [`Input ${fmt(xDup)} maps to two different outputs (${fmt(yA)} and ${fmt(yB)}).`],
    a: "No — not a function",
  };
}

// ---- id 15: Function Notation -----------------------------------------------

function gen15(rng) {
  const fname = pick(rng, ["f", "g", "h"]);
  const n = randInt(rng, -6, 6);
  const nBase = n < 0 ? `(${fmt(n)})` : `${n}`;
  const kind = pick(rng, ["linear", "linear", "quad", "full"]);

  if (kind === "linear") {
    const a = randNonZeroInt(rng, -5, 5);
    const b = randInt(rng, -9, 9);
    const prod = a * n;
    const value = prod + b;

    return {
      q: `If ${fname}(x) = ${mTermInt(a)}${spacedConst(b)}, find ${fname}(${fmt(n)}).`,
      steps: [`Substitute: ${fmt(a)}(${fmt(n)})${compactConst(b)}.`, `${fmt(prod)}${compactConst(b)}.`],
      a: fmt(value),
    };
  }

  if (kind === "quad") {
    const aCoef = pick(rng, [1, 2, 3]);
    const b = randInt(rng, -9, 9);
    const nSq = n * n;
    const prodCoef = aCoef * nSq;
    const value = prodCoef + b;
    const headTerm = aCoef === 1 ? "x²" : `${aCoef}x²`;

    let steps;
    if (aCoef === 1) {
      steps = [`Substitute: ${nBase}²${compactConst(b)}.`, `${fmt(nSq)}${compactConst(b)}.`];
    } else {
      steps = [
        `Substitute: ${aCoef}(${fmt(n)})²${compactConst(b)}.`,
        `${aCoef}(${fmt(nSq)})${compactConst(b)}.`,
        `${fmt(prodCoef)}${compactConst(b)}.`,
      ];
    }

    return { q: `If ${fname}(x) = ${headTerm}${spacedConst(b)}, find ${fname}(${fmt(n)}).`, steps, a: fmt(value) };
  }

  // full quadratic: ax² + bx + c
  const aCoef = pick(rng, [1, 2, 3]);
  const b = randNonZeroInt(rng, -6, 6);
  const c = randInt(rng, -9, 9);
  const nSq = n * n;
  const term1 = aCoef * nSq;
  const term2 = b * n;
  const value = term1 + term2 + c;
  const headTerm = aCoef === 1 ? "x²" : `${aCoef}x²`;
  const bTermSpaced = b > 0 ? ` + ${b}x` : ` − ${Math.abs(b)}x`;

  const bMag = Math.abs(b) === 1 ? "" : `${Math.abs(b)}`;
  const subBTerm = `${b > 0 ? "+" : "−"}${bMag}(${fmt(n)})`;

  const step1 = `Substitute: ${aCoef === 1 ? `${nBase}²` : `${aCoef}(${fmt(n)})²`}${subBTerm}${compactConst(c)}.`;
  const step2 = `${fmt(term1)}${compactConst(term2)}${compactConst(c)}.`;

  return {
    q: `If ${fname}(x) = ${headTerm}${bTermSpaced}${spacedConst(c)}, find ${fname}(${fmt(n)}).`,
    steps: [step1, step2],
    a: fmt(value),
  };
}

export default {
  6: gen6,
  7: gen7,
  8: gen8,
  9: gen9,
  10: gen10,
  11: gen11,
  12: gen12,
  13: gen13,
  14: gen14,
  15: gen15,
};
