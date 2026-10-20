import mathRoadmap from "./roadmap.js";
import { python, sql, stats } from "./career-roadmap.js";

// The library: every subject has its own roadmap, professor, plans, records
// and talk thread. `code` is the language its coding problems are written in.
// `role` and `aim` describe the professor to the model (English, for prompts).
export const SUBJECTS = [
  {
    id: "math",
    name: { ko: "수학", en: "Math" },
    roadmap: mathRoadmap,
    role: "mathematics professor",
    aim: "for them to reach the level of a Duke University mathematics graduate",
  },
  {
    id: "sql",
    name: { ko: "SQL", en: "SQL" },
    roadmap: sql,
    code: "sql",
    role: "SQL interview coach",
    aim: "for them to pass the SQL rounds of senior data scientist / analytics interviews, writing every query themselves without AI",
  },
  {
    id: "python",
    name: { ko: "Python", en: "Python" },
    roadmap: python,
    code: "python",
    role: "Python and pandas interview coach",
    aim: "for them to pass pandas take-homes and Python live coding in data interviews, writing every line themselves without AI",
  },
  {
    id: "stats",
    name: { ko: "통계·케이스", en: "Stats & cases" },
    roadmap: stats,
    role: "statistics and case-interview coach",
    aim: "for them to answer statistics, experimentation and business/investment case questions in data interviews clearly and with structure",
  },
];

export const SUBJECT_IDS = SUBJECTS.map((s) => s.id);

export function subjectById(id) {
  return SUBJECTS.find((s) => s.id === id) || SUBJECTS[0];
}

export const isCareer = (id) => id !== "math";

const allTopics = Object.fromEntries(
  SUBJECTS.flatMap((s) => s.roadmap.stages.flatMap((st) => st.topics.map((t) => [t.id, t]))),
);

export const topicById = (id) => allTopics[id];
