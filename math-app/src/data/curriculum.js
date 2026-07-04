import { concepts } from "./concepts";
import { problemsByConcept } from "./problems";
import { seededShuffle } from "../utils/seededShuffle";

// ── Day-number math ───────────────────────────────────────────
// "Today" is always computed in a fixed reference timezone, not the
// device's local time — otherwise the day number can be off by one
// depending on where the phone thinks it is.
export const TIMEZONE = "America/Los_Angeles";

// Day 1 of the curriculum. Fixed once, never recomputed at runtime.
const START = { y: 2026, m: 7, d: 3 };

function pad(n) {
  return String(n).padStart(2, "0");
}

const START_KEY = `${START.y}-${pad(START.m)}-${pad(START.d)}`;

function dateKeyToUTCms(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function getCaliforniaToday() {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date()); // "YYYY-MM-DD"
}

// Today's date key — used to key localStorage progress entries.
export function dateKey() {
  return getCaliforniaToday();
}

export function getDayNumber() {
  const todayKey = getCaliforniaToday();
  const diffDays = Math.round(
    (dateKeyToUTCms(todayKey) - dateKeyToUTCms(START_KEY)) / 86400000
  );
  return Math.max(1, diffDays + 1);
}

export function dayNumToDateKey(dayNum) {
  const ms = dateKeyToUTCms(START_KEY) + (dayNum - 1) * 86400000;
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

// Curriculum day number for an arbitrary calendar date (used by the
// calendar view — dates before START have no lesson, dates after
// today are shown but not yet reachable).
export function dateKeyToDayNum(dateKeyStr) {
  const diffDays = Math.round(
    (dateKeyToUTCms(dateKeyStr) - dateKeyToUTCms(START_KEY)) / 86400000
  );
  return diffDays + 1;
}

export function startDateKey() {
  return START_KEY;
}

// ── Curriculum assembly ───────────────────────────────────────
// One new concept per day (CONCEPT_SPAN_DAYS = 1). Each concept's
// problem bank is small (4 problems, matching PROBLEMS_PER_DAY), so
// spreading a single concept across multiple days showed the exact
// same 4 problems every time — reordered, but not actually different.
// A fresh concept daily keeps the problems fresh too, since the pool
// changes with the concept. After the full concept list has been
// covered once, the curriculum loops back into "review mode" — same
// concepts, new seeded problem combinations — rather than stopping.
const CONCEPT_SPAN_DAYS = 1;
const TOTAL_NEW_DAYS = concepts.length * CONCEPT_SPAN_DAYS;
const PROBLEMS_PER_DAY = 4;

function getConceptIndexForDay(dayNum) {
  if (dayNum <= TOTAL_NEW_DAYS) {
    return Math.min(Math.floor((dayNum - 1) / CONCEPT_SPAN_DAYS), concepts.length - 1);
  }
  const reviewDay = dayNum - TOTAL_NEW_DAYS - 1;
  return reviewDay % concepts.length;
}

export function getDayLesson(dayNum) {
  const conceptIndex = getConceptIndexForDay(dayNum);
  const concept = concepts[conceptIndex];
  const pool = problemsByConcept[concept.id] || [];
  const problems = seededShuffle(pool, dayNum * 1000 + concept.id).slice(
    0,
    Math.min(PROBLEMS_PER_DAY, pool.length)
  );
  const isReview = dayNum > TOTAL_NEW_DAYS;
  const dayInBlock = ((dayNum - 1) % CONCEPT_SPAN_DAYS) + 1; // 1..CONCEPT_SPAN_DAYS

  return {
    dayNum,
    concept,
    problems,
    isReview,
    dayInBlock,
    conceptIndex,
    totalConcepts: concepts.length,
  };
}

export function getTotalNewDays() {
  return TOTAL_NEW_DAYS;
}
