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
//   v2:talk             list of messages in the ongoing professor conversation (not tied to a problem)
//   v2:talkimg:<id>     a photo the student sent there, as a data URL
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

// Every day's problems with how each went, for the archive tab. Only what a
// list needs (no solutions, hints or lectures), fetched in one round trip.
export async function getArchive() {
  const dates = await getPlanDates();
  if (!dates.length) return [];
  const values = await redis.mget(...dates.flatMap((d) => [`v2:plan:${d}`, `v2:session:${d}`]));
  return dates.map((date, i) => {
    const plan = values[i * 2];
    const session = { ...emptySession(), ...(values[i * 2 + 1] || {}) };
    return {
      date,
      dayNum: i + 1,
      headline: plan?.headline,
      problems: (plan?.problems || []).map((p) => {
        const attempts = session.attempts[p.id] || [];
        return {
          id: p.id,
          role: p.role,
          topicId: p.topicId,
          prompt: p.prompt,
          solved: attempts.some((a) => a.correct),
          attempts: attempts.length,
          hints: session.hints[p.id] || 0,
          gaveUp: !!session.solutionViewed[p.id],
        };
      }),
    };
  });
}

// The ongoing professor conversation. Messages are only ever appended, so list
// indices are stable and work as paging cursors.
//   { id, role: "user" | "assistant", text, images: [imageId], at }
export async function getTalk({ before, limit = 50 } = {}) {
  const total = await redis.llen("v2:talk");
  const end = Math.min(before ?? total, total);
  const start = Math.max(0, end - limit);
  const messages = end > start ? await redis.lrange("v2:talk", start, end - 1) : [];
  return { messages, start };
}

export async function appendTalk(...messages) {
  await redis.rpush("v2:talk", ...messages);
}

export async function saveTalkImage(id, dataUrl) {
  await redis.set(`v2:talkimg:${id}`, dataUrl);
}

export async function getTalkImage(id) {
  return redis.get(`v2:talkimg:${id}`);
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
  const [state, dates, journals, talk] = await Promise.all([
    getState(),
    getPlanDates(),
    getJournals(),
    getTalk({ limit: 120 }),
  ]);
  const recent = dates.slice(-recentDays);
  const talkSince = new Date(Date.now() - recentDays * 86400000).toISOString();
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
    talk: talk.messages
      .filter((m) => m.at >= talkSince)
      .map((m) => ({ role: m.role, text: m.text, photos: m.images?.length || 0, at: m.at })),
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
