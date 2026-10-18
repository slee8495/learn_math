import { randomUUID } from "node:crypto";
import { allowMethods, checkPasscode, fail } from "./_lib/http.js";
import { FALLBACK, MODEL, client, describeStudent, langName, topicName } from "./_lib/claude.js";
import {
  appendTalk,
  getCurrentPlanDate,
  getJournals,
  getPlan,
  getSession,
  getState,
  getTalk,
  getTalkImage,
  saveSession,
  saveTalkImage,
} from "./_lib/store.js";

const HISTORY = 40; // messages of the thread the professor sees each turn
const IMAGE_TURNS = 3; // the newest user messages whose photos are sent as images
const MAX_IMAGES = 4; // per message

function describeToday(plan, session) {
  if (!plan) return "";
  const lines = plan.problems.map((p) => {
    const attempts = session.attempts[p.id] || [];
    const status = attempts.some((a) => a.correct)
      ? "solved"
      : session.solutionViewed[p.id]
        ? "gave up and opened the solution"
        : attempts.length
          ? `${attempts.length} wrong attempt(s)`
          : "not attempted";
    return `- ${p.id} (${p.role}, ${topicName(p.topicId)}): ${p.prompt.en}\n  Correct answer: ${p.answer}. Status: ${status}. Hints opened: ${session.hints[p.id] || 0}/3.`;
  });
  return `Today's assigned problems (${plan.date}, "${plan.headline.en}"):\n${lines.join("\n")}`;
}

function buildSystem({ lang, student, today }) {
  return [
    `You are this student's personal mathematics professor. This is your ongoing conversation with them, outside any single problem: office hours that continue across days. The shared goal is for them to reach the level of a Duke University mathematics graduate.`,
    `How to help:
- They may ask anything: a concept, a problem from a book, today's assigned problem, how to study. Answer as their professor who knows them.
- When they send photos of their handwritten work, read every line carefully. Say which steps are right, point at the first line where it goes wrong and why, and name the misconception if there is one. Be concrete ("line 3: the 2 should be squared too"), not vague.
- If they are stuck, find where, and give the smallest push that gets them moving. Ask one question at a time. If they ask for a full explanation or solution, give it clearly.
- For today's assigned problems: when their work (a photo or what they type) reaches the correct final answer to one that isn't solved yet, tell them, then call record_solved so it counts as solved in the app. Write your whole reply first; the call comes last. Don't call it for a wrong or unfinished answer, or for a different problem.
- Don't reveal the final answer unless they ask for it directly or have already opened the solution.
- If a photo is unreadable, say which part and ask for a clearer one.
- What they ask here is recorded and read when their next lessons are planned.
- Keep replies fairly short: this is a phone chat. Use Markdown and LaTeX ($...$ inline, $$...$$ display).
- Reply in ${langName(lang)} unless the student writes in the other language; then follow them.`,
    student,
    today,
  ]
    .filter(Boolean)
    .join("\n\n");
}

const isSolved = (session, pid) => (session.attempts[pid] || []).some((a) => a.correct);

// Offered while some of today's problems are still open, so a solution checked
// here doesn't have to be typed into the problem again.
function solveTool(plan, session) {
  const open = plan?.problems.filter((p) => !isSolved(session, p.id)).map((p) => p.id) || [];
  if (!open.length) return [];
  return [
    {
      name: "record_solved",
      description: "Mark one of today's assigned problems solved, after confirming the student's own final answer to it is correct.",
      input_schema: {
        type: "object",
        properties: {
          problemId: { type: "string", enum: open },
          answer: { type: "string", description: "Their final answer as they wrote it, plain text or LaTeX." },
        },
        required: ["problemId", "answer"],
      },
    },
  ];
}

async function recordSolved(planDate, calls) {
  const session = await getSession(planDate);
  for (const { problemId, answer } of calls) {
    if (isSolved(session, problemId)) continue;
    session.attempts[problemId] = [
      ...(session.attempts[problemId] || []),
      { answer: `✎ ${answer}`, correct: true, via: "talk", feedback: "", at: new Date().toISOString() },
    ];
  }
  await saveSession(planDate, session);
}

function imageBlock(dataUrl) {
  const [, mediaType, data] = dataUrl.match(/^data:(image\/[\w+.-]+);base64,(.*)$/) || [];
  return mediaType ? { type: "image", source: { type: "base64", media_type: mediaType, data } } : null;
}

