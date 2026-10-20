import { Redis } from "@upstash/redis";
import { tutorOutputFor } from "../../tutor/schema.js";
import { SUBJECT_IDS, subjectById } from "../../tutor/subjects.js";

// All v2 data lives under the "v2:" prefix so it never collides with the old
// app's "mathapp:*" keys (left in place, unused). Math, the first subject,
// keeps the plain prefix; every other subject gets its own, e.g. "v2:sql:".
//
//   <p>state            { stage, mastery: { topicId: { level, note, updatedOn } }, profileNote, startedOn, passed? }
//   <p>dates            sorted set of plan dates (score = yyyymmdd)
//   <p>plan:<date>      the day's Plan (see tutor/schema.js) + { date }
//   <p>session:<date>   what happened that day: attempts, hints, solutions seen, chat
//   <p>journal          hash date -> Journal (the teacher's record)
//   <p>talk             list of messages in the ongoing professor conversation (not tied to a problem)
//   <p>talkimg:<id>     a photo the student sent there, as a data URL
export const redis = Redis.fromEnv();

const TZ = "America/Los_Angeles";

// A request's subject; anything unknown (or missing, as from older clients) is math.
export const subjectOf = (value) => (SUBJECT_IDS.includes(value) ? value : "math");

export const key = (subject, rest) => (subject === "math" ? `v2:${rest}` : `v2:${subject}:${rest}`);

