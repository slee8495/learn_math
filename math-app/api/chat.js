import { allowMethods, checkPasscode } from "./_lib/http.js";
import { FALLBACK, MODEL, client, describeProblem, describeStudent, langName } from "./_lib/claude.js";
import { getJournals, getPlan, getSession, getState, saveSession } from "./_lib/store.js";

function buildSystem({ lang, student, problem, session }) {
  const attempts = session.attempts[problem.id] || [];
  const gaveUp = !!session.solutionViewed[problem.id];
  return [
    `You are this student's personal mathematics professor, tutoring them live in a chat while they work on today's problem. The shared goal is for them to reach the level of a Duke University mathematics graduate.`,
    `How to tutor:
- Be Socratic. Find out what they're thinking, then give the smallest push that gets them moving. Ask one question at a time.
- Do not reveal the final answer or do the key step for them unless they explicitly ask for the answer or have already opened the solution. If they ask directly, you may give it, then make sure they understand why.
- When they make a mistake, point at where, not what the fix is, unless they've tried twice.
- If they send a scratchpad image, read their handwriting carefully and react to their actual work: say which line is right and where it first goes wrong.
- Pay attention to what their questions reveal about what they do and don't understand; it is recorded and used to plan their next lessons.
- The app has buttons for hints, the full solution, an easier/harder version of the problem and a blackboard lecture; you can suggest them.
- Keep replies short: this is a phone chat. A few sentences. Use Markdown and LaTeX ($...$ inline, $$...$$ display).
- Reply in ${langName(lang)} unless the student writes in the other language; then follow them.`,
    student,
    describeProblem(problem),
    `Their answer attempts so far: ${
      attempts.length ? attempts.map((a) => `"${a.answer}" (${a.correct ? "correct" : "wrong"})`).join(", ") : "none"
    }. Hints opened: ${session.hints[problem.id] || 0}/3. ${gaveUp ? "They have opened the full solution." : "They have NOT seen the solution."}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function toApiMessages(messages) {
  return messages.map((m, i) => {
    const isLast = i === messages.length - 1;
    if (m.role === "user" && m.image) {
      if (isLast) {
        const [, mediaType = "image/png", data] = m.image.match(/^data:(image\/\w+);base64,(.*)$/) || [];
        return {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data } },
            { type: "text", text: m.text || "Here is my scratchpad." },
          ],
        };
      }
      return { role: "user", content: `${m.text || ""}\n[attached a scratchpad image]`.trim() };
    }
    return { role: m.role, content: m.text };
  });
}

// Streams the tutor's reply as plain text, then records the exchange in the
// day's session so the professor can read it when planning.
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"]) || !checkPasscode(req, res)) return;

  const { date, pid, lang = "ko", messages } = req.body || {};
  if (!date || !pid || !Array.isArray(messages) || !messages.length) {
    res.status(400).json({ error: "date, pid and messages are required" });
    return;
  }

  let plan, session, state, journals;
  try {
    [plan, session, state, journals] = await Promise.all([getPlan(date), getSession(date), getState(), getJournals()]);
  } catch (err) {
    console.error("chat load error:", err);
    res.status(500).json({ error: "Could not load today's data" });
    return;
  }
  const problem = plan?.problems.find((p) => p.id === pid);
  if (!problem) {
    res.status(404).json({ error: "problem not found" });
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" });

  let reply = "";
  try {
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 4000,
      output_config: { effort: "medium" },
      system: buildSystem({ lang, student: describeStudent(state, journals), problem, session }),
      messages: toApiMessages(messages),
      ...FALLBACK,
    });
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        reply += event.delta.text;
        res.write(event.delta.text);
      }
    }
  } catch (err) {
    console.error("chat stream error:", err);
    if (!reply) res.write(lang === "ko" ? "지금 연결이 안 돼요. 잠시 후 다시 시도해 주세요." : "I couldn't connect just now. Please try again.");
    res.end();
    return;
  }

  // Record the exchange before ending the response: Vercel may freeze the
  // function as soon as the response is finished.
  try {
    const last = messages[messages.length - 1];
    const now = new Date().toISOString();
    const fresh = await getSession(date);
    fresh.chat.push(
      { role: "user", pid, text: last.text || "", image: !!last.image, at: now },
      { role: "assistant", pid, text: reply, at: now },
    );
    await saveSession(date, fresh);
  } catch (err) {
    console.error("chat save error:", err);
  }
  res.end();
}