// Turn the stored thread into API messages: photos of the newest few user turns
// are sent as images, older ones as a note. Same-role neighbours are merged
// (a failed reply can leave two user turns in a row).
async function toApiMessages(thread) {
  const withPhotos = thread.filter((m) => m.role === "user" && m.images?.length).slice(-IMAGE_TURNS);
  const out = [];
  for (const m of thread) {
    let content = [];
    if (withPhotos.includes(m)) {
      const urls = await Promise.all(m.images.map((id) => getTalkImage(id)));
      content = urls.filter(Boolean).map(imageBlock).filter(Boolean);
    } else if (m.images?.length) {
      content.push({ type: "text", text: `[sent ${m.images.length} photo(s) earlier]` });
    }
    if (m.text) content.push({ type: "text", text: m.text });
    if (!content.length) continue;
    const prev = out[out.length - 1];
    if (prev?.role === m.role) prev.content.push(...content);
    else out.push({ role: m.role, content });
  }
  while (out.length && out[0].role !== "user") out.shift();
  return out;
}

async function serveImage(req, res) {
  const dataUrl = await getTalkImage(String(req.query.img));
  const [, mediaType, data] = (dataUrl || "").match(/^data:(image\/[\w+.-]+);base64,(.*)$/) || [];
  if (!mediaType) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.setHeader("Content-Type", mediaType);
  res.setHeader("Cache-Control", "private, max-age=31536000, immutable");
  res.send(Buffer.from(data, "base64"));
}

//   GET  ?before=<index>  -> { messages, start } (a page of the thread)
//   GET  ?img=<id>        -> one stored photo
//   POST { lang, text, images: [dataUrl] } -> streams the professor's reply
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST"]) || !checkPasscode(req, res)) return;

  if (req.method === "GET") {
    try {
      if (req.query.img) return await serveImage(req, res);
      const before = req.query.before != null ? Number(req.query.before) : undefined;
      res.status(200).json(await getTalk({ before }));
    } catch (err) {
      fail(res, err, "talk");
    }
    return;
  }

  const { lang = "ko", text = "", images = [] } = req.body || {};
  const photos = images.filter((u) => typeof u === "string" && u.startsWith("data:image/")).slice(0, MAX_IMAGES);
  if (!text.trim() && !photos.length) {
    res.status(400).json({ error: "text or images required" });
    return;
  }

  let thread, student, today, tools, planDate;
  try {
    // Store the question (and its photos) first so nothing is lost if the reply fails.
    const imageIds = photos.map(() => randomUUID());
    await Promise.all(photos.map((url, i) => saveTalkImage(imageIds[i], url)));
    await appendTalk({ id: randomUUID(), role: "user", text: text.trim(), images: imageIds, at: new Date().toISOString() });

    planDate = await getCurrentPlanDate();
    const [talk, state, journals, plan, session] = await Promise.all([
      getTalk({ limit: HISTORY }),
      getState(),
      getJournals(),
      planDate ? getPlan(planDate) : null,
      planDate ? getSession(planDate) : null,
    ]);
    thread = await toApiMessages(talk.messages);
    student = describeStudent(state, journals);
    today = describeToday(plan, session);
    tools = solveTool(plan, session);
  } catch (err) {
    fail(res, err, "talk load");
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" });

  let reply = "";
  let solved = [];
  try {
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 6000,
      output_config: { effort: "medium" },
      system: buildSystem({ lang, student, today }),
      messages: thread,
      ...(tools.length && { tools }),
      ...FALLBACK,
    });
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        reply += event.delta.text;
        res.write(event.delta.text);
      }
    }
    const final = await stream.finalMessage();
    solved = final.content.filter((b) => b.type === "tool_use" && b.name === "record_solved").map((b) => b.input);
  } catch (err) {
    console.error("talk stream error:", err);
    if (!reply) res.write(lang === "ko" ? "지금 연결이 안 돼요. 잠시 후 다시 시도해 주세요." : "I couldn't connect just now. Please try again.");
    res.end();
    return;
  }

  // Save before ending the response: Vercel may freeze the function right after.
  try {
    if (solved.length) await recordSolved(planDate, solved);
    await appendTalk({ id: randomUUID(), role: "assistant", text: reply, images: [], at: new Date().toISOString() });
  } catch (err) {
    console.error("talk save error:", err);
  }
  res.end();
}
