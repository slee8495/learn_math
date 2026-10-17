import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { allowMethods, checkPasscode, fail } from "./_lib/http.js";
import { FALLBACK, MODEL, client, describeProblem, langName } from "./_lib/claude.js";
import { getPlan, getSession, saveSession } from "./_lib/store.js";

const Verdict = z.object({
  correct: z.boolean(),
  feedback: z.string().describe("1-2 sentences to the student. If wrong, don't reveal the answer; point at what to re-check."),
});

// Grades one answer attempt and records it. The app matches simple answers
// locally first (localCorrect); anything it can't confirm comes here so that
// equivalent forms (2/4 vs 1/2, factored vs expanded) and proofs are judged
// by the model against the answer key.
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"]) || !checkPasscode(req, res)) return;
  const { date, pid, answer, lang = "ko", localCorrect } = req.body || {};
  if (!date || !pid || typeof answer !== "string" || !answer.trim()) {
    res.status(400).json({ error: "date, pid and answer are required" });
    return;
  }
  try {
    const plan = await getPlan(date);
    const problem = plan?.problems.find((p) => p.id === pid);
    if (!problem) {
      res.status(404).json({ error: "problem not found" });
      return;
    }

    let verdict = { correct: true, feedback: "" };
    let via = "local";
    if (!localCorrect) {
      via = "ai";
      const response = await client.beta.messages.parse({
        model: MODEL,
        max_tokens: 4000,
        output_config: { effort: problem.answerType === "proof" ? "high" : "low", format: betaZodOutputFormat(Verdict) },
        system: `You grade a student's answer against the answer key. Accept any mathematically equivalent form and harmless notation differences (e.g. typed "x^2" vs "x²", "sqrt(2)" vs "√2", missing "x =" prefix). For proofs, accept any correct and complete argument; reject gaps in logic, but not style. Write feedback in ${langName(lang)}.`,
        messages: [{ role: "user", content: `${describeProblem(problem)}\n\nStudent's answer:\n${answer}` }],
        ...FALLBACK,
      });
      verdict = response.parsed_output || { correct: false, feedback: "" };
    }

    const session = await getSession(date);
    session.attempts[pid] = [
      ...(session.attempts[pid] || []),
      { answer, correct: verdict.correct, via, feedback: verdict.feedback, at: new Date().toISOString() },
    ];
    await saveSession(date, session);
    res.status(200).json({ ...verdict, session });
  } catch (err) {
    fail(res, err, "check");
  }
}
