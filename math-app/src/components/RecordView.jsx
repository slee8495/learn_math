import roadmap from "../../tutor/roadmap.js";
import { useT } from "../lib/i18n.js";

function Level({ level }) {
  return (
    <span className="flex gap-0.5" aria-label={`${level}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`h-1.5 w-4 rounded-full ${i <= level ? "bg-neutral-900" : "bg-neutral-200"}`} />
      ))}
    </span>
  );
}

function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">{title}</h2>
      {children}
    </section>
  );
}

// The back office: where the student stands, the professor's records, past days.
export default function RecordView({ state, journals, dates, currentDate, onOpenDay }) {
  const { t, bi } = useT();
  const stageIndex = Math.max(0, roadmap.stages.findIndex((s) => s.id === state.stage));
  const mastery = state.mastery || {};

  return (
    <div className="pb-16">
      <Section title={t("goal")}>
        <p className="text-[15px]">{bi(roadmap.goal)}</p>
        <div className="mt-3 flex gap-1">
          {roadmap.stages.map((s, i) => (
            <div key={s.id} className={`h-1.5 flex-1 rounded-full ${i <= stageIndex ? "bg-neutral-900" : "bg-neutral-200"}`} />
          ))}
        </div>
        <p className="mt-2 text-sm text-neutral-500">
          {t("stage")}: {stageIndex + 1}/{roadmap.stages.length} · {bi(roadmap.stages[stageIndex].name)}
        </p>
      </Section>

      {state.profileNote && (
        <Section title={t("profile")}>
          <p className="text-[15px] leading-relaxed text-neutral-700">{bi(state.profileNote)}</p>
        </Section>
      )}

      <Section title={t("mastery")}>
        {roadmap.stages.map((stage, i) => {
          const seen = stage.topics.some((tp) => mastery[tp.id]);
          if (!seen && i > stageIndex + 1) return null;
          return (
            <div key={stage.id} className="mb-5">
              <p className="mb-2 text-sm font-semibold">{bi(stage.name)}</p>
              <div className="space-y-2.5">
                {stage.topics.map((tp) => {
                  const m = mastery[tp.id];
                  return (
                    <div key={tp.id}>
                      <div className="flex items-center justify-between gap-3">
                        <span className={`text-sm ${m ? "" : "text-neutral-400"}`}>{bi(tp)}</span>
                        <Level level={m?.level || 0} />
                      </div>
                      {m?.note && <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{bi(m.note)}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </Section>

      <Section title={t("journal")}>
        {journals.length === 0 && <p className="text-sm text-neutral-500">{t("noJournal")}</p>}
        <div className="space-y-6">
          {journals.map((j) => (
            <article key={j.date}>
              <p className="text-xs text-neutral-400">{j.date}</p>
              <p className="mt-1 text-[15px] leading-relaxed">{bi(j.entry)}</p>
              {j.strengths?.length > 0 && (
                <p className="mt-2 text-sm text-neutral-600">
                  <span className="font-semibold text-green-700">{t("strengths")}</span> · {j.strengths.map(bi).join(" · ")}
                </p>
              )}
              {j.struggles?.length > 0 && (
                <p className="mt-1 text-sm text-neutral-600">
                  <span className="font-semibold text-red-600">{t("struggles")}</span> · {j.struggles.map(bi).join(" · ")}
                </p>
              )}
            </article>
          ))}
        </div>
      </Section>

      {dates.length > 0 && (
        <Section title={t("history")}>
          <div className="divide-y divide-neutral-100">
            {[...dates].reverse().map((d, i) => (
              <button
                key={d}
                onClick={() => onOpenDay(d)}
                className="flex w-full items-center justify-between py-3 text-left text-sm"
              >
                <span>
                  {t("day")} {dates.length - i} <span className="text-neutral-400">· {d}</span>
                </span>
                <span className={d === currentDate ? "font-semibold" : "text-neutral-400"}>{t("open")} →</span>
              </button>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
