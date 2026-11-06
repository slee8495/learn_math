import { useState } from "react";
import Md from "./Md.jsx";
import { useT } from "../lib/i18n.js";
import { useSubject } from "../lib/subject.js";

const field = "w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-[15px] outline-none focus:border-neutral-900";

// One line being written or changed. A new line gets the same text in both
// languages; an edit changes the language on screen.
function LineEditor({ line, topics, onSave, onCancel }) {
  const { t, bi, lang } = useT();
  const [topicId, setTopicId] = useState(line?.topicId || topics[0].id);
  const [text, setText] = useState(line ? bi(line.text) : "");
  const [code, setCode] = useState(line?.code || "");
  const ok = text.trim();
  const save = () =>
    ok &&
    onSave({
      ...(line && { id: line.id }),
      topicId,
      text: line ? { ...line.text, [lang]: text.trim() } : { ko: text.trim(), en: text.trim() },
      code: code.trim(),
    });
  return (
    <div className="space-y-2 rounded-xl bg-neutral-50 p-3">
      {!line && (
        <select value={topicId} onChange={(e) => setTopicId(e.target.value)} className={field}>
          {topics.map((tp) => (
            <option key={tp.id} value={tp.id}>
              {bi(tp)}
            </option>
          ))}
        </select>
      )}
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("cheatText")} className={field} autoFocus />
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={t("cheatCode")}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className={`${field} font-mono text-[13px]`}
      />
      <div className="flex gap-2">
        <button onClick={save} disabled={!ok} className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40">
          {t("noteSave")}
        </button>
        <button onClick={onCancel} className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm">
          {t("noteCancel")}
        </button>
      </div>
    </div>
  );
}

// The subject's cheat sheet: every topic with something learned, one line per
// rule. The professor adds and sharpens lines each morning; in edit mode the
// student can change, remove or add lines too.
export default function CheatView({ lines, setLines }) {
  const { t, bi } = useT();
  const { api, info } = useSubject();
  const topics = info.roadmap.stages.flatMap((st) => st.topics);
  const [editMode, setEditMode] = useState(false);
  const [editing, setEditing] = useState(null); // a line id, "new", or null
  const [error, setError] = useState("");

  async function save(line) {
    setError("");
    try {
      const d = await api.saveCheat([line]);
      const saved = d.lines[0];
      setLines((all) => (all.some((l) => l.id === saved.id) ? all.map((l) => (l.id === saved.id ? { ...l, ...saved } : l)) : [...all, saved]));
      setEditing(null);
    } catch {
      setError(t("saveFailed"));
    }
  }

  async function remove(id) {
    setError("");
    try {
      await api.deleteCheat(id);
      setLines((all) => all.filter((l) => l.id !== id));
    } catch {
      setError(t("saveFailed"));
    }
  }

  const shown = topics.map((tp) => ({ tp, lines: lines.filter((l) => l.topicId === tp.id) })).filter((g) => g.lines.length);

  return (
    <div className="pb-16">
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-500">{t("cheatNote")}</p>
        <button
          onClick={() => (setEditMode(!editMode), setEditing(null))}
          className={`shrink-0 rounded-full px-3 py-1 text-sm ${editMode ? "bg-neutral-900 text-white" : "border border-neutral-300"}`}
        >
          {editMode ? t("cheatDone") : t("noteEdit")}
        </button>
      </div>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {editMode && (
        <div className="mb-6">
          {editing === "new" ? (
            <LineEditor topics={topics} onSave={save} onCancel={() => setEditing(null)} />
          ) : (
            <button onClick={() => setEditing("new")} className="rounded-full border border-neutral-300 px-3.5 py-1.5 text-sm">
              {t("cheatAdd")}
            </button>
          )}
        </div>
      )}

      {!shown.length && <p className="text-[15px] leading-relaxed text-neutral-500">{t("cheatEmpty")}</p>}

      <div className="space-y-7">
        {shown.map(({ tp, lines: group }) => (
          <section key={tp.id}>
            <h2 className="mb-2 border-b border-neutral-200 pb-1 text-sm font-bold">{bi(tp)}</h2>
            <ul className="space-y-2">
              {group.map((l) =>
                editing === l.id ? (
                  <li key={l.id}>
                    <LineEditor line={l} topics={topics} onSave={save} onCancel={() => setEditing(null)} />
                  </li>
                ) : (
                  <li key={l.id} className="flex items-start gap-2 text-[15px] leading-snug">
                    <span className="mt-[0.5em] h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
                    <div className="min-w-0 flex-1">
                      <Md inline>{bi(l.text)}</Md>
                      {l.code && (
                        <code className="mt-1 block overflow-x-auto whitespace-pre rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[13px]">{l.code}</code>
                      )}
                    </div>
                    {editMode && (
                      <span className="flex shrink-0 gap-1">
                        <button onClick={() => setEditing(l.id)} className="px-1 text-sm text-neutral-500">
                          {t("noteEdit")}
                        </button>
                        <button onClick={() => remove(l.id)} className="px-1 text-sm text-red-600">
                          ✕
                        </button>
                      </span>
                    )}
                  </li>
                ),
              )}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
