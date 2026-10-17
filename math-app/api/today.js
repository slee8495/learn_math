import { allowMethods, checkPasscode, fail } from "./_lib/http.js";
import { getArchive, getCurrentPlanDate, getJournals, getPlan, getPlanDates, getSession, getState, todayCA } from "./_lib/store.js";

// Everything the app needs on open: the current day's plan and what has been
// done on it so far, plus the student's state for the header and records.
// ?archive=1 instead returns every past problem for the archive tab.
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"]) || !checkPasscode(req, res)) return;
  try {
    if (req.query.archive) {
      res.status(200).json({ days: await getArchive() });
      return;
    }
    const date = req.query.date || (await getCurrentPlanDate());
    const [dates, state, journals] = await Promise.all([getPlanDates(), getState(), getJournals()]);
    if (!date) {
      res.status(200).json({ today: todayCA(), date: null, plan: null, state, journals, dates });
      return;
    }
    const [plan, session] = await Promise.all([getPlan(date), getSession(date)]);
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