export function todayCA() {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

const dateScore = (date) => Number(date.replaceAll("-", ""));

export function emptySession() {
  return { attempts: {}, hints: {}, solutionViewed: {}, chat: [], lectures: [] };
}

export async function getState(subject) {
  return (
    (await redis.get(key(subject, "state"))) || {
      stage: subjectById(subject).roadmap.stages[0].id,
      mastery: {},
      profileNote: null,
      startedOn: null,
    }
  );
}

export async function getPlanDates(subject) {
  return (await redis.zrange(key(subject, "dates"), 0, -1)) || [];
}

export async function getPlan(subject, date) {
  return redis.get(key(subject, `plan:${date}`));
}

export async function getSession(subject, date) {
  return { ...emptySession(), ...((await redis.get(key(subject, `session:${date}`))) || {}) };
}

export async function saveSession(subject, date, session) {
  await redis.set(key(subject, `session:${date}`), session);
}

export async function getJournals(subject) {
  const all = (await redis.hgetall(key(subject, "journal"))) || {};
  return Object.values(all).sort((a, b) => (a.date < b.date ? 1 : -1));
}

const isDone = (session, pid) => (session.attempts[pid] || []).some((a) => a.correct) || !!session.solutionViewed[pid];

// The library screen: each subject's stage and how far today's set has got.
export async function getLibrary() {
  return Promise.all(
    SUBJECT_IDS.map(async (subject) => {
      const [state, date] = await Promise.all([getState(subject), getCurrentPlanDate(subject)]);
      if (!date) return { subject, stage: state.stage, date: null };
      const [plan, session] = await Promise.all([getPlan(subject, date), getSession(subject, date)]);
      const round = plan?.round || 1;
      const problems = (plan?.problems || []).filter((p) => (p.round || 1) === round);
      return {
        subject,
        stage: state.stage,
        date,
        total: problems.length,
        done: problems.filter((p) => isDone(session, p.id)).length,
      };
    }),
  );
}

// Every day's problems with how each went, for the archive tab. Only what a
// list needs (no solutions or hints), fetched in one round trip.
export async function getArchive(subject) {
  const dates = await getPlanDates(subject);
  if (!dates.length) return [];
  const values = await redis.mget(...dates.flatMap((d) => [key(subject, `plan:${d}`), key(subject, `session:${d}`)]));
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
export async function getTalk(subject, { before, limit = 50 } = {}) {
  const total = await redis.llen(key(subject, "talk"));
  const end = Math.min(before ?? total, total);
  const start = Math.max(0, end - limit);
  const messages = end > start ? await redis.lrange(key(subject, "talk"), start, end - 1) : [];
  return { messages, start };
}

export async function appendTalk(subject, ...messages) {
  await redis.rpush(key(subject, "talk"), ...messages);
}

export async function saveTalkImage(subject, id, dataUrl) {
  await redis.set(key(subject, `talkimg:${id}`), dataUrl);
}

export async function getTalkImage(subject, id) {
  return redis.get(key(subject, `talkimg:${id}`));
}

// The most recent plan at or before today. Before the 5am routine runs, this is
// still yesterday's plan, so the app always has something to work on.
export async function getCurrentPlanDate(subject) {
  const today = todayCA();
  const dates = await getPlanDates(subject);
  const past = dates.filter((d) => d <= today);
  return past.length ? past[past.length - 1] : null;
}

// Math topics the stats professor calibrates against.
const RELATED_MATH = ["probability", "random-variables", "limit-theorems"];

// Everything the professor needs to decide the next move. Shared by the daily
// routine (via /api/tutor) and the API fallback generator.
export async function buildTutorContext(subject, { recentDays = 7 } = {}) {
  const [state, dates, journals, talk, mathState] = await Promise.all([
    getState(subject),
    getPlanDates(subject),
    getJournals(subject),
    getTalk(subject, { limit: 120 }),
    subject === "stats" ? getState("math") : null,
  ]);
  const recent = dates.slice(-recentDays);
  const talkSince = new Date(Date.now() - recentDays * 86400000).toISOString();
  const days = await Promise.all(
    recent.map(async (date) => {
      const [plan, session] = await Promise.all([getPlan(subject, date), getSession(subject, date)]);
      return { date, plan, session };
    }),
  );
  return {
    subject,
    today: todayCA(),
    dayCount: dates.length,
    roadmap: subjectById(subject).roadmap,
    state,
    ...(mathState && {
      relatedMath: Object.fromEntries(RELATED_MATH.filter((id) => mathState.mastery?.[id]).map((id) => [id, mathState.mastery[id]])),
    }),
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
        answerType: p.answerType,
        ...(p.minutes ? { minutes: p.minutes } : {}),
        prompt: p.prompt.en,
        answer: p.answer,
        attempts: session.attempts[p.id] || [],
        hintsUsed: session.hints[p.id] || 0,
        solutionViewed: !!session.solutionViewed[p.id],
      })),
      chat: session.chat.map((m) => ({ role: m.role, problem: m.pid, text: m.text, at: m.at })),
    })),
    talk: talk.messages
      .filter((m) => m.at >= talkSince)
      .map((m) => ({ role: m.role, text: m.text, photos: m.images?.length || 0, at: m.at })),
  };
}

// Validate and store one tutoring cycle's output as the plan for `date`.
// With extraRound, the new problems are added to that day's existing plan as
// its next round (ids prefixed so each round's attempts stay separate), and the
// day's headline and decision become the new round's.
export async function applyTutorOutput(subject, raw, date, { extraRound = false } = {}) {
  const out = tutorOutputFor(subject).parse(raw);
  let plan = { ...out.plan, date };
  if (extraRound) {
    const prev = await getPlan(subject, date);
    const round = (prev.round || 1) + 1;
    plan = {
      ...plan,
      round,
      problems: [
        ...prev.problems.map((p) => ({ round: 1, ...p })),
        ...out.plan.problems.map((p) => ({ ...p, id: `r${round}${p.id}`, round })),
      ],
    };
  }
  const state = await getState(subject);
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
    ...(out.passedStages && { passed: out.passedStages }),
  };
  await Promise.all([
    redis.set(key(subject, `plan:${date}`), plan),
    redis.zadd(key(subject, "dates"), { score: dateScore(date), member: date }),
    redis.set(key(subject, "state"), nextState),
    out.journal ? redis.hset(key(subject, "journal"), { [out.journal.date]: out.journal }) : null,
  ]);
  return { subject, date, problems: out.plan.problems.length, round: plan.round || 1 };
}
