import { allowMethods, fail } from "./_lib/http.js";
import { applyTutorOutput, buildTutorContext, getPlan, subjectOf } from "./_lib/store.js";

// The daily routine's door into the app's data. The routine (a Claude Code
// session on the Max plan, see tutor/ROUTINE.md) GETs the student's context,
// does the professor's work, and POSTs the result back. Guarded by
// TUTOR_TOKEN; disabled entirely until that env var is set. The subject
// (?subject= on GET, body.subject on POST) defaults to math.
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST"])) return;
  const token = process.env.TUTOR_TOKEN;
  if (!token || req.headers.authorization !== `Bearer ${token}`) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  try {
    if (req.method === "GET") {
      const subject = subjectOf(req.query.subject);
      const context = await buildTutorContext(subject);
      res.status(200).json({ ...context, todayPlanExists: !!(await getPlan(subject, context.today)) });
      return;
    }
    const { date, output, force } = req.body || {};
    const subject = subjectOf(req.body?.subject);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "") || !output) {
      res.status(400).json({ error: "date (YYYY-MM-DD) and output are required" });
      return;
    }
    // Never replace a plan the student may already be working on.
    if (!force && (await getPlan(subject, date))) {
      res.status(409).json({ error: `a ${subject} plan for ${date} already exists` });
      return;
    }
    res.status(200).json(await applyTutorOutput(subject, output, date));
  } catch (err) {
    if (err?.name === "ZodError") {
      res.status(400).json({ error: "output does not match TutorOutput", issues: err.issues });
      return;
    }
    fail(res, err, "tutor");
  }
}
