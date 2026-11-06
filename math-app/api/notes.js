import { randomUUID } from "node:crypto";
import { allowMethods, checkPasscode, fail } from "./_lib/http.js";
import { deleteNote, saveStudentNote, subjectOf } from "./_lib/store.js";
import { Note } from "../tutor/schema.js";

// The student's own changes to the notes tab (reading is GET /api/today?notes=1).
//   POST { subject, note }            -> adds it (no id) or replaces it, as the student's
//   POST { subject, delete: <id> }    -> removes it
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"]) || !checkPasscode(req, res)) return;
  const subject = subjectOf(req.body?.subject);
  try {
    if (req.body?.delete) {
      await deleteNote(subject, String(req.body.delete));
      res.status(200).json({ deleted: req.body.delete });
      return;
    }
    const raw = req.body?.note || {};
    const note = Note.parse({ ...raw, id: raw.id || `mine-${randomUUID().slice(0, 8)}`, from: raw.from || "" });
    res.status(200).json({ note: await saveStudentNote(subject, note) });
  } catch (err) {
    if (err?.name === "ZodError") {
      res.status(400).json({ error: "invalid note", issues: err.issues });
      return;
    }
    fail(res, err, "notes");
  }
}
