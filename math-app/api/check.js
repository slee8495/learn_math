import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { allowMethods, checkPasscode, fail } from "./_lib/http.js";
import { FALLBACK, MODEL, client, describeProblem, langName } from "./_lib/claude.js";
import { getPlan, getSession, saveSession } from "./_lib/store.js";

const Verdict = z.object({
  correct: z.boolean(),
  answerRead: z.string().describe("The student's final answer as written, in plain text or LaTeX. Empty if none can be found."),
  feedback: z.string().describe("1-2 sentences to the student. If wrong, don't reveal the answer; point at what to re-check."),
});

// Grades one answer attempt and records it. The app matches simple answers
// locally first (localCorrect); anything it can't confirm comes here so that
// equivalent forms (2/4 vs 1/2, factored vs expanded) and proofs are judged
// by the model against the answer key. With `image` (their scratchpad), the
// final answer is read from the handwritten work instead of typed.
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"]) || !checkPasscode(req, res)) return;
  const { date, pid, answer = "", image, lang = "ko", localCorrect } = req.body || {};
  const photo = typeof image === "string" && image.match(/^data:(image\/[\w+.-]+);base64,(.*)$/);
  if (!date || !pid || typeof answer !== "string" || (!answer.trim() && !photo)) {
    res.status(400).json({ error: "date, pid and answer or image are required" });
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
    if (photo || !localCorrect) {
      via = photo ? "scratch" : "ai";
      const content = photo
        ? [
            { type: "image", source: { type: "base64", media_type: photo[1], data: photo[2] } },
            { type: "text", text: `${describeProblem(problem)}\n\nThe image is the student's handwritten scratchpad for this problem. Find their final answer (usually the last line, or circled/boxed) and grade it.${answer.trim() ? ` They also typed: ${answer}` : ""}` },
          ]
        : `${describeProblem(problem)}\n\nStudent's answer:\n${answer}`;
      const response = await client.beta.messages.parse({
        model: MODEL,
        max_tokens: 4000,
        output_config: { effort: problem.answerType === "proof" ? "high" : "low", format: betaZodOutputFormat(Verdict) },
        system: `You grade a student's answer against the answer key. Accept any mathematically equivalent form and harmless notation differences (e.g. typed "x^2" vs "x²", "sqrt(2)" vs "√2", missing "x =" prefix). For proofs, accept any correct and complete argument; reject gaps in logic, but not style. Grade the final answer; slips in intermediate lines that don't change it can be mentioned in feedback but don't make it wrong. Write feedback in ${langName(lang)}.`,
        messages: [{ role: "user", content }],
        ...FALLBACK,
      });
      verdict = response.parsed_output || { correct: false, feedback: "", answerRead: "" };
    }
    const recorded = photo ? `✎ ${verdict.answerRead || "?"}` : answer;

    const session = await getSession(date);
    session.attempts[pid] = [
      ...(session.attempts[pid] || []),
      { answer: recorded, correct: verdict.correct, via, feedback: verdict.feedback, at: new Date().toISOString() },
    ];
    await saveSession(date, session);
    res.status(200).json({ ...verdict, session });
  } catch (err) {
    fail(res, err, "check");
  }
}
