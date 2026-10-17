import Anthropic from "@anthropic-ai/sdk";
import roadmap from "../../tutor/roadmap.js";

// Live features (chat, grading, on-demand lectures, fallback planning) run on
// the API. The heavy daily planning normally runs on the Max plan via the
// scheduled routine (tutor/ROUTINE.md) and only falls back to this when needed.
export const MODEL = "claude-sonnet-5-5";

export const client = new Anthropic(); // reads ANTHROPIC_API_KEY

// Server-side refusal fallback: if a request is declined, the API re-runs it on
// Anthropic's recommended substitute instead of returning a refusal.
export const FALLBACK = { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" };

const topicNames = Object.fromEntries(
  roadmap.stages.flatMap((s) => s.topics.map((t) => [t.id, t])),
);

export function topicName(id, lang = "en") {
  return topicNames[id]?.[lang] || id;
}

export function langName(lang) {
  return lang === "ko" ? "Korean" : "English";
}

// A compact picture of the student for live prompts.
export function describeStudent(state, journals) {
  const mastery = Object.entries(state.mastery || {})
    .map(([id, m]) => `- ${topicName(id)}: level ${m.level}/5 — ${m.note?.en || ""}`)
    .join("\n");
  const latest = journals?.[0];
  return [
    state.profileNote?.en && `Professor's profile of this learner: ${state.profileNote.en}`,
    mastery && `Mastery so far:\n${mastery}`,
    latest && `Most recent teacher's record (${latest.date}): ${latest.entry.en}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function describeProblem(p) {
  return [
    `Problem (${p.id}, ${p.role}, topic: ${topicName(p.topicId)}, difficulty ${p.difficulty}/5):`,
    p.prompt.en,
    `Answer type: ${p.answerType}. Correct answer: ${p.answer}`,
    p.choices?.length ? `Choices: ${p.choices.join(" | ")}` : "",
    `Hints prepared: ${p.hints.map((h, i) => `${i + 1}) ${h.en}`).join(" ")}`,
    `Full solution: ${p.solution.en}`,
  ]
    .filter(Boolean)
    .join("\n");
}
