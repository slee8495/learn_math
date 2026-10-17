import { z } from "zod";

// Shared shape of everything the AI professor writes: used by the API fallback
// generator (as a structured-output schema), by /api/tutor (to validate what the
// daily Max-plan routine pushes), and by scripts/tutor.mjs (to validate locally
// before pushing). Every user-facing string is bilingual so the KO/EN toggle is
// instant and never needs a model call.

export const Bi = z.object({ ko: z.string(), en: z.string() });

export const ROLES = ["main", "easier", "harder", "angle", "retest"];
export const ANSWER_TYPES = ["number", "expression", "choice", "text", "proof"];
export const MOVES = ["diagnose", "advance", "hold", "easier", "new_angle", "retest", "review"];

export const Problem = z.object({
  id: z.string().describe("Short id unique within the day, e.g. p1, p2"),
  role: z.enum(ROLES).describe("main = today's core problem; others are branches chosen by how the main one goes"),
  topicId: z.string().describe("Topic id from roadmap.json"),
  difficulty: z.number().int().describe("1 (warm-up) to 5 (hard for this student right now)"),
  prompt: Bi.describe("Problem statement. Markdown with LaTeX in $...$ / $$...$$"),
  answerType: z.enum(ANSWER_TYPES),
  answer: z.string().describe("Canonical final answer, LaTeX allowed. For proof problems, a one-line summary of what must be shown"),
  accept: z
    .array(z.string())
    .describe("Plain-text forms a student might type that should count as correct (e.g. '3/4', '0.75'). Empty for proof/text"),
  choices: z.array(z.string()).describe("Options for choice problems, otherwise empty"),
  hints: z.array(Bi).describe("Exactly 3 progressively stronger hints"),
  solution: Bi.describe("Full step-by-step solution, markdown + LaTeX"),
});

export const Scene = z.object({
  board: Bi.describe("What appears on the blackboard: short markdown/LaTeX lines separated by newlines, revealed one line at a time"),
  say: Bi.describe("What the teacher says aloud during this scene (plain spoken text, no LaTeX)"),
});

export const Lecture = z.object({
  title: Bi,
  scenes: z.array(Scene),
});

export const Video = z.object({
  title: z.string(),
  url: z.string(),
  why: Bi,
});

export const Plan = z.object({
  stage: z.string().describe("Stage id from roadmap.json"),
  headline: Bi.describe("Today's theme in a few words"),
  decision: z.object({
    move: z.enum(MOVES),
    reason: Bi.describe("Why this is today's move, written to the student in 1-2 sentences"),
  }),
  problems: z.array(Problem),
  lecture: Lecture,
  videos: z.array(Video).describe("0-2 well-known lectures (3Blue1Brown, MIT OCW, Khan Academy...). Empty if none verified"),
});

export const MasteryUpdate = z.object({
  topicId: z.string(),
  level: z.number().int().describe("0 unseen, 1 shaky, 2 can follow, 3 solves alone, 4 applies flexibly, 5 can prove/explain"),
  note: Bi,
});

export const Journal = z.object({
  date: z.string().describe("YYYY-MM-DD of the session being described"),
  entry: Bi.describe("Teacher's record of the session, like a homeroom teacher's student record: concrete, honest, specific"),
  strengths: z.array(Bi),
  struggles: z.array(Bi),
});

// What one tutoring cycle (daily routine or API fallback) produces.
export const TutorOutput = z.object({
  journal: Journal.nullable().describe("Record of the most recent session; null if there was no activity to describe"),
  mastery: z.array(MasteryUpdate).describe("Only topics whose level or note changed"),
  stage: z.string().describe("The student's current roadmap stage id"),
  profileNote: Bi.describe("Running one-paragraph summary of who this student is as a learner, rewritten each time"),
  plan: Plan,
});
