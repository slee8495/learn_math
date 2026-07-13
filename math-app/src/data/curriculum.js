import { concepts } from "./concepts";
import { problemsByConcept } from "./problems";
import { seededShuffle } from "../utils/seededShuffle";
import { reviewGenerators } from "./reviewGenerators/index.js";
import { mulberry32 } from "../utils/seededRandom.js";

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

// Every QUIZ_INTERVAL_DAYS-th day is a review quiz instead of a new
// concept: it re-tests problems drawn from the days right before it,
// so material doesn't just get learned once and forgotten.
const QUIZ_INTERVAL_DAYS = 5;
const QUIZ_PROBLEMS_PER_DAY = 5;

export function isQuizDay(dayNum) {
  return dayNum % QUIZ_INTERVAL_DAYS === 0;
}

function getConceptIndexForDay(dayNum) {
  if (dayNum <= TOTAL_NEW_DAYS) {
    return Math.min(Math.floor((dayNum - 1) / CONCEPT_SPAN_DAYS), concepts.length - 1);
  }
  const reviewDay = dayNum - TOTAL_NEW_DAYS - 1;
  return reviewDay % concepts.length;
}

// The up to (QUIZ_INTERVAL_DAYS - 1) lesson days immediately before a
// quiz day, oldest first. Quiz days themselves are skipped so a quiz
// never reviews another quiz.
function getReviewWindowDays(dayNum) {
  const days = [];
  for (let d = dayNum - 1; d >= 1 && days.length < QUIZ_INTERVAL_DAYS - 1; d--) {
    if (!isQuizDay(d)) days.push(d);
  }
  return days.reverse();
}

// Quiz problems are freshly generated (not the same ones seen on the
// practice day) so a review quiz never just repeats what was already
// solved. Falls back to the static pool only if a concept has no
// generator yet.
const MAX_REGEN_ATTEMPTS = 8;

function getQuizProblemsForConcept(dayNum, concept) {
  const generate = reviewGenerators[concept.id];
  if (generate) {
    const practiceQs = new Set((problemsByConcept[concept.id] || []).map((p) => p.q));
    const usedQs = new Set();
    return Array.from({ length: QUIZ_PROBLEMS_PER_DAY }, (_, i) => {
      let problem;
      for (let attempt = 0; attempt < MAX_REGEN_ATTEMPTS; attempt++) {
        const seed = dayNum * 100000 + concept.id * 1000 + i * 37 + attempt * 613 + 7;
        problem = generate(mulberry32(seed));
        // Low-entropy concepts (a handful of fixed conceptual variants) may
        // not have enough distinct outputs to avoid every repeat forever;
        // accept the last attempt rather than loop indefinitely.
        if (!practiceQs.has(problem.q) && !usedQs.has(problem.q)) break;
      }
      usedQs.add(problem.q);
      return { ...problem, sourceConceptTitle: concept.title };
    });
  }
  const pool = problemsByConcept[concept.id] || [];
  return seededShuffle(pool, dayNum * 3000 + concept.id)
    .slice(0, Math.min(QUIZ_PROBLEMS_PER_DAY, pool.length))
    .map((p) => ({ ...p, sourceConceptTitle: concept.title }));
}

function getQuizLesson(dayNum) {
  const windowDays = getReviewWindowDays(dayNum);
  const parts = windowDays.map((d) => {
    const { concept } = getRegularDayLesson(d);
    const problems = getQuizProblemsForConcept(dayNum, concept);
    return { day: d, concept, problems };
  });

  const concept = {
    id: `quiz-${dayNum}`,
    unit: "Review Quiz",
    level: "Mixed review",
    title: windowDays.length
      ? `Days ${windowDays[0]}–${windowDays[windowDays.length - 1]} recap`
      : "Warm-up review",
    explain: parts.map((p) => `Day ${p.day}: ${p.concept.title}`),
  };

  return {
    dayNum,
    concept,
    problems: parts.flatMap((p) => p.problems),
    isReview: true,
    isQuiz: true,
    reviewDays: windowDays,
    dayInBlock: 1,
    conceptIndex: null,
    totalConcepts: concepts.length,
  };
}

function getRegularDayLesson(dayNum) {
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
    isQuiz: false,
    dayInBlock,
    conceptIndex,
    totalConcepts: concepts.length,
  };
}

export function getDayLesson(dayNum) {
  return isQuizDay(dayNum) ? getQuizLesson(dayNum) : getRegularDayLesson(dayNum);
}

// How many days back the daily review card reaches — yesterday and the
// day before that, so a concept still gets a second look even once it's
// no longer "yesterday's" material.
const REVIEW_WINDOW_DAYS = 2;

// One fresh problem (different from what was already solved that day)
// revisiting whatever concept a recent day covered. Quiz days are
// skipped as review sources since they mix several concepts rather than
// teaching one, and there's nothing before day 1 — so the window can
// come back with 0, 1, or REVIEW_WINDOW_DAYS entries.
function buildReviewForDay(dayNum, sourceDayNum) {
  const sourceLesson = getDayLesson(sourceDayNum);
  if (sourceLesson.isQuiz) return null;

  const { concept } = sourceLesson;
  const seenQs = new Set(sourceLesson.problems.map((p) => p.q));
  const generate = reviewGenerators[concept.id];

  let problem;
  if (generate) {
    for (let attempt = 0; attempt < MAX_REGEN_ATTEMPTS; attempt++) {
      const seed = dayNum * 100000 + sourceDayNum * 5000 + concept.id * 1000 + attempt * 613 + 11;
      problem = generate(mulberry32(seed));
      if (!seenQs.has(problem.q)) break;
    }
  } else {
    const pool = problemsByConcept[concept.id] || [];
    const fresh = seededShuffle(
      pool.filter((p) => !seenQs.has(p.q)),
      dayNum * 4000 + sourceDayNum * 200 + concept.id
    );
    problem = fresh[0] || seededShuffle(pool, dayNum * 4000 + sourceDayNum * 200 + concept.id)[0];
  }
  if (!problem) return null;

  return {
    sourceDayNum,
    concept,
    problem: { ...problem, sourceConceptTitle: concept.title },
  };
}

// Review entries for the most recent teachable days, oldest first (the
// day before yesterday, then yesterday) so the review flows in the same
// order the material was originally taught. Walks backward past quiz
// days rather than stopping at them, so a quiz on Day N doesn't shrink
// Day N+1's review down to a single entry — it just rolls one day
// further back to still find REVIEW_WINDOW_DAYS worth of material.
// Callers should treat an empty/null return as "skip" — e.g. day 1 has
// no prior days at all, and quiz days already *are* a multi-day review,
// so they skip the daily review card entirely rather than doubling up.
export function getReviewLesson(dayNum) {
  if (isQuizDay(dayNum)) return null;

  const reviews = [];
  for (let sourceDayNum = dayNum - 1; sourceDayNum >= 1 && reviews.length < REVIEW_WINDOW_DAYS; sourceDayNum--) {
    const review = buildReviewForDay(dayNum, sourceDayNum);
    if (review) reviews.push(review);
  }
  reviews.reverse();
  if (!reviews.length) return null;

  return { dayNum, reviews };
}

export function getTotalNewDays() {
  return TOTAL_NEW_DAYS;
}
