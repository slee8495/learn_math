import { useEffect, useState } from "react";
import Md from "./Md.jsx";
import { topicById } from "../../tutor/subjects.js";
import { useT } from "../lib/i18n.js";
import { useSubject } from "../lib/subject.js";

const field = "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-[15px] outline-none focus:border-neutral-900";

// Edit a note (or write a new one). Text edits change the language on screen;
// a new note starts with the same text in both.
function NoteEditor({ note, onSaved, onDeleted, onCancel }) {
  const { t, bi, lang } = useT();
  const { api, info } = useSubject();
  const topics = info.roadmap.stages.flatMap((st) => st.topics);
  const [kind, setKind] = useState(note?.kind || (info.code ? "code" : "concept"));
  const [topicId, setTopicId] = useState(note?.topicId || topics[0].id);
  const [title, setTitle] = useState(note ? bi(note.title) : "");
  const [body, setBody] = useState(note ? bi(note.body) : "");
  const [code, setCode] = useState(note?.code || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sure, setSure] = useState(false);

  const both = (value, old) => (old ? { ...old, [lang]: value } : { ko: value, en: value });

  async function save() {
    if (!title.trim()) return;
    setBusy(true);
    setError("");
    try {
      const d = await api.saveNote({
        ...(note && { id: note.id, from: note.from }),
        kind,
        topicId,
        title: both(title.trim(), note?.title),
        body: both(body, note?.body),
        code: kind === "code" ? code : "",
      });
      onSaved(d.note);
    } catch {
      setError(t("saveFailed"));
      setBusy(false);
    }
  }

  async function remove() {
    if (!sure) return setSure(true);
    setBusy(true);
    try {
      await api.deleteNote(note.id);
      onDeleted(note.id);
    } catch {
      setError(t("saveFailed"));
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 py-3">
      <div className="flex items-center gap-2">
        {["code", "concept"].map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`rounded-full px-3 py-1 text-sm ${kind === k ? "bg-neutral-900 text-white" : "border border-neutral-300 text-neutral-700"}`}
          >
            {t(k === "code" ? "filterCode" : "filterConcept")}
          </button>
        ))}
        <select value={topicId} onChange={(e) => setTopicId(e.target.value)} className="ml-auto min-w-0 max-w-[50%] rounded-full border border-neutral-300 bg-white px-3 py-1 text-sm">
          {topics.map((tp) => (
            <option key={tp.id} value={tp.id}>
              {bi(tp)}
            </option>
          ))}
        </select>
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("noteTitle")} className={field} />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={t("noteBody")} rows={6} className={field} />
      {kind === "code" && (
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("noteCode")}
          rows={8}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className={`${field} font-mono text-[13px]`}
        />
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-2">
        <button onClick={save} disabled={busy || !title.trim()} className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40">
          {t("noteSave")}
        </button>
        <button onClick={onCancel} disabled={busy} className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm">
          {t("noteCancel")}
        </button>
        {note && (
          <button onClick={remove} disabled={busy} className={`ml-auto px-2 py-1.5 text-sm ${sure ? "font-semibold text-red-600" : "text-neutral-400"}`}>
            {t(sure ? "noteDeleteSure" : "noteDelete")}
          </button>
        )}
      </div>
    </div>
  );
}

// The student's own collection: code they finished and concepts they now
// understand. Correct code is filed when it's graded, the professor files more
// in talk and each morning; tapping a note opens it, and every note can be
// edited, deleted or written from scratch.
export default function NotesView() {
  const { t, bi } = useT();
  const { api } = useSubject();
  const [notes, setNotes] = useState(null);
  const [error, setError] = useState(false);
  const [kind, setKind] = useState("");
  const [topic, setTopic] = useState("");
  const [open, setOpen] = useState(null);
  const [editing, setEditing] = useState(null); // a note id, "new", or null

  useEffect(() => {
    api.notes().then((d) => setNotes(d.notes), () => setError(true));
  }, [api]);

  if (error) return <p className="pt-16 text-neutral-600">{t("loadFailed")}</p>;
  if (!notes) return <p className="pt-16 text-neutral-400">{t("loading")}</p>;

  const saved = (note) => {
    setNotes((list) => [note, ...list.filter((n) => n.id !== note.id)]);
    setEditing(null);
    setOpen(note.id);
  };
  const deleted = (id) => {
    setNotes((list) => list.filter((n) => n.id !== id));
    setEditing(null);
  };

  const hasBoth = notes.some((n) => n.kind === "code") && notes.some((n) => n.kind === "concept");
  const seenTopics = [...new Set(notes.map((n) => n.topicId))];
  const shown = notes.filter((n) => (!kind || n.kind === kind) && (!topic || n.topicId === topic));

  const chip = (active) =>
    `shrink-0 rounded-full px-3.5 py-1.5 text-sm ${active ? "bg-neutral-900 text-white" : "border border-neutral-300 text-neutral-700"}`;

  return (
    <div className="pb-16">
      <div className="mb-4">
        {editing === "new" ? (
          <NoteEditor onSaved={saved} onCancel={() => setEditing(null)} />
        ) : (
          <button onClick={() => setEditing("new")} className="rounded-full border border-neutral-300 px-3.5 py-1.5 text-sm">
            {t("noteNew")}
          </button>
        )}
      </div>
      {!notes.length && editing !== "new" && <p className="text-[15px] leading-relaxed text-neutral-500">{t("notesEmpty")}</p>}
      {(hasBoth || seenTopics.length > 1) && (
        <div className="mb-6 flex items-center gap-2">
          {hasBoth &&
            [
              ["", "filterAll"],
              ["code", "filterCode"],
              ["concept", "filterConcept"],
            ].map(([value, label]) => (
              <button key={label} className={chip(kind === value)} onClick={() => setKind(value)}>
                {t(label)}
              </button>
            ))}
          {seenTopics.length > 1 && (
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="ml-auto min-w-0 max-w-[45%] rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm"
            >
              <option value="">{t("allTopics")}</option>
              {seenTopics.map((id) => (
                <option key={id} value={id}>
                  {topicById(id) ? bi(topicById(id)) : id}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="divide-y divide-neutral-100 border-y border-neutral-100">
        {shown.map((n) => (
          <article key={n.id} className="py-3">
            {editing === n.id ? (
              <NoteEditor note={n} onSaved={saved} onDeleted={deleted} onCancel={() => setEditing(null)} />
            ) : (
              <>
                <button onClick={() => setOpen(open === n.id ? null : n.id)} className="block w-full text-left">
                  <p className="mb-0.5 truncate text-xs text-neutral-400">
                    {t(n.kind === "code" ? "filterCode" : "filterConcept")} · {topicById(n.topicId) ? bi(topicById(n.topicId)) : n.topicId} · {n.savedOn}
                  </p>
                  <p className="text-[15px] font-semibold">
                    <Md inline>{bi(n.title)}</Md>
                  </p>
                </button>
                {open === n.id && (
                  <div className="mt-2">
                    <Md className="text-[15px] leading-relaxed">{bi(n.body)}</Md>
                    {n.code && (
                      <pre className="mt-3 overflow-x-auto rounded-xl bg-neutral-100 px-4 py-3 text-[13px] leading-relaxed">
                        <code>{n.code}</code>
                      </pre>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-neutral-400">{n.from}</p>
                      <button onClick={() => setEditing(n.id)} className="px-1 text-sm text-neutral-500">
                        {t("noteEdit")}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
