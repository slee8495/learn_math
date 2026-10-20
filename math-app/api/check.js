import { z } from "zod";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { allowMethods, checkPasscode, fail } from "./_lib/http.js";
import { FALLBACK, MODEL, client, describeProblem, langName } from "./_lib/claude.js";
import { getPlan, getSession, saveSession, subjectOf } from "./_lib/store.js";

const Verdict = z.object({
  correct: z.boolean(),
  answerRead: z.string().describe("The student's final answer as written, in plain text or LaTeX. Empty if none can be found."),
  feedback: z.string().describe("1-2 sentences to the student. If wrong, don't reveal the answer; point at what to re-check."),
});

const MAX_CODE = 6000;

// A run result from the browser ({ columns, rows, rowCount, value, stdout, error })
// as a few readable lines for the grader.
function describeRun(run) {
  if (!run) return "(not run)";
  const out = [];
  if (run.error) out.push(`Error: ${run.error}`);
  if (run.missing) out.push("`result` is not defined");
  if (run.none) out.push("`result` is None");
  if (run.columns) {
    out.push(`${run.rowCount ?? run.rows?.length ?? 0} row(s). Columns: ${run.columns.join(", ")}`);
    for (const row of (run.rows || []).slice(0, 15)) out.push(JSON.stringify(row));
  }
  if (run.value != null) out.push(`Value: ${String(run.value).slice(0, 1000)}`);
  if (run.stdout) out.push(`Printed: ${String(run.stdout).slice(0, 1000)}`);
  return out.join("\n") || "(no output)";
}

const CODE_SYSTEM = (lang) =>
  `You review a student's code for a data-interview practice problem. Their code and the reference solution were both run on the same sample data in the browser; you get both outputs and whether they matched exactly.
- If they matched, the answer is correct. In feedback, give one short code-review point an interviewer would make: an edge case it would miss on other data (NULLs, ties, duplicates, empty groups), readability, or a more idiomatic approach. If it's clean, say what's good about it in a few words.
- If they didn't match, decide whether the outputs are the same answer apart from presentation that the prompt didn't pin down (column names, harmless column order, row order when no order was asked for, float rounding). If so, it's correct. Otherwise it's wrong: say what differs (row count, a column's values, NULL handling, an error) and point at the part of their code to re-check, without writing the fix or showing the solution.
- Judge correctness on the data's logic, not luck: if their output matches only by coincidence of this sample (e.g. hardcoded values), it's wrong.
Write feedback in ${langName(lang)}, 1-3 sentences, code and column names as-is.`;

// Grades one answer attempt and records it. The app matches simple answers
// locally first (localCorrect); anything it can't confirm comes here so that
// equivalent forms (2/4 vs 1/2, factored vs expanded) and proofs are judged
// by the model against the answer key. With `image` (their scratchpad), the
// final answer is read from the handwritten work instead of typed. With `code`
// (sql/python problems), the app has already run it next to the reference
// solution: `run`/`expected` are the two outputs and localCorrect says
// whether they matched; the model reviews the code either way.
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"]) || !checkPasscode(req, res)) return;
  const { date, pid, answer = "", image, lang = "ko", localCorrect, code, run, expected, elapsed } = req.body || {};
  const subject = subjectOf(req.body?.subject);
  const photo = typeof image === "string" && image.match(/^data:(image\/[\w+.-]+);base64,(.*)$/);
  const isCode = typeof code === "string" && code.trim();
  if (!date || !pid || typeof answer !== "string" || (!answer.trim() && !photo && !isCode)) {
    res.status(400).json({ error: "date, pid and answer, image or code are required" });
    return;
  }
  try {
    const plan = await getPlan(subject, date);
    const problem = plan?.problems.find((p) => p.id === pid);
    if (!problem) {
      res.status(404).json({ error: "problem not found" });
      return;
    }

    let verdict = { correct: true, feedback: "" };
    let via = "local";
    if (isCode) {
      via = "code";
      const response = await client.beta.messages.parse({
        model: MODEL,
        max_tokens: 4000,
        output_config: { effort: "low", format: betaZodOutputFormat(Verdict) },
        system: CODE_SYSTEM(lang),
        messages: [
          {
            role: "user",
            content: `${describeProblem(problem)}\n\nStudent's code:\n${code.slice(0, MAX_CODE)}\n\nTheir output:\n${describeRun(run)}\n\nReference output:\n${describeRun(expected)}\n\nExact match: ${localCorrect ? "yes" : "no"}`,
          },
        ],
        ...FALLBACK,
      });
      verdict = response.parsed_output || { correct: false, feedback: "", answerRead: "" };
      // an exact match on the data is right whatever the review says
      if (localCorrect) verdict.correct = true;
    } else if (photo || !localCorrect) {
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
        output_config: { effort: problem.answerType === "proof" || problem.rubric?.length ? "high" : "low", format: betaZodOutputFormat(Verdict) },
        system: `You grade a student's answer against the answer key. Accept any mathematically equivalent form and harmless notation differences (e.g. typed "x^2" vs "x²", "sqrt(2)" vs "√2", missing "x =" prefix). For proofs, accept any correct and complete argument; reject gaps in logic, but not style. For written explanations with a rubric, it's correct when the essential points are there with sound reasoning (wording doesn't matter); in feedback, name what was strong and the most important point that was missing. Grade the final answer; slips in intermediate lines that don't change it can be mentioned in feedback but don't make it wrong. Write feedback in ${langName(lang)}.`,
        messages: [{ role: "user", content }],
        ...FALLBACK,
      });
      verdict = response.parsed_output || { correct: false, feedback: "", answerRead: "" };
    }
    const recorded = isCode ? code.slice(0, MAX_CODE) : photo ? `✎ ${verdict.answerRead || "?"}` : answer;

    const session = await getSession(subject, date);
    session.attempts[pid] = [
      ...(session.attempts[pid] || []),
      {
        answer: recorded,
        correct: verdict.correct,
        via,
        feedback: verdict.feedback,
        ...(isCode && { output: describeRun(run).slice(0, 1500) }),
        ...(Number.isFinite(elapsed) && { elapsed: Math.round(elapsed) }),
        at: new Date().toISOString(),
      },
    ];
    await saveSession(subject, date, session);
    res.status(200).json({ ...verdict, session });
  } catch (err) {
    fail(res, err, "check");
  }
}
