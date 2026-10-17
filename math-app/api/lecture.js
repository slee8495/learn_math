import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { allowMethods, checkPasscode, fail } from "./_lib/http.js";
import { FALLBACK, MODEL, client, describeProblem, describeStudent } from "./_lib/claude.js";
import { getJournals, getPlan, getSession, getState, saveSession } from "./_lib/store.js";
import { Lecture } from "../tutor/schema.js";

// On-demand blackboard lecture, built around what the student just asked for
// and what the chat shows they're stuck on. The day's default lecture is
// written in advance by the daily routine; this is only for extra requests.
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"]) || !checkPasscode(req, res)) return;
  const { date, pid, request = "" } = req.body || {};
  if (!date || !pid) {
    res.status(400).json({ error: "date and pid are required" });
    return;
  }
  try {
    const [plan, session, state, journals] = await Promise.all([getPlan(date), getSession(date), getState(), getJournals()]);
    const problem = plan?.problems.find((p) => p.id === pid);
    if (!problem) {
      res.status(404).json({ error: "problem not found" });
      return;
    }
    const chat = session.chat
      .filter((m) => m.pid === pid)
      .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.text}`)
      .join("\n");

    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: "medium", format: betaZodOutputFormat(Lecture) },
      system: `You are this student's personal mathematics professor. Write a short blackboard lecture (5-9 scenes) for them, tailored to exactly what they asked and to the confusion visible in their chat. Each scene: board = 1-4 short lines of Markdown/LaTeX ($...$) revealed one at a time; say = what you say aloud, plain words without LaTeX because it is read by text-to-speech (say "x squared", not "x^2"). Write both Korean (natural, not translated) and English. Teach the idea; do not just solve their current problem for them unless they asked for a walkthrough.`,
      messages: [
        {
          role: "user",
          content: [
            describeStudent(state, journals),
            describeProblem(problem),
            chat && `Chat so far:\n${chat}`,
            `What the student asked for: ${request || "Explain the idea behind this problem."}`,
          ]
            .filter(Boolean)
            .join("\n\n"),
        },
      ],
      ...FALLBACK,
    });
    const lecture = response.parsed_output;
    if (!lecture) throw new Error("Lecture generation failed");

    const fresh = await getSession(date);
    fresh.lectures.push({ pid, request, lecture, at: new Date().toISOString() });
    await saveSession(date, fresh);
    res.status(200).json({ lecture });
  } catch (err) {
    fail(res, err, "lecture");
  }
}
