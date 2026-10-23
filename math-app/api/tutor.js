import { allowMethods, fail } from "./_lib/http.js";
import { applyTutorOutput, buildTutorContext, getNotes, getPlan, lastPlanTouched, saveNotes, subjectOf } from "./_lib/store.js";
import { NotesPush } from "../tutor/schema.js";

// The daily routine's door into the app's data. The routine (a Claude Code
// session on the Max plan, see tutor/ROUTINE.md) GETs the student's context,
// does the professor's work, and POSTs the result back. Guarded by
// TUTOR_TOKEN; disabled entirely until that env var is set. The subject
// (?subject= on GET, body.subject on POST) defaults to math. A POST with
// { notes } instead of { date, output } adds to the student's notes tab.
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
      const [todayPlan, touched, notes] = await Promise.all([getPlan(subject, context.today), lastPlanTouched(subject), getNotes(subject)]);
      res.status(200).json({
        ...context,
        todayPlanExists: !!todayPlan,
        lastPlanUntouched: !touched,
        // what's already in the notes tab, so the routine adds only what's new
        notes: notes.map((n) => ({ id: n.id, kind: n.kind, topicId: n.topicId, title: n.title.en, from: n.from })),
      });
      return;
    }
    const { date, output, force, notes } = req.body || {};
    const subject = subjectOf(req.body?.subject);
    if (notes) {
      res.status(200).json({ subject, saved: await saveNotes(subject, NotesPush.parse(notes)) });
      return;
    }
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
      res.status(400).json({ error: "output does not match the schema", issues: err.issues });
      return;
    }
    fail(res, err, "tutor");
  }
}
