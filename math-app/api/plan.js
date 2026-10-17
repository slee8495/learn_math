import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { allowMethods, checkPasscode, fail } from "./_lib/http.js";
import { FALLBACK, MODEL, client } from "./_lib/claude.js";
import { applyTutorOutput, buildTutorContext, getPlan, redis, todayCA } from "./_lib/store.js";
import { PROFESSOR_GUIDE } from "../tutor/professor.js";
import { TutorOutput } from "../tutor/schema.js";

// Fallback planner on the API. Normally the 5am Max-plan routine writes each
// day's plan; this runs only when the student asks for today's plan and the
// routine hasn't produced one (first day, or the routine failed).
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"]) || !checkPasscode(req, res)) return;
  const date = todayCA();
  try {
    if (await getPlan(date)) {
      res.status(200).json({ date, created: false });
      return;
    }
    const locked = await redis.set(`v2:lock:plan:${date}`, 1, { nx: true, ex: 600 });
    if (!locked) {
      res.status(409).json({ error: "already generating" });
      return;
    }

    try {
      const context = await buildTutorContext();
      const stream = client.beta.messages.stream({
        model: MODEL,
        max_tokens: 64000,
        output_config: { effort: "medium", format: betaZodOutputFormat(TutorOutput) },
        system: PROFESSOR_GUIDE,
        messages: [
          {
            role: "user",
            content: `Here is everything you know about your student so far. Today is ${date}. Write the record, update mastery, and plan today.\n\n${JSON.stringify(context)}`,
          },
        ],
        ...FALLBACK,
      });
      const message = await stream.finalMessage();
      if (message.stop_reason !== "end_turn") throw new Error(`Planning stopped early: ${message.stop_reason}`);
      const text = message.content.find((b) => b.type === "text")?.text;
      const result = await applyTutorOutput(JSON.parse(text), date);
      res.status(200).json({ ...result, created: true });
    } finally {
      await redis.del(`v2:lock:plan:${date}`);
    }
  } catch (err) {
    fail(res, err, "plan");
  }
}
