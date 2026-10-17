import { Redis } from "@upstash/redis";
import { TutorOutput } from "../../tutor/schema.js";
import roadmap from "../../tutor/roadmap.js";

// All v2 data lives under the "v2:" prefix so it never collides with the old
// app's "mathapp:*" keys (left in place, unused).
//
//   v2:state            { stage, mastery: { topicId: { level, note, updatedOn } }, profileNote, startedOn }
//   v2:dates            sorted set of plan dates (score = yyyymmdd)
//   v2:plan:<date>      the day's Plan (see tutor/schema.js) + { date }
//   v2:session:<date>   what happened that day: attempts, hints, solutions seen, chat
//   v2:journal          hash date -> Journal (the teacher's record)
export const redis = Redis.fromEnv();

const TZ = "America/Los_Angeles";

export function todayCA() {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

const dateScore = (date) => Number(date.replaceAll("-", ""));

export function emptySession() {
  return { attempts: {}, hints: {}, solutionViewed: {}, chat: [], lectures: [] };
}

export async function getState() {
  return (
    (await redis.get("v2:state")) || { stage: "s0", mastery: {}, profileNote: null, startedOn: null }
  );
}

export async function getPlanDates() {
  return (await redis.zrange("v2:dates", 0, -1)) || [];
}

export async function getPlan(date) {
  return redis.get(`v2:plan:${date}`);
}

export async function getSession(date) {
  return { ...emptySession(), ...((await redis.get(`v2:session:${date}`)) || {}) };
}

export async function saveSession(date, session) {
  await redis.set(`v2:session:${date}`, session);
}

export async function getJournals() {
  const all = (await redis.hgetall("v2:journal")) || {};
  return Object.values(all).sort((a, b) => (a.date < b.date ? 1 : -1));
}

// The most recent plan at or before today. Before the 5am routine runs, this is
// still yesterday's plan, so the app always has something to work on.
export async function getCurrentPlanDate() {
  const today = todayCA();
  const dates = await getPlanDates();
  const past = dates.filter((d) => d <= today);
  return past.length ? past[past.length - 1] : null;
}

// Everything the professor needs to decide the next move. Shared by the daily
// routine (via /api/tutor) and the API fallback generator.
export async function buildTutorContext({ recentDays = 7 } = {}) {
  const [state, dates, journals] = await Promise.all([getState(), getPlanDates(), getJournals()]);
  const recent = dates.slice(-recentDays);
  const days = await Promise.all(
    recent.map(async (date) => {
      const [plan, session] = await Promise.all([getPlan(date), getSession(date)]);
      return { date, plan, session };
    }),
  );
  return {
    today: todayCA(),
    dayCount: dates.length,
    roadmap,
    state,
    journals: journals.slice(0, 14),
    recentDays: days.map(({ date, plan, session }) => ({
      date,
      headline: plan?.headline?.en,
      decision: plan?.decision,
      problems: (plan?.problems || []).map((p) => ({
        id: p.id,
        role: p.role,
        topicId: p.topicId,
        difficulty: p.difficulty,
        prompt: p.prompt.en,
        answer: p.answer,
        attempts: session.attempts[p.id] || [],
        hintsUsed: session.hints[p.id] || 0,
        solutionViewed: !!session.solutionViewed[p.id],
      })),
      chat: session.chat.map((m) => ({ role: m.role, problem: m.pid, text: m.text, at: m.at })),
      lectureRequests: session.lectures.map((l) => l.request),
    })),
  };
}

// Validate and store one tutoring cycle's output as the plan for `date`.
export async function applyTutorOutput(raw, date) {
  const out = TutorOutput.parse(raw);
  const state = await getState();
  const mastery = { ...state.mastery };
  for (const m of out.mastery) {
    mastery[m.topicId] = { level: Math.max(0, Math.min(5, m.level)), note: m.note, updatedOn: date };
  }
  const nextState = {
    ...state,
    stage: out.stage,
    mastery,
    profileNote: out.profileNote,
    startedOn: state.startedOn || date,
  };
  await Promise.all([
    redis.set(`v2:plan:${date}`, { ...out.plan, date }),
    redis.zadd("v2:dates", { score: dateScore(date), member: date }),
    redis.set("v2:state", nextState),
    out.journal ? redis.hset("v2:journal", { [out.journal.date]: out.journal }) : null,
  ]);
  return { date, problems: out.plan.problems.length };
}
