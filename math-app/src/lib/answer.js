// Fast local answer matching for the common cases, so most checks are instant
// and free. Anything not confirmed here is sent to /api/check, which judges
// equivalence with the model, so this only needs to avoid false positives.

function normalize(s) {
  return String(s)
    .toLowerCase()
    .replace(/\$|\\left|\\right|\\,|\\!|\\ /g, "")
    .replace(/\\dfrac|\\tfrac/g, "\\frac")
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)")
    .replace(/\\sqrt\{([^{}]*)\}/g, "sqrt($1)")
    .replace(/√\(?([\w.]+)\)?/g, "sqrt($1)")
    .replace(/\\pi|π/g, "pi")
    .replace(/\\cdot|\\times|×|·/g, "*")
    .replace(/[−–]/g, "-")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/\*\*/g, "^")
    .replace(/^[a-z]\s*=\s*/, "") // "x = 3" -> "3"
    .replace(/\s+/g, "")
    .replace(/[{}]/g, "")
    .replace(/\.$/, "");
}

// Evaluate a plain arithmetic expression (numbers, + - * / ^, parens, pi, e,
// sqrt). Returns NaN for anything else, including variables.
function evaluate(expr) {
  if (!/^[\d.+\-*/^()a-z]*$/.test(expr)) return NaN;
  const js = expr
    .replace(/sqrt/g, "Math.sqrt")
    .replace(/\bpi\b/g, "Math.PI")
    .replace(/\be\b/g, "Math.E")
    .replace(/\^/g, "**")
    .replace(/(\d)(\(|Math)/g, "$1*$2")
    .replace(/\)(\d|\(|Math)/g, ")*$1");
  if (/[a-z]/i.test(js.replace(/Math\.(sqrt|PI|E)/g, ""))) return NaN;
  try {
    const v = Function(`"use strict"; return (${js});`)();
    return typeof v === "number" ? v : NaN;
  } catch {
    return NaN;
  }
}

export function matchesLocally(problem, input) {
  if (problem.answerType === "proof" || problem.answerType === "text") return false;
  const given = normalize(input);
  if (!given) return false;
  const keys = [problem.answer, ...(problem.accept || [])].map(normalize);
  if (keys.includes(given)) return true;
  const g = evaluate(given);
  if (!Number.isFinite(g)) return false;
  return keys.some((k) => {
    const v = evaluate(k);
    return Number.isFinite(v) && Math.abs(v - g) <= 1e-6 * Math.max(1, Math.abs(v));
  });
}
