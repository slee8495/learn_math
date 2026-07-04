import Anthropic from "@anthropic-ai/sdk";

// Change this one line to switch models (see math_app.md for the tradeoffs).
const MODEL = "claude-haiku-4-5";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

function describeConcept(concept) {
  if (!concept) return "";
  const explain = (concept.explain || []).map((b) => `- ${b}`).join("\n");
  const ex = concept.example;
  return [
    `Unit: ${concept.unit} (${concept.level})`,
    `Concept: ${concept.title}`,
    explain && `Key points:\n${explain}`,
    ex && `Worked example: ${ex.problem}`,
    ex && `Worked example steps: ${(ex.steps || []).join(" ")}`,
    ex && `Worked example answer: ${ex.answer}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function describeProblems(problems) {
  if (!problems || !problems.length) return "";
  return problems
    .map((p, i) => {
      const steps = p.steps ? ` Steps: ${p.steps.join(" ")} Answer: ${p.a}` : "";
      return `Problem ${i + 1}: ${p.q}${steps}`;
    })
    .join("\n");
}

function buildSystemPrompt(context = {}) {
  const { view, dayNum, isReview, profile, concept, problems } = context;

  const viewLabel = {
    home: "the home dashboard",
    concept: "today's Concept screen (learning the idea for the first time)",
    problem: "the Practice Problems screen (attempting problems, has NOT seen the solution yet)",
    solution: "the Solution Walkthrough screen (reviewing full step-by-step solutions)",
    library: "the Concept Library (browsing the full curriculum reference)",
  }[view] || "the app";

  return [
    `You are a friendly, encouraging math tutor built into "Daily Math", a day-by-day math curriculum app for ${profile || "the student"}.`,
    `You can see exactly what they're looking at right now — use this to give specific, relevant help instead of generic answers.`,
    `Current screen: ${viewLabel}.${dayNum ? ` Day ${dayNum}${isReview ? " (review)" : ""}.` : ""}`,
    concept && describeConcept(concept),
    problems && problems.length ? `Problems currently shown:\n${describeProblems(problems)}` : "",
    view === "problem"
      ? "The student hasn't seen the solution yet. Prefer Socratic hints and guiding questions over immediately giving the final answer, unless they explicitly ask for it directly."
      : "",
    "Keep replies short — a few sentences, this is a small mobile chat widget, not an essay. Use plain text, no LaTeX or markdown tables. Reply in whichever language the student writes in (English or Korean).",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: "ANTHROPIC_API_KEY is not configured on the server." });
    return;
  }

  try {
    const { messages, context } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: buildSystemPrompt(context),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const text = response.content.find((b) => b.type === "text")?.text || "";
    res.status(200).json({ reply: text });
  } catch (err) {
    console.error("chat api error:", err);
    res.status(500).json({ error: "Failed to reach Claude. Please try again." });
  }
}
