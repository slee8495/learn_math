import { randomUUID } from "node:crypto";
import { allowMethods, checkPasscode, fail } from "./_lib/http.js";
import { FALLBACK, MODEL, client, describeStudent, langName, topicName } from "./_lib/claude.js";
import {
  appendTalk,
  getCheat,
  getCurrentPlanDate,
  deleteNote,
  getJournals,
  getNotes,
  getPlan,
  getSession,
  getState,
  getTalk,
  getTalkImage,
  getTerms,
  saveCheat,
  saveNotes,
  saveTerms,
  saveSession,
  saveTalkImage,
  subjectOf,
  todayCA,
} from "./_lib/store.js";
import { subjectById } from "../tutor/subjects.js";

const HISTORY = 40; // messages of the thread the professor sees each turn
const IMAGE_TURNS = 3; // the newest user messages whose photos are sent as images
const MAX_IMAGES = 4; // per message
const NOTES_SHOWN = 200; // newest notes the professor sees by id, to tidy them

// The notes tab as the professor sees it: enough to spot duplicates and pick
// which one to keep, not the full cards.
function describeNotes(notes) {
  if (!notes.length) return "The student's notes tab is empty.";
  const short = (t, n) => (t || "").replace(/\s+/g, " ").trim().slice(0, n);
  const lines = notes.slice(0, NOTES_SHOWN).map((n) => {
    const title = n.title?.ko || n.title?.en || "";
    const body = short(n.body?.ko || n.body?.en, 90);
    const code = n.code ? ` · code: ${short(n.code, 60)}` : "";
    return `- [${n.id}] ${n.kind} · ${n.topicId} · "${title}" · from ${n.from || "?"} · saved ${n.savedOn}${n.byStudent ? " · edited by the student" : ""}\n  ${body}${code}`;
  });
  return `The student's notes tab right now (${notes.length} notes, newest first${notes.length > NOTES_SHOWN ? `, first ${NOTES_SHOWN} shown` : ""}):\n${lines.join("\n")}`;
}

// The cheat sheet and English terms, so the professor adds only what's new
// and sharpens an existing line (same id) instead of repeating it.
function describeSheet(cheat, terms, glossary) {
  const short = (t) => (t || "").replace(/\s+/g, " ").trim().slice(0, 100);
  const out = [
    cheat.length
      ? `The student's cheat sheet (${cheat.length} lines):\n${cheat.map((l) => `- [${l.id}] ${l.topicId}: ${short(l.text?.ko || l.text?.en)}`).join("\n")}`
      : "The student's cheat sheet is empty.",
  ];
  if (glossary)
    out.push(
      terms.length
        ? `Their English terms tab (${terms.length}):\n${terms.map((l) => `- [${l.id}] ${l.en} = ${l.ko}`).join("\n")}`
        : "Their English terms tab is empty.",
    );
  return out.join("\n\n");
}

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

// Extra guidance for the data-interview subjects (see CAREER_ROADMAP.md §2).
const CAREER_TALK = `- You are a teacher, not a ghostwriter: don't write the code for today's problems for them. Hints go step by step: the concept, then the approach, then partial code. Full code only if they ask for it after they've opened the solution, or for a problem that isn't assigned.
- When they paste code, review it like an interviewer: correctness first, then edge cases (NULLs, ties, duplicates, empty groups), readability, and a more idiomatic way.
- When they ask how something differs between engines (SQLite here, Postgres/Snowflake/BigQuery at work and in interviews), say so plainly.
- Their background: PLM data analytics manager at Hyundai Motor America with an MSBA, aiming at senior data scientist / analytics roles and data roles at investment firms. Examples from automotive parts, trading and e-commerce land best.`;

