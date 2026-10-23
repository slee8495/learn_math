import { allowMethods, checkPasscode, fail } from "./_lib/http.js";
import {
  getArchive,
  getCurrentPlanDate,
  getJournals,
  getLibrary,
  getNotes,
  getPlan,
  getPlanDates,
  getSession,
  getState,
  subjectOf,
  todayCA,
} from "./_lib/store.js";

// Everything the app needs on open: the current day's plan for ?subject= and
// what has been done on it so far, plus the student's state for the header
// and records. ?archive=1 instead returns every past problem for the archive
// tab, ?notes=1 the notes tab, and ?library=1 a one-line status of every subject.
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"]) || !checkPasscode(req, res)) return;
  const subject = subjectOf(req.query.subject);
  try {
    if (req.query.library) {
      res.status(200).json({ today: todayCA(), subjects: await getLibrary() });
      return;
    }
    if (req.query.archive) {
      res.status(200).json({ days: await getArchive(subject) });
      return;
    }
    if (req.query.notes) {
      res.status(200).json({ notes: await getNotes(subject) });
      return;
    }
    const date = req.query.date || (await getCurrentPlanDate(subject));
    const [dates, state, journals] = await Promise.all([getPlanDates(subject), getState(subject), getJournals(subject)]);
    if (!date) {
      res.status(200).json({ today: todayCA(), date: null, plan: null, state, journals, dates });
      return;
    }
    const [plan, session] = await Promise.all([getPlan(subject, date), getSession(subject, date)]);
    res.status(200).json({
      today: todayCA(),
      date,
      dayNum: dates.indexOf(date) + 1,
      plan,
      session,
      state,
      journals,
      dates,
    });
  } catch (err) {
    fail(res, err, "today");
  }
}
