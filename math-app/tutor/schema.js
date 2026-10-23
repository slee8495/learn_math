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

export const Plan = z.object({
  stage: z.string().describe("Stage id from roadmap.json"),
  headline: Bi.describe("Today's theme in a few words"),
  decision: z.object({
    move: z.enum(MOVES),
    reason: Bi.describe("Why this is today's move, written to the student in 1-2 sentences"),
  }),
  problems: z.array(Problem),
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

// ---- Career subjects (sql, python, stats) ----
// Same cycle, plus coding problems whose answer is the student's own code. The
// app runs it in the browser (SQLite via sql.js, Python via Pyodide) next to
// the reference solution and compares the two results.

export const CAREER_ANSWER_TYPES = ["number", "expression", "choice", "text", "sql", "python"];

export const CodeSpec = z.object({
  setup: z
    .string()
    .describe("sql: SQLite CREATE TABLE + INSERT statements. python: code that imports pandas as pd and builds the inputs. Runs before the student's code"),
  starter: z.string().describe("Optional code shown in the editor at the start (a comment or skeleton); empty for a blank editor"),
  solution: z.string().describe("Reference solution. sql: one query. python: code that assigns the answer to `result`"),
  ordered: z.boolean().describe("true only if the prompt requires a specific row order"),
});

export const CareerProblem = Problem.extend({
  answerType: z.enum(CAREER_ANSWER_TYPES),
  code: CodeSpec.nullable().describe("Required for sql/python problems, null otherwise"),
  rubric: z
    .array(z.string())
    .describe("For text answers: 3-6 key points a strong interview answer covers (English, for the grader). Empty otherwise"),
  minutes: z.number().int().describe("Time limit in minutes (Easy 10, Medium 20, Hard 30) once timed practice starts; 0 for no timer"),
});

export const CareerPlan = Plan.extend({ problems: z.array(CareerProblem) });

export const CareerTutorOutput = TutorOutput.extend({
  plan: CareerPlan,
  passedStages: z
    .array(z.string())
    .describe("Every stage id whose gate (pass criterion) the student has met so far, cumulative"),
});

export const tutorOutputFor = (subject) => (subject === "math" ? TutorOutput : CareerTutorOutput);

// ---- Notes ----
// The student's own collection: code they finished and concepts they now
// understand, kept per subject. The routine adds to it each night; a note
// pushed again with the same id replaces the old one.

export const NOTE_KINDS = ["code", "concept"];

export const Note = z.object({
  id: z.string().describe("Stable slug, e.g. 'window-rank-ties'. Reuse an existing note's id to replace it"),
  kind: z.enum(NOTE_KINDS).describe("code = a solution the student wrote; concept = an idea they now understand"),
  topicId: z.string().describe("Topic id from the subject's roadmap"),
  title: Bi.describe("A few words naming the pattern or concept"),
  body: Bi.describe("Short reference card, markdown + LaTeX: the key idea, when to use it, the trap to avoid"),
  code: z.string().describe("kind=code: the student's own final correct code, verbatim. Empty for concepts"),
  from: z.string().describe("Where it came from: 'YYYY-MM-DD <problem id>' or 'YYYY-MM-DD talk'"),
});

export const NotesPush = z.array(Note);