function buildSystem({ subject, lang, student, today, notesList, sheet }) {
  const { role, aim, glossary } = subjectById(subject);
  return [
    `You are this student's personal ${role}. This is your ongoing conversation with them, outside any single problem: office hours that continue across days. The shared goal is ${aim}.`,
    `How to help:
- They may ask anything: a concept, a problem from a book, today's assigned problem, how to study. Answer as their teacher who knows them.
- When they send photos of their handwritten work, read every line carefully. Say which steps are right, point at the first line where it goes wrong and why, and name the misconception if there is one. Be concrete ("line 3: the 2 should be squared too"), not vague.
- If they are stuck, find where, and give the smallest push that gets them moving. Ask one question at a time. If they ask for a full explanation or solution, give it clearly.
- For today's assigned problems: when their work (a photo or what they type) reaches the correct final answer to one that isn't solved yet, tell them, then call record_solved so it counts as solved in the app. Write your whole reply first; the call comes last. Don't call it for a wrong or unfinished answer, or for a different problem.
- The app has a notes tab: the student's collection of code they finished and concepts they understood, to study from. When they finish working code here (even after opening the solution or with your help) or clearly get a concept, call save_note right away and say it's in their notes. It's their study material, so never hold a note back because the solution was seen; just say so in its body. Same rule as above: reply first, the call last.
- You can see the whole notes tab (listed below, by id) and keep it tidy. Before saving, check it: if the same code or concept is already there, pass its id as replaceId to improve that note instead of adding a second one.
- When they ask you to clean up, merge, retitle or delete notes, do it yourself: for duplicates keep the best one (improve it with save_note + replaceId if useful) and remove the rest with delete_notes. Say briefly what you kept and removed, by title. Delete only what they asked for or clear duplicates of a note you keep. A note marked "edited by the student" can be deleted when they ask but not replaced; save a new one instead.
- The app also has a cheat sheet: one short line per rule or formula, under its roadmap topic, read before an exam or interview. When they learn a rule worth keeping, add it with save_cheat (one line each; reuse an existing id to sharpen a line instead of repeating it).${glossary ? `
- They study in Korean but must know every term in English for work and interviews, so the cheat sheet has an English terms tab. Whenever a technical term comes up as you go (a new concept, a term in a problem, one they ask about), write it as "한국어 (English)" the first time and add it with save_terms, English as used in papers and interviews. Skip terms already in the tab (listed below). Don't announce each one; a short "영어 용어에 넣었어요" is enough.` : ""}
- Never say you saved, changed or deleted a note, a cheat line or a term unless you make that call in this same reply.
- After each of your past replies the app adds an "[app log: ...]" line listing what was really saved by that reply's calls. That log and the notes, cheat sheet and terms listed below are the truth about what is saved; your own past words are not. Never write an "[app log" line yourself.
- Don't apologize for or re-litigate past saves. If something the student asked to keep is already in the lists below, say it's there. If it's missing, save it now and say so in one short line. Never promise to save "in this reply" without making the call.
- Don't reveal the final answer unless they ask for it directly or have already opened the solution.
- If a photo is unreadable, say which part and ask for a clearer one.
- What they ask here is recorded and read when their next lessons are planned.
- Keep replies fairly short: this is a phone chat. Use Markdown and LaTeX ($...$ inline, $$...$$ display).
- Reply in ${langName(lang)} unless the student writes in the other language; then follow them.`,
    subject !== "math" && CAREER_TALK,
    student,
    today,
    notesList,
    sheet,
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

// Always offered: files code or a concept in the notes tab.
function noteTool(subject, plan, ids) {
  const topics = subjectById(subject).roadmap.stages.flatMap((st) => st.topics.map((t) => t.id));
  return {
    name: "save_note",
    description: "Save working code the student wrote, or a concept they now understand, to their notes tab.",
    input_schema: {
      type: "object",
      properties: {
        kind: { type: "string", enum: ["code", "concept"] },
        topicId: { type: "string", enum: topics },
        problemId: { type: "string", ...(plan && { enum: plan.problems.map((p) => p.id) }), description: "The assigned problem it belongs to, if any." },
        title: { type: "string", description: "A few words naming the pattern or concept, in the reply language." },
        body: { type: "string", description: "Short reference card in Markdown + LaTeX, in the reply language: the key idea, when to use it, the trap to avoid. Note if the solution was opened first." },
        code: { type: "string", description: "kind=code: the student's own final working code, verbatim. Empty for concepts." },
        ...(ids.length && { replaceId: { type: "string", enum: ids, description: "An existing note this one replaces (same code or concept), instead of adding a new note." } }),
      },
      required: ["kind", "topicId", "title", "body"],
    },
  };
}

// Offered when there are notes: removes duplicates or notes the student asked to drop.
function deleteTool(ids) {
  if (!ids.length) return [];
  return [
    {
      name: "delete_notes",
      description: "Delete notes from the student's notes tab: duplicates of a note you keep, or notes they asked you to remove.",
      input_schema: {
        type: "object",
        properties: { ids: { type: "array", items: { type: "string", enum: ids }, minItems: 1 } },
        required: ["ids"],
      },
    },
  ];
}

const topicIds = (subject) => subjectById(subject).roadmap.stages.flatMap((st) => st.topics.map((t) => t.id));

// Always offered: adds or sharpens cheat sheet lines.
function cheatTool(subject) {
  return {
    name: "save_cheat",
    description: "Add or sharpen lines of the student's cheat sheet: one short rule or formula per line, under its roadmap topic.",
    input_schema: {
      type: "object",
      properties: {
        lines: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "Stable slug, e.g. 'arith-series-sum'. An existing line's id (listed in the system prompt) replaces that line." },
              topicId: { type: "string", enum: topicIds(subject) },
              text: { type: "string", description: "One line in the reply language: the rule or fact in a few words. Markdown + LaTeX, no line breaks." },
              code: { type: "string", description: "Optional one-line code or formula that shows it; empty if the text says it all." },
            },
            required: ["id", "topicId", "text"],
          },
        },
      },
      required: ["lines"],
    },
  };
}

// Math and stats: adds English terms as they come up.
function termsTool(subject) {
  if (!subjectById(subject).glossary) return [];
  return [
    {
      name: "save_terms",
      description: "Add technical terms to the student's English terms tab (Korean and English), as they come up in the lesson.",
      input_schema: {
        type: "object",
        properties: {
          terms: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              properties: {
                id: { type: "string", description: "Slug of the English term, e.g. 'standard-error'. An existing id replaces that term." },
                topicId: { type: "string", enum: topicIds(subject) },
                en: { type: "string", description: "The English term as used in papers and interviews, e.g. 'standard error'." },
                ko: { type: "string", description: "The Korean term, e.g. '표준오차'." },
                meaning: { type: "string", description: "A few words of meaning in Korean, LaTeX allowed, one line." },
              },
              required: ["id", "topicId", "en", "ko", "meaning"],
            },
          },
        },
        required: ["terms"],
      },
    },
  ];
}

const oneLine = (s) => String(s || "").replace(/\s+/g, " ").trim();

async function saveTalkSheet(subject, cheatCalls, termCalls) {
  const lines = cheatCalls.flatMap((c) => c.lines || []).filter((l) => l.id && oneLine(l.text));
  if (lines.length)
    await saveCheat(
      subject,
      lines.map((l) => ({ id: l.id, topicId: l.topicId, text: { ko: oneLine(l.text), en: oneLine(l.text) }, code: oneLine(l.code) })),
    );
  const terms = termCalls.flatMap((c) => c.terms || []).filter((t) => t.id && oneLine(t.en));
  if (terms.length)
    await saveTerms(
      subject,
      terms.map((t) => ({ id: t.id, topicId: t.topicId, en: oneLine(t.en), ko: oneLine(t.ko), meaning: oneLine(t.meaning) })),
    );
}

async function saveTalkNotes(subject, planDate, calls) {
  const today = todayCA();
  await saveNotes(
    subject,
    calls.map((n, i) => ({
      id: n.replaceId || (n.problemId && planDate ? `${planDate}-${n.problemId}` : `talk-${Date.now()}-${i}`),
      kind: n.kind,
      topicId: n.topicId,
      title: { ko: n.title, en: n.title },
      body: { ko: n.body, en: n.body },
      code: n.kind === "code" ? n.code || "" : "",
      from: n.problemId && planDate ? `${planDate} ${n.problemId}` : `${today} talk`,
    })),
  );
}

async function recordSolved(subject, planDate, calls) {
  const session = await getSession(subject, planDate);
  for (const { problemId, answer } of calls) {
    if (isSolved(session, problemId)) continue;
    session.attempts[problemId] = [
      ...(session.attempts[problemId] || []),
      { answer: `✎ ${answer}`, correct: true, via: "talk", feedback: "", at: new Date().toISOString() },
    ];
  }
  await saveSession(subject, planDate, session);
}

// What a reply's tool calls really did, kept on the stored message so later
// turns (and the student) can see it instead of trusting the reply's words.
function savedSummary({ solved, notes, removed, cheatCalls, termCalls }) {
  const saved = {};
  if (solved.length) saved.solved = solved.map((c) => c.problemId);
  if (notes.length) saved.notes = notes.map((n) => oneLine(n.title));
  if (removed.length) saved.deleted = [...new Set(removed)].length;
  const cheat = cheatCalls.flatMap((c) => c.lines || []).filter((l) => l.id && oneLine(l.text));
  if (cheat.length) saved.cheat = cheat.map((l) => oneLine(l.text).slice(0, 80));
  const terms = termCalls.flatMap((c) => c.terms || []).filter((t) => t.id && oneLine(t.en));
  if (terms.length) saved.terms = terms.map((t) => oneLine(t.en));
  return Object.keys(saved).length ? saved : null;
}

function appLog(saved) {
  const parts = [];
  if (saved.solved?.length) parts.push(`marked solved: ${saved.solved.join(", ")}`);
  if (saved.notes?.length) parts.push(`note saved: ${saved.notes.map((t) => `"${t}"`).join(", ")}`);
  if (saved.deleted) parts.push(`${saved.deleted} note(s) deleted`);
  if (saved.cheat?.length) parts.push(`cheat sheet: ${saved.cheat.map((t) => `"${t}"`).join(", ")}`);
  if (saved.terms?.length) parts.push(`terms: ${saved.terms.join(", ")}`);
  return `[app log: ${parts.join("; ")}]`;
}

// Strip any app-log line the model imitated, so it never reaches the student.
const dropFakeLog = (text) => text.replace(/\n*\[app log:[^\]]*\]\s*$/i, "");

// Sent after the reply text so the app can show what was saved.
const SAVED_MARK = "\u001e";

function imageBlock(dataUrl) {
  const [, mediaType, data] = dataUrl.match(/^data:(image\/[\w+.-]+);base64,(.*)$/) || [];
  return mediaType ? { type: "image", source: { type: "base64", media_type: mediaType, data } } : null;
}

// Turn the stored thread into API messages: photos of the newest few user turns
// are sent as images, older ones as a note. Same-role neighbours are merged
// (a failed reply can leave two user turns in a row).
async function toApiMessages(subject, thread) {
  const withPhotos = thread.filter((m) => m.role === "user" && m.images?.length).slice(-IMAGE_TURNS);
  const out = [];
  for (const m of thread) {
    let content = [];
    if (withPhotos.includes(m)) {
      const urls = await Promise.all(m.images.map((id) => getTalkImage(subject, id)));
      content = urls.filter(Boolean).map(imageBlock).filter(Boolean);
    } else if (m.images?.length) {
      content.push({ type: "text", text: `[sent ${m.images.length} photo(s) earlier]` });
    }
    if (m.text) content.push({ type: "text", text: m.text });
    if (m.role === "assistant" && m.saved) content.push({ type: "text", text: appLog(m.saved) });
    if (!content.length) continue;
    const prev = out[out.length - 1];
    if (prev?.role === m.role) prev.content.push(...content);
    else out.push({ role: m.role, content });
  }
  while (out.length && out[0].role !== "user") out.shift();
  return out;
}

async function serveImage(subject, req, res) {
  const dataUrl = await getTalkImage(subject, String(req.query.img));
  const [, mediaType, data] = (dataUrl || "").match(/^data:(image\/[\w+.-]+);base64,(.*)$/) || [];
  if (!mediaType) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.setHeader("Content-Type", mediaType);
  res.setHeader("Cache-Control", "private, max-age=31536000, immutable");
  res.send(Buffer.from(data, "base64"));
}

// Every call names its ?subject= (body.subject on POST); each has its own thread.
//   GET  ?before=<index>  -> { messages, start } (a page of the thread)
//   GET  ?img=<id>        -> one stored photo
//   POST { lang, text, images: [dataUrl] } -> streams the professor's reply
export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST"]) || !checkPasscode(req, res)) return;
  const subject = subjectOf(req.method === "GET" ? req.query.subject : req.body?.subject);

  if (req.method === "GET") {
    try {
      if (req.query.img) return await serveImage(subject, req, res);
      const before = req.query.before != null ? Number(req.query.before) : undefined;
      res.status(200).json(await getTalk(subject, { before }));
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

  let thread, student, today, notesList, sheet, tools, planDate;
  try {
    // Store the question (and its photos) first so nothing is lost if the reply fails.
    const imageIds = photos.map(() => randomUUID());
    await Promise.all(photos.map((url, i) => saveTalkImage(subject, imageIds[i], url)));
    await appendTalk(subject, { id: randomUUID(), role: "user", text: text.trim(), images: imageIds, at: new Date().toISOString() });

    planDate = await getCurrentPlanDate(subject);
    const [talk, state, journals, plan, session, notes, cheat, terms] = await Promise.all([
      getTalk(subject, { limit: HISTORY }),
      getState(subject),
      getJournals(subject),
      planDate ? getPlan(subject, planDate) : null,
      planDate ? getSession(subject, planDate) : null,
      getNotes(subject),
      getCheat(subject),
      getTerms(subject),
    ]);
    thread = await toApiMessages(subject, talk.messages);
    student = describeStudent(state, journals);
    today = describeToday(plan, session);
    notesList = describeNotes(notes);
    sheet = describeSheet(cheat, terms, subjectById(subject).glossary);
    const ids = notes.slice(0, NOTES_SHOWN).map((n) => n.id);
    tools = [...solveTool(plan, session), noteTool(subject, plan, ids), ...deleteTool(ids), cheatTool(subject), ...termsTool(subject)];
  } catch (err) {
    fail(res, err, "talk load");
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" });

  let reply = "";
  let solved = [];
  let notes = [];
  let removed = [];
  let cheatCalls = [];
  let termCalls = [];
  const system = buildSystem({ subject, lang, student, today, notesList, sheet });
  // One streamed turn; its text goes straight to the phone.
  async function turn(messages, extra = {}) {
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 6000,
      output_config: { effort: "medium" },
      system,
      messages,
      tools,
      ...extra,
      ...FALLBACK,
    });
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        reply += event.delta.text;
        res.write(event.delta.text);
      }
    }
    return stream.finalMessage();
  }
  const uses = (msg) => msg.content.filter((b) => b.type === "tool_use");
  function takeCalls(msg) {
    const calls = (name) => uses(msg).filter((b) => b.name === name).map((b) => b.input);
    solved = calls("record_solved");
    notes = calls("save_note");
    removed = calls("delete_notes").flatMap((c) => c.ids || []);
    cheatCalls = calls("save_cheat");
    termCalls = calls("save_terms");
  }
  async function saveCalls() {
    if (solved.length) await recordSolved(subject, planDate, solved);
    // Deletes first, so a note kept via replaceId isn't removed right after.
    const keepIds = new Set(notes.map((n) => n.replaceId).filter(Boolean));
    for (const id of new Set(removed)) if (!keepIds.has(id)) await deleteNote(subject, id);
    if (notes.length) await saveTalkNotes(subject, planDate, notes);
    if (cheatCalls.length || termCalls.length) await saveTalkSheet(subject, cheatCalls, termCalls);
  }
  try {
    const final = await turn(thread);
    takeCalls(final);
    // Sometimes the reply is only a tool call (a note saved, nothing said) or
    // nothing at all, and the student sees silence. Then ask for the words:
    // after a tool call, report it done and let them say so; otherwise retry once.
    if (!reply.trim()) {
      if (uses(final).length) {
        const results = uses(final).map((b) => ({ type: "tool_result", tool_use_id: b.id, content: "done" }));
        await turn([...thread, { role: "assistant", content: final.content }, { role: "user", content: results }], {
          tool_choice: { type: "none" },
        });
      } else {
        takeCalls(await turn(thread));
      }
    }
    if (!reply.trim()) {
      reply = lang === "ko" ? "답이 비어서 왔어요. 한 번 더 보내 주세요." : "My reply came back empty. Please send that again.";
      res.write(reply);
    }
  } catch (err) {
    console.error("talk stream error:", err);
    // A tool call from a turn that did finish is still kept.
    if (!reply) res.write(lang === "ko" ? "지금 연결이 안 돼요. 잠시 후 다시 시도해 주세요." : "I couldn't connect just now. Please try again.");
    if (solved.length || notes.length || removed.length || cheatCalls.length || termCalls.length) {
      await saveCalls().catch((e) => console.error("talk save error:", e));
      const saved = savedSummary({ solved, notes, removed, cheatCalls, termCalls });
      if (saved) res.write(SAVED_MARK + JSON.stringify(saved));
    }
    res.end();
    return;
  }

  // Save before ending the response: Vercel may freeze the function right after.
  try {
    await saveCalls();
    const saved = savedSummary({ solved, notes, removed, cheatCalls, termCalls });
    if (saved) res.write(SAVED_MARK + JSON.stringify(saved));
    await appendTalk(subject, { id: randomUUID(), role: "assistant", text: dropFakeLog(reply), images: [], at: new Date().toISOString(), ...(saved && { saved }) });
  } catch (err) {
    console.error("talk save error:", err);
  }
  res.end();
}
