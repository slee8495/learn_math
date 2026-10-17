import { allowMethods, checkPasscode, fail } from "./_lib/http.js";
import { getSession, saveSession } from "./_lib/store.js";

// Small study events the professor wants to know about: opening a hint,
// giving up and opening the solution.
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"]) || !checkPasscode(req, res)) return;
  const { date, pid, op } = req.body || {};
  if (!date || !pid || !["hint", "solution"].includes(op)) {
    res.status(400).json({ error: "date, pid and a valid op are required" });
    return;
  }
  try {
    const session = await getSession(date);
    if (op === "hint") session.hints[pid] = Math.min(3, (session.hints[pid] || 0) + 1);
    if (op === "solution") session.solutionViewed[pid] = true;
    await saveSession(date, session);
    res.status(200).json({ session });
  } catch (err) {
    fail(res, err, "session");
  }
}
