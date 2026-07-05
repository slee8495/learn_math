import { concepts } from "./concepts";
import { problemsByConcept } from "./problems";
import { seededShuffle } from "../utils/seededShuffle";

// ── Curriculum assembly ───────────────────────────────────────
// "Day" is not a calendar date — it's each profile's own position in
// the curriculum, driven entirely by how many days they've completed
// (see getCurrentDay() in useDailyProgress.js). Two people using the
// same link on their own pace legitimately see different Day numbers
// on the same real-world date; nothing here depends on wall-clock time.
//
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
