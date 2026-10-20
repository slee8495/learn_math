import { useEffect, useState } from "react";
import Md from "./Md.jsx";
import { topicById } from "../../tutor/subjects.js";
import { useT } from "../lib/i18n.js";
import { useSubject } from "../lib/subject.js";

// Not solved on their own: never got it right, or only after opening the solution.
const needsRedo = (p) => !p.solved || p.gaveUp;

function status(p) {
  if (p.solved) return p.gaveUp ? "st_afterSolution" : "st_solved";
  if (p.gaveUp) return "st_gaveUp";
  return p.attempts ? "st_wrong" : "st_untouched";
}

// Every problem so far, newest day first. Tapping one opens that day on that
// problem, with the answers, chat and solution from then, ready to retry.
export default function ArchiveView({ onOpen }) {
  const { t, bi } = useT();
  const { api } = useSubject();
  const [days, setDays] = useState(null);
  const [error, setError] = useState(false);
  const [onlyRedo, setOnlyRedo] = useState(false);
  const [topic, setTopic] = useState("");

  useEffect(() => {
    api.archive().then((d) => setDays(d.days), () => setError(true));
  }, [api]);

  if (error) return <p className="pt-16 text-neutral-600">{t("loadFailed")}</p>;
  if (!days) return <p className="pt-16 text-neutral-400">{t("loading")}</p>;

  const seenTopics = [...new Set(days.flatMap((d) => d.problems.map((p) => p.topicId)))];
  const keep = (p) => (!onlyRedo || needsRedo(p)) && (!topic || p.topicId === topic);
  const shown = [...days].reverse().map((d) => ({ ...d, problems: d.problems.filter(keep) })).filter((d) => d.problems.length);

  const chip = (active) =>
    `shrink-0 rounded-full px-3.5 py-1.5 text-sm ${active ? "bg-neutral-900 text-white" : "border border-neutral-300 text-neutral-700"}`;

  return (
    <div className="pb-16">
      <div className="mb-6 flex items-center gap-2">
        <button className={chip(!onlyRedo)} onClick={() => setOnlyRedo(false)}>
          {t("filterAll")}
        </button>
        <button className={chip(onlyRedo)} onClick={() => setOnlyRedo(true)}>
          {t("filterRedo")}
        </button>
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

      {shown.length === 0 && (
        <p className="text-[15px] text-neutral-500">{days.length && onlyRedo ? t("nothingToRedo") : t("archiveEmpty")}</p>
      )}

      <div className="space-y-8">
        {shown.map((d) => (
          <section key={d.date}>
            <p className="mb-2 text-xs text-neutral-400">
              {t("day")} {d.dayNum} · {d.date}
              {d.headline && <> · {bi(d.headline)}</>}
            </p>
            <div className="divide-y divide-neutral-100 border-y border-neutral-100">
              {d.problems.map((p) => {
                const st = status(p);
                return (
                  <button key={p.id} onClick={() => onOpen(d.date, p.id)} className="block w-full py-3 text-left">
                    <div className="mb-1 flex items-center gap-2 text-xs">
                      <span
                        className={
                          st === "st_solved" ? "font-semibold text-green-700" : needsRedo(p) && st !== "st_untouched" ? "font-semibold text-red-600" : "text-neutral-400"
                        }
                      >
                        {t(st)}
                      </span>
                      {p.hints > 0 && (
                        <span className="text-neutral-400">
                          · {t("hint")} {p.hints}
                        </span>
                      )}
                      <span className="truncate text-neutral-400">· {topicById(p.topicId) ? bi(topicById(p.topicId)) : p.topicId}</span>
                    </div>
                    <div className="line-clamp-3 text-[15px] leading-relaxed">
                      <Md>{bi(p.prompt)}</Md>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
