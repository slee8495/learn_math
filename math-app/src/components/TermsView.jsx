import { useState } from "react";
import Md from "./Md.jsx";
import { useT } from "../lib/i18n.js";
import { useSubject } from "../lib/subject.js";

const field = "w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-[15px] outline-none focus:border-neutral-900";

// One term being written or changed.
function TermEditor({ term, topics, onSave, onCancel }) {
  const { t, bi } = useT();
  const [topicId, setTopicId] = useState(term?.topicId || topics[0].id);
  const [en, setEn] = useState(term?.en || "");
  const [ko, setKo] = useState(term?.ko || "");
  const [meaning, setMeaning] = useState(term?.meaning || "");
  const ok = en.trim();
  const save = () => ok && onSave({ ...(term && { id: term.id }), topicId, en: en.trim(), ko: ko.trim(), meaning: meaning.trim() });
  return (
    <div className="space-y-2 rounded-xl bg-neutral-50 p-3">
      {!term && (
        <select value={topicId} onChange={(e) => setTopicId(e.target.value)} className={field}>
          {topics.map((tp) => (
            <option key={tp.id} value={tp.id}>
              {bi(tp)}
            </option>
          ))}
        </select>
      )}
      <input value={en} onChange={(e) => setEn(e.target.value)} placeholder={t("termEn")} autoCapitalize="off" className={field} autoFocus />
      <input value={ko} onChange={(e) => setKo(e.target.value)} placeholder={t("termKo")} className={field} />
      <input value={meaning} onChange={(e) => setMeaning(e.target.value)} placeholder={t("termMeaning")} className={field} />
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

// Math and stats: the English for every term met in lessons, by topic. The
// professor adds terms as they come up in talk and each morning; in edit mode
// the student can change, remove or add terms too.
export default function TermsView({ terms, setTerms }) {
  const { t, bi } = useT();
  const { api, info } = useSubject();
  const topics = info.roadmap.stages.flatMap((st) => st.topics);
  const [editMode, setEditMode] = useState(false);
  const [editing, setEditing] = useState(null); // a term id, "new", or null
  const [error, setError] = useState("");

  async function save(term) {
    setError("");
    try {
      const d = await api.saveTerms([term]);
      const saved = d.terms[0];
      setTerms((all) => (all.some((l) => l.id === saved.id) ? all.map((l) => (l.id === saved.id ? { ...l, ...saved } : l)) : [...all, saved]));
      setEditing(null);
    } catch {
      setError(t("saveFailed"));
    }
  }

  async function remove(id) {
    setError("");
    try {
      await api.deleteTerm(id);
      setTerms((all) => all.filter((l) => l.id !== id));
    } catch {
      setError(t("saveFailed"));
    }
  }

  const shown = topics.map((tp) => ({ tp, terms: terms.filter((l) => l.topicId === tp.id) })).filter((g) => g.terms.length);

  return (
    <div className="pb-16">
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-500">{t("termsNote")}</p>
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
            <TermEditor topics={topics} onSave={save} onCancel={() => setEditing(null)} />
          ) : (
            <button onClick={() => setEditing("new")} className="rounded-full border border-neutral-300 px-3.5 py-1.5 text-sm">
              {t("termAdd")}
            </button>
          )}
        </div>
      )}

      {!shown.length && <p className="text-[15px] leading-relaxed text-neutral-500">{t("termsEmpty")}</p>}

      <div className="space-y-7">
        {shown.map(({ tp, terms: group }) => (
          <section key={tp.id}>
            <h2 className="mb-2 border-b border-neutral-200 pb-1 text-sm font-bold">{bi(tp)}</h2>
            <ul className="divide-y divide-neutral-100">
              {group.map((l) =>
                editing === l.id ? (
                  <li key={l.id} className="py-2">
                    <TermEditor term={l} topics={topics} onSave={save} onCancel={() => setEditing(null)} />
                  </li>
                ) : (
                  <li key={l.id} className="flex items-start gap-2 py-2 text-[15px] leading-snug">
                    <div className="min-w-0 flex-1">
                      <div>
                        <span className="font-semibold">{l.en}</span>
                        {l.ko && <span className="text-neutral-600"> · {l.ko}</span>}
                      </div>
                      {l.meaning && (
                        <div className="mt-0.5 text-sm text-neutral-500">
                          <Md inline>{l.meaning}</Md>
                        </div>
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
