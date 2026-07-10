// Fresh, non-repeating "review quiz" problem generators for Unit 9
// (Calculus I), concept ids 54-66. Each function takes a seeded RNG and
// returns a brand-new, correctly-solved problem in the same
// { q, steps, a } shape used by src/data/problems.js. No diagrams — none
// of the reference problems for these ids use them.
import { randInt, randNonZeroInt, pick } from "../../utils/seededRandom.js";

// ---- shared formatting helpers -----------------------------------------

// "3" for non-negative n, "−3" (unicode minus) for negative n.
function fmtSigned(n) {
  return n < 0 ? `−${Math.abs(n)}` : `${n}`;
}

// " + 3" or " − 3" — for splicing a signed constant after a base term.
function signTerm(n) {
  return n >= 0 ? ` + ${n}` : ` − ${Math.abs(n)}`;
}

// "x" / "−x" / "4x" / "−4x" — coefficient times x, own leading sign.
function coefXsigned(k) {
  if (k === 1) return "x";
  if (k === -1) return "−x";
  return `${fmtSigned(k)}x`;
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

// Magnitude-only string for a coef·x^n term (sign handled separately by
// powerPart/joinParts). Supports n<0 via caret notation ("x^(−2)") and the
// special n=−1 "coef/x" form used by antiderivatives of x^(−2).
function powerCore(absCoef, n) {
  if (n === -1) return `${absCoef}/x`;
  if (n === 0) return `${absCoef}`;
  if (n === 1) return absCoef === 1 ? "x" : `${absCoef}x`;
  if (n < 0) return absCoef === 1 ? `x^(${fmtSigned(n)})` : `${absCoef}x^(${fmtSigned(n)})`;
  return absCoef === 1 ? `x${sup(n)}` : `${absCoef}x${sup(n)}`;
}
function powerPart(coef, n) {
  return { abs: powerCore(Math.abs(coef), n), neg: coef < 0 };
}
function signedStr(part) {
  return part.neg ? `−${part.abs}` : part.abs;
}
// Joins {abs,neg} parts into "3x² − 5x + 1" style strings — no leading
// "+", unicode minus, single space around interior operators.
function joinParts(parts) {
  return parts
    .map((p, i) => (i === 0 ? signedStr(p) : (p.neg ? ` − ${p.abs}` : ` + ${p.abs}`)))
    .join("");
}

function gcdAbs(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}
// Exact reduced fraction string, e.g. fracStr(9,2) -> "9/2", fracStr(4,2) -> "2".
function fracStr(num, den) {
  if (num === 0) return "0";
  const g = gcdAbs(num, den);
  let n = num / g;
  let d = den / g;
  if (d < 0) {
    n = -n;
    d = -d;
  }
  return d === 1 ? fmtSigned(n) : `${fmtSigned(n)}/${d}`;
}

// "x² + 3x − 5" style, a shown bare only when ±1.
function quadStr(a, b, c) {
  let s = a === 1 ? "x²" : a === -1 ? "−x²" : `${fmtSigned(a)}x²`;
  if (b !== 0) {
    const ab = Math.abs(b);
    s += (b > 0 ? " + " : " − ") + (ab === 1 ? "x" : `${ab}x`);
  }
  if (c !== 0) s += (c > 0 ? " + " : " − ") + Math.abs(c);
  return s;
}

// ---- id 54: The Derivative: Definition & Notation ----------------------
// Definitional/conceptual — vary via a pool of pre-written, independently
// correct variants rather than heavy randomization.

const CONCEPT54_VARIANTS = [
  {
    q: "What does f'(a) represent about the graph of f at x=a?",
    steps: ["It's the slope of the line tangent to the graph at that point."],
    a: "The slope of the tangent line at x = a",
  },
  {
    q: "If f'(x) = 0 at a point, what does that suggest about the tangent line there?",
    steps: ["A slope of 0 means the tangent line is horizontal."],
    a: "The tangent line is horizontal",
  },
  {
    q: "Which notations represent the same thing: f'(x), dy/dx, dx/dy?",
    steps: [
      "f'(x) and dy/dx both mean the derivative of y with respect to x.",
      "dx/dy is a different derivative (x with respect to y).",
    ],
    a: "f'(x) and dy/dx",
  },
  {
    q: "True or false: the derivative measures average rate of change over an interval.",
    steps: ["The derivative measures the instantaneous rate of change at a single point, not an average over an interval."],
    a: "False",
  },
  {
    q: "If f'(x) > 0 on an interval, what does that tell you about f on that interval?",
    steps: ["A positive slope means the function is rising as x increases."],
    a: "f is increasing on that interval",
  },
  {
    q: "If f'(x) < 0 on an interval, what does that tell you about f on that interval?",
    steps: ["A negative slope means the function is falling as x increases."],
    a: "f is decreasing on that interval",
  },
];

function gen54(rng) {
  const v = pick(rng, CONCEPT54_VARIANTS);
  return { q: v.q, steps: [...v.steps], a: v.a };
}

// ---- id 55: The Power Rule ----------------------------------------------

function gen55(rng) {
  const numTerms = randInt(rng, 2, 4);
  const nPool = [0, 1, 2, 3, 4, 5];
  const chosenN = [];
  while (chosenN.length < numTerms) {
    const n = pick(rng, nPool);
    if (!chosenN.includes(n)) chosenN.push(n);
  }
  chosenN.sort((a, b) => b - a); // descending exponents, matching reference style
  const terms = chosenN.map((n) => ({ n, c: randNonZeroInt(rng, -9, 9) }));

  const polyExpr = joinParts(terms.map((t) => powerPart(t.c, t.n)));

  const steps = terms.map((t) => {
    const derivStr = t.n === 0 ? "0" : signedStr(powerPart(t.c * t.n, t.n - 1));
    return `d/dx[${signedStr(powerPart(t.c, t.n))}]=${derivStr}.`;
  });

  const derivTerms = terms.filter((t) => t.n >= 1).map((t) => ({ c: t.c * t.n, n: t.n - 1 }));
  const ans = derivTerms.length
    ? `f'(x) = ${joinParts(derivTerms.map((t) => powerPart(t.c, t.n)))}`
    : "f'(x) = 0";

  return { q: `Find the derivative of f(x) = ${polyExpr}.`, steps, a: ans };
}

// ---- id 56: Product & Quotient Rules -------------------------------------

function gen56(rng) {
  const family = pick(rng, ["xExp", "xPowTrig", "quotLinear", "quotTrigOverX"]);

  if (family === "xExp") {
    const c = randInt(rng, 1, 9);
    const coefX = c === 1 ? "x" : `${c}x`;
    const term1raw = c === 1 ? "1·eˣ" : `${c}·eˣ`;
    const term2 = `${coefX}·eˣ`;
    const term1final = c === 1 ? "eˣ" : `${c}eˣ`;
    return {
      q: `Find the derivative of f(x) = ${coefX}·eˣ using the product rule.`,
      steps: [
        `u=${coefX} (u'=${c}), v=eˣ (v'=eˣ).`,
        `Product rule: u'v + uv' = ${term1raw} + ${term2}.`,
      ],
      a: `${term1final} + ${term2}`,
    };
  }

  if (family === "xPowTrig") {
    const k = pick(rng, [2, 3]);
    const trig = pick(rng, ["sin", "cos"]);
    const xk1 = k - 1 === 1 ? "x" : `x${sup(k - 1)}`;
    const xk = `x${sup(k)}`;
    const term1 = `${k}${xk1}·${trig}(x)`;
    let ans, trigPrimeDisp;
    if (trig === "cos") {
      ans = `${term1} − ${xk}·sin(x)`;
      trigPrimeDisp = "−sin(x)";
    } else {
      ans = `${term1} + ${xk}·cos(x)`;
      trigPrimeDisp = "cos(x)";
    }
    return {
      q: `Find the derivative of f(x) = x${sup(k)}·${trig}(x) using the product rule.`,
      steps: [
        `u=x${sup(k)} (u'=${k}${xk1}), v=${trig}(x) (v'=${trigPrimeDisp}).`,
        `u'v + uv' = ${ans}.`,
      ],
      a: ans,
    };
  }

  if (family === "quotLinear") {
    let k, m;
    do {
      k = randInt(rng, 1, 9);
      m = randInt(rng, 1, 9);
    } while (k === m);
    const numerator = m - k;
    const ans = `${fmtSigned(numerator)}/(x+${m})²`;
    return {
      q: `Find the derivative of f(x) = (x+${k})/(x+${m}) using the quotient rule.`,
      steps: [
        `u=x+${k} (u'=1), v=x+${m} (v'=1).`,
        `(u'v−uv')/v² = ((x+${m}) − (x+${k}))/(x+${m})².`,
      ],
      a: ans,
    };
  }

  // quotTrigOverX
  const trig = pick(rng, ["sin", "cos"]);
  const uPrime = trig === "sin" ? "cos(x)" : "−sin(x)";
  const ans = trig === "sin" ? "(x·cos(x) − sin(x))/x²" : "(−x·sin(x) − cos(x))/x²";
  return {
    q: `Find the derivative of f(x) = ${trig}(x)/x using the quotient rule.`,
    steps: [`u=${trig}(x) (u'=${uPrime}), v=x (v'=1).`, `(u'v−uv')/v² = ${ans}.`],
    a: ans,
  };
}

// ---- id 57: The Chain Rule ------------------------------------------------

function gen57(rng) {
  const family = pick(rng, ["linearPow", "trig", "exp", "sqrt"]);

  if (family === "linearPow") {
    const a = randInt(rng, 2, 5);
    const b = randNonZeroInt(rng, -9, 9);
    const n = randInt(rng, 2, 6);
    const inner = `${coefXsigned(a)}${signTerm(b)}`;
    const coef = n * a;
    return {
      q: `Find the derivative of f(x) = (${inner})${sup(n)}.`,
      steps: [
        `Outside function: (...)${sup(n)}, derivative ${n}(...)${sup(n - 1)}.`,
        `Inside function: ${inner}, derivative ${a}.`,
        `Chain rule: ${n}(${inner})${sup(n - 1)} · ${a}.`,
      ],
      a: `${coef}(${inner})${sup(n - 1)}`,
    };
  }

  if (family === "trig") {
    const a = randInt(rng, 2, 6);
    const trig = pick(rng, ["sin", "cos"]);
    const outerDeriv = trig === "sin" ? "cos" : "−sin";
    const ans = trig === "sin" ? `${a}cos(${a}x)` : `−${a}sin(${a}x)`;
    return {
      q: `Find the derivative of f(x) = ${trig}(${a}x).`,
      steps: [
        `Outside function: ${trig}(...), derivative ${outerDeriv}(...).`,
        `Inside function: ${a}x, derivative ${a}.`,
        `Chain rule: ${outerDeriv}(${a}x)·${a}.`,
      ],
      a: ans,
    };
  }

  if (family === "exp") {
    const a = randInt(rng, 2, 9);
    return {
      q: `Find the derivative of f(x) = e^(${a}x).`,
      steps: [
        "Outside function: e^(...), derivative e^(...).",
        `Inside function: ${a}x, derivative ${a}.`,
        `Chain rule: e^(${a}x)·${a}.`,
      ],
      a: `${a}e^(${a}x)`,
    };
  }

  // sqrt
  const k = randInt(rng, 1, 9);
  return {
    q: `Find the derivative of f(x) = √(x² + ${k}).`,
    steps: [
      `Rewrite as (x²+${k})^(1/2).`,
      "Outside derivative: (1/2)(...)^(−1/2). Inside derivative: 2x.",
      `Chain rule: (1/2)(x²+${k})^(−1/2)·2x = x/√(x²+${k}).`,
    ],
    a: `x/√(x² + ${k})`,
  };
}

// ---- id 58: Derivatives of Trig, Exponential & Log Functions -------------

function fnPart(c, kind) {
  const absC = Math.abs(c);
  let core;
  if (kind === "sin") core = absC === 1 ? "sin(x)" : `${absC}sin(x)`;
  else if (kind === "cos") core = absC === 1 ? "cos(x)" : `${absC}cos(x)`;
  else if (kind === "exp") core = absC === 1 ? "eˣ" : `${absC}eˣ`;
  else core = absC === 1 ? "ln(x)" : `${absC}ln(x)`;
  return { abs: core, neg: c < 0 };
}
function fnDerivPart(c, kind) {
  if (kind === "sin") return fnPart(c, "cos"); // d/dx[c·sin(x)] = c·cos(x)
  if (kind === "cos") return fnPart(-c, "sin"); // d/dx[c·cos(x)] = −c·sin(x)
  if (kind === "exp") return fnPart(c, "exp"); // d/dx[c·eˣ] = c·eˣ
  const absC = Math.abs(c); // d/dx[c·ln(x)] = c/x
  return { abs: absC === 1 ? "1/x" : `${absC}/x`, neg: c < 0 };
}

function gen58(rng) {
  const numTerms = randInt(rng, 1, 2);
  const kinds = ["sin", "cos", "exp", "ln"];
  const chosen = [];
  while (chosen.length < numTerms) {
    const k = pick(rng, kinds);
    if (!chosen.includes(k)) chosen.push(k);
  }
  const cs = chosen.map(() => randNonZeroInt(rng, -9, 9));
  const termParts = chosen.map((kind, i) => fnPart(cs[i], kind));
  const derivParts = chosen.map((kind, i) => fnDerivPart(cs[i], kind));

  const steps = chosen.map(
    (_, i) => `d/dx[${signedStr(termParts[i])}]=${signedStr(derivParts[i])}.`
  );

  return {
    q: `Find the derivative of f(x) = ${joinParts(termParts)}.`,
    steps,
    a: joinParts(derivParts),
  };
}

// ---- id 59: Implicit Differentiation -------------------------------------

function gen59(rng) {
  const family = pick(rng, ["kxy2", "y2kx", "xyC", "circlePoint"]);

  if (family === "kxy2") {
    const k = randNonZeroInt(rng, -9, 9);
    const C = randInt(rng, 1, 50);
    return {
      q: `Find dy/dx for ${coefXsigned(k)} + y² = ${C}.`,
      steps: [
        `Differentiate both sides: ${fmtSigned(k)} + 2y(dy/dx) = 0.`,
        `Solve: dy/dx = ${fmtSigned(-k)}/(2y).`,
      ],
      a: `dy/dx = ${fmtSigned(-k)}/(2y)`,
    };
  }

  if (family === "y2kx") {
    const k = randNonZeroInt(rng, -9, 9);
    const reduced = k % 2 === 0;
    const ansVal = reduced ? `${fmtSigned(k / 2)}/y` : `${fmtSigned(k)}/(2y)`;
    return {
      q: `Find dy/dx for y² = ${coefXsigned(k)}.`,
      steps: [
        `Differentiate both sides: 2y(dy/dx) = ${fmtSigned(k)}.`,
        `dy/dx = ${fmtSigned(k)}/(2y)${reduced ? ` = ${fmtSigned(k / 2)}/y` : ""}.`,
      ],
      a: `dy/dx = ${ansVal}`,
    };
  }

  if (family === "xyC") {
    const C = randInt(rng, 1, 50);
    return {
      q: `Find dy/dx for xy = ${C}.`,
      steps: ["Product rule on the left: 1·y + x(dy/dx) = 0.", "Solve: dy/dx = −y/x."],
      a: "dy/dx = −y/x",
    };
  }

  // circlePoint
  let x0, y0, R2;
  if (randInt(rng, 1, 2) === 1) {
    x0 = 0;
    y0 = randInt(rng, 1, 9);
    R2 = y0 * y0;
  } else {
    const triples = [
      [3, 4, 5],
      [6, 8, 10],
      [5, 12, 13],
      [8, 15, 17],
    ];
    let [a, b] = pick(rng, triples);
    if (randInt(rng, 1, 2) === 2) [a, b] = [b, a];
    x0 = a;
    y0 = b;
    R2 = x0 * x0 + y0 * y0;
  }
  const slope = fracStr(-x0, y0);
  return {
    q: `Find dy/dx for x² + y² = ${R2} at the point (${x0},${y0}).`,
    steps: ["Differentiate: 2x + 2y(dy/dx) = 0 → dy/dx = −x/y.", `Plug in (${x0}, ${y0}): dy/dx = ${slope}.`],
    a: `dy/dx = ${slope}`,
  };
}

// ---- id 60: Related Rates --------------------------------------------------

function gen60(rng) {
  const family = pick(rng, ["square", "sphere", "circleArea", "ladder"]);

  if (family === "square") {
    const k1 = randInt(rng, 1, 9);
    const s0 = randInt(rng, 1, 9);
    return {
      q: `A square's side grows at ${k1} cm/s. Find how fast the area grows when the side is ${s0} cm (A = s²).`,
      steps: ["dA/dt = 2s(ds/dt).", `Plug in s=${s0}, ds/dt=${k1}: dA/dt = 2(${s0})(${k1}).`],
      a: `${2 * s0 * k1} cm²/s`,
    };
  }

  if (family === "sphere") {
    const k1 = randInt(rng, 1, 9);
    const r0 = randInt(rng, 1, 9);
    return {
      q: `A sphere's radius grows at ${k1} cm/s. Find how fast the volume grows when r = ${r0} cm (V = (4/3)πr³).`,
      steps: ["dV/dt = 4πr²(dr/dt).", `Plug in r=${r0}, dr/dt=${k1}: dV/dt = 4π(${r0 * r0})(${k1}).`],
      a: `${4 * r0 * r0 * k1}π cm³/s`,
    };
  }

  if (family === "circleArea") {
    const k1 = randInt(rng, 1, 9);
    const r0 = randInt(rng, 1, 9);
    return {
      q: `A circle's radius grows at ${k1} cm/s. Find how fast the area grows when r = ${r0} cm (A = πr²).`,
      steps: ["dA/dt = 2πr(dr/dt).", `Plug in r=${r0}, dr/dt=${k1}: dA/dt = 2π(${r0})(${k1}).`],
      a: `${2 * r0 * k1}π cm²/s`,
    };
  }

  // ladder
  const triples = [
    [3, 4, 5],
    [6, 8, 10],
    [5, 12, 13],
    [8, 15, 17],
    [9, 12, 15],
  ];
  const [, , L] = pick(rng, triples);
  const speed = randInt(rng, 1, 9);
  if (randInt(rng, 1, 2) === 1) {
    return {
      q: `A ladder ${L} ft long slides down a wall. If the base moves away at ${speed} ft/s, what equation relates the base x and height y?`,
      steps: [`The ladder, wall, and ground form a right triangle: x² + y² = ${L}².`],
      a: `x² + y² = ${L * L}`,
    };
  }
  return {
    q: `For x² + y² = ${L * L} (a sliding ladder), differentiate both sides with respect to time t.`,
    steps: ["Differentiate: 2x(dx/dt) + 2y(dy/dt) = 0."],
    a: "2x(dx/dt) + 2y(dy/dt) = 0",
  };
}

// ---- id 61: Applications: Optimization -------------------------------------

function gen61(rng) {
  const family = pick(rng, ["critPoint", "areaFn", "maxWidth"]);

  if (family === "critPoint") {
    const a = pick(rng, [1, -1, 2, -2]);
    const x0 = randInt(rng, -9, 9);
    const b = -2 * a * x0;
    const c = randInt(rng, -9, 9);
    return {
      q: `Find the critical point of f(x) = ${quadStr(a, b, c)}.`,
      steps: [
        `f'(x) = ${fmtSigned(2 * a)}x${signTerm(b)}.`,
        `Set to 0: ${fmtSigned(2 * a)}x${signTerm(b)} = 0 → x = ${fmtSigned(x0)}.`,
      ],
      a:
        a > 0
          ? `x = ${fmtSigned(x0)} (a minimum, since the parabola opens upward)`
          : `x = ${fmtSigned(x0)} (a maximum, since the parabola opens downward)`,
    };
  }

  const P = pick(rng, [16, 20, 24, 28, 32]);
  if (family === "areaFn") {
    return {
      q: `A rectangle's perimeter is fixed at ${P}. If the width is w, the length is ${P / 2}−w. Write the area as a function of w.`,
      steps: [`Area = width × length = w(${P / 2}−w).`],
      a: `A(w) = ${P / 2}w − w²`,
    };
  }

  // maxWidth
  return {
    q: `For A(w) = ${P / 2}w − w², find the width that maximizes the area.`,
    steps: [`A'(w) = ${P / 2} − 2w.`, `Set to 0: ${P / 2} − 2w = 0 → w = ${P / 4}.`],
    a: `w = ${P / 4}`,
  };
}

// ---- id 62: Curve Sketching with Derivatives -------------------------------

function gen62(rng) {
  const family = pick(rng, ["monotonic", "concavity", "localMax", "localMin"]);

  if (family === "monotonic") {
    const a = pick(rng, [1, 1, 2, 3]);
    const k = randInt(rng, -9, 9);
    const b = a * k;
    const direction = pick(rng, ["increasing", "decreasing"]);
    const fPrimeStr = `${coefXsigned(a)}${signTerm(-b)}`;
    const cmp = direction === "increasing" ? ">" : "<";
    return {
      q: `f'(x) = ${fPrimeStr}. On what interval is f ${direction}?`,
      steps: [`f is ${direction} where f'(x) ${cmp} 0: ${fPrimeStr} ${cmp} 0.`, `x ${cmp} ${fmtSigned(k)}.`],
      a: `x ${cmp} ${fmtSigned(k)}`,
    };
  }

  if (family === "concavity") {
    const c = randNonZeroInt(rng, -9, 9);
    return {
      q: `f''(x) = ${fmtSigned(c)} (a ${c > 0 ? "positive" : "negative"} constant). Is the graph concave up or down everywhere?`,
      steps: [`f''(x) ${c > 0 ? "> 0" : "< 0"} everywhere means concave ${c > 0 ? "up" : "down"} everywhere.`],
      a: c > 0 ? "Concave up" : "Concave down",
    };
  }

  const k = randInt(rng, -9, 9);
  if (family === "localMax") {
    return {
      q: `f'(x) changes from positive to negative at x = ${fmtSigned(k)}. Is x=${fmtSigned(k)} a local max or min?`,
      steps: ["Increasing then decreasing means the function peaks there."],
      a: "Local maximum",
    };
  }
  return {
    q: `f'(x) changes from negative to positive at x = ${fmtSigned(k)}. Is x=${fmtSigned(k)} a local max or min?`,
    steps: ["Decreasing then increasing means the function bottoms out there."],
    a: "Local minimum",
  };
}

// ---- id 63: Antiderivatives & Indefinite Integrals -------------------------

function gen63(rng) {
  const numTerms = randInt(rng, 1, 3);
  const nPool = [-2, 0, 1, 2, 3, 4];
  const chosenN = [];
  while (chosenN.length < numTerms) {
    const n = pick(rng, nPool);
    if (!chosenN.includes(n)) chosenN.push(n);
  }
  chosenN.sort((a, b) => b - a);

  const terms = chosenN.map((n) => {
    const denom = n + 1; // never 0, since n !== -1
    const maxResult = Math.max(1, Math.floor(9 / Math.abs(denom)));
    const resultCoef = randNonZeroInt(rng, -maxResult, maxResult);
    const c = resultCoef * denom; // guarantees an exact power-rule integration
    return { n, c, resultCoef };
  });

  const integrand = joinParts(terms.map((t) => powerPart(t.c, t.n)));
  const hasNeg = terms.some((t) => t.n < 0);
  const qStr =
    numTerms === 1
      ? `Find ∫${integrand} dx${hasNeg ? " (for x ≠ 0)" : ""}.`
      : `Find ∫(${integrand}) dx${hasNeg ? " (for x ≠ 0)" : ""}.`;

  const steps = terms.map(
    (t) =>
      `∫${signedStr(powerPart(t.c, t.n))} dx = ${signedStr(powerPart(t.resultCoef, t.n + 1))}.`
  );

  const ans = `${joinParts(terms.map((t) => powerPart(t.resultCoef, t.n + 1)))} + C`;

  return { q: qStr, steps, a: ans };
}

// ---- id 64: The Fundamental Theorem of Calculus ----------------------------

function gen64(rng) {
  if (randInt(rng, 1, 100) <= 15) {
    const k = randInt(rng, -9, 9);
    return {
      q: `Evaluate ∫[${fmtSigned(k)} to ${fmtSigned(k)}] f(x) dx for any continuous f.`,
      steps: ["Integrating over an interval of zero width gives 0, regardless of f."],
      a: "0",
    };
  }

  const n = randInt(rng, 0, 3);
  const c = randInt(rng, 1, 6);
  const p = randInt(rng, -5, 7);
  const q = randInt(rng, p + 1, 8);
  const denom = n + 1;
  const diffPow = Math.pow(q, denom) - Math.pow(p, denom);
  const ansStr = fracStr(c * diffPow, denom);

  const FxCoefPart = c === 1 ? "" : `${c}`;
  const FxVar = denom === 1 ? "x" : `x${sup(denom)}`;
  const FxStr = denom === 1 ? `${FxCoefPart}${FxVar}` : `${FxCoefPart}${FxVar}/${denom}`;

  return {
    q: `Evaluate ∫[${fmtSigned(p)} to ${fmtSigned(q)}] ${powerCore(c, n)} dx.`,
    steps: [`Antiderivative: F(x) = ${FxStr}.`, `F(${fmtSigned(q)}) − F(${fmtSigned(p)}) = ${ansStr}.`],
    a: ansStr,
  };
}

// ---- id 65: Definite Integrals & Area Under a Curve ------------------------

function gen65(rng) {
  const family = pick(rng, ["triangle", "oddSymmetric", "rectangle", "linearArea"]);

  if (family === "triangle") {
    const k = randInt(rng, 2, 10);
    const ans = fracStr(k * k, 2);
    return {
      q: `Evaluate ∫[0 to ${k}] x dx and interpret it as an area.`,
      steps: [
        "Antiderivative: x²/2.",
        `F(${k}) − F(0) = ${ans} − 0.`,
        `This equals the area of the triangle under y=x from 0 to ${k}.`,
      ],
      a: ans,
    };
  }

  if (family === "oddSymmetric") {
    const k = randInt(rng, 1, 6);
    const n = pick(rng, [3, 5]);
    return {
      q: `Evaluate ∫[−${k} to ${k}] x${sup(n)} dx.`,
      steps: [`x${sup(n)} is an odd function, so equal positive and negative areas cancel out over a symmetric interval.`],
      a: "0",
    };
  }

  if (family === "rectangle") {
    const c = randInt(rng, 1, 9);
    const p = randInt(rng, -9, 5);
    const q = randInt(rng, p + 1, 9);
    return {
      q: `Evaluate ∫[${fmtSigned(p)} to ${fmtSigned(q)}] ${c} dx.`,
      steps: [`This is the area of a rectangle with height ${c} and width ${q - p}.`],
      a: `${c * (q - p)}`,
    };
  }

  // linearArea
  const c = randInt(rng, 1, 6);
  const p = randInt(rng, -9, 5);
  const q = randInt(rng, p + 1, 9);
  const ans = fracStr(c * (q * q - p * p), 2);
  const FxStr = c % 2 === 0 ? (c / 2 === 1 ? "x²" : `${c / 2}x²`) : `${c}x²/2`;
  return {
    q: `Evaluate ∫[${fmtSigned(p)} to ${fmtSigned(q)}] ${c === 1 ? "" : c}x dx.`,
    steps: [`Antiderivative: ${FxStr}.`, `F(${fmtSigned(q)}) − F(${fmtSigned(p)}) = ${ans}.`],
    a: ans,
  };
}

// ---- id 66: U-Substitution --------------------------------------------------

function gen66(rng) {
  const family = pick(rng, ["cubicPow", "sinPow", "expInner", "conceptualU"]);

  if (family === "cubicPow") {
    const K = randNonZeroInt(rng, -9, 9);
    const m = pick(rng, [3, 4, 5]);
    const kTerm = K >= 0 ? `+ ${K}` : `− ${Math.abs(K)}`;
    return {
      q: `Find ∫3x²(x³ ${kTerm})${sup(m)} dx using u-substitution.`,
      steps: [
        `Let u = x³ ${kTerm}, du = 3x² dx.`,
        `Integral becomes ∫u${sup(m)} du = u${sup(m + 1)}/${m + 1}.`,
        `Substitute back: (x³ ${kTerm})${sup(m + 1)}/${m + 1}.`,
      ],
      a: `(x³ ${kTerm})${sup(m + 1)}/${m + 1} + C`,
    };
  }

  if (family === "sinPow") {
    const m = pick(rng, [3, 4, 5, 6]);
    return {
      q: `Find ∫cos(x)·sin${sup(m)}(x) dx using u-substitution.`,
      steps: [
        "Let u = sin(x), du = cos(x) dx.",
        `Integral becomes ∫u${sup(m)} du = u${sup(m + 1)}/${m + 1}.`,
        `Substitute back: sin${sup(m + 1)}(x)/${m + 1}.`,
      ],
      a: `sin${sup(m + 1)}(x)/${m + 1} + C`,
    };
  }

  if (family === "expInner") {
    const c = randInt(rng, 2, 9);
    return {
      q: `Find ∫${2 * c}x·e^(${c}x²) dx using u-substitution.`,
      steps: [
        `Let u = ${c}x², du = ${2 * c}x dx.`,
        "Integral becomes ∫eᵘ du = eᵘ.",
        `Substitute back: e^(${c}x²).`,
      ],
      a: `e^(${c}x²) + C`,
    };
  }

  // conceptualU
  const k = randInt(rng, 1, 9);
  const cubic = randInt(rng, 1, 2) === 2;
  if (cubic) {
    return {
      q: `What u would you choose for ∫x²/(x³+${k}) dx?`,
      steps: [`Choosing u = x³ + ${k} gives du = 3x² dx, which matches the x² in the numerator (up to a constant).`],
      a: `u = x³ + ${k}`,
    };
  }
  return {
    q: `What u would you choose for ∫x/(x²+${k}) dx?`,
    steps: [`Choosing u = x² + ${k} gives du = 2x dx, which matches the x in the numerator (up to a constant).`],
    a: `u = x² + ${k}`,
  };
}

export default {
  54: gen54,
  55: gen55,
  56: gen56,
  57: gen57,
  58: gen58,
  59: gen59,
  60: gen60,
  61: gen61,
  62: gen62,
  63: gen63,
  64: gen64,
  65: gen65,
  66: gen66,
};
