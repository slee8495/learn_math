import { useEffect, useState } from "react";
import Md from "./Md.jsx";
import { topicById } from "../../tutor/subjects.js";
import { useT } from "../lib/i18n.js";
import { useSubject } from "../lib/subject.js";

// The student's own collection: code they finished and concepts they now
// understand. The morning routine files new ones; tapping a note opens it.
export default function NotesView() {
  const { t, bi } = useT();
  const { api } = useSubject();
  const [notes, setNotes] = useState(null);
  const [error, setError] = useState(false);
  const [kind, setKind] = useState("");
  const [topic, setTopic] = useState("");
  const [open, setOpen] = useState(null);

  useEffect(() => {
    api.notes().then((d) => setNotes(d.notes), () => setError(true));
  }, [api]);

  if (error) return <p className="pt-16 text-neutral-600">{t("loadFailed")}</p>;
  if (!notes) return <p className="pt-16 text-neutral-400">{t("loading")}</p>;
  if (!notes.length) return <p className="text-[15px] leading-relaxed text-neutral-500">{t("notesEmpty")}</p>;

  const hasBoth = notes.some((n) => n.kind === "code") && notes.some((n) => n.kind === "concept");
  const seenTopics = [...new Set(notes.map((n) => n.topicId))];
  const shown = notes.filter((n) => (!kind || n.kind === kind) && (!topic || n.topicId === topic));

  const chip = (active) =>
    `shrink-0 rounded-full px-3.5 py-1.5 text-sm ${active ? "bg-neutral-900 text-white" : "border border-neutral-300 text-neutral-700"}`;

  return (
    <div className="pb-16">
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
                {n.from && <p className="mt-2 text-xs text-neutral-400">{n.from}</p>}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
