import { useRef, useState } from "react";
import ProblemView from "./ProblemView.jsx";
import Scratchpad from "./Scratchpad.jsx";
import { useT } from "../lib/i18n.js";
import { useSubject } from "../lib/subject.js";
import { useWide } from "../lib/wide.js";

const isDone = (session, pid) =>
  (session.attempts[pid] || []).some((a) => a.correct) || !!session.solutionViewed[pid];

// Which branch to suggest after a problem: harder if it went smoothly, a new
// angle if it took effort, easier if they gave up.
function suggestNext(problems, session, currentId) {
  const remaining = problems.filter((p) => !isDone(session, p.id) && p.id !== currentId);
  if (!remaining.length) return null;
  const attempts = session.attempts[currentId] || [];
  const solved = attempts.some((a) => a.correct);
  const smooth = solved && attempts.length <= 1 && (session.hints[currentId] || 0) <= 1;
  const order = !solved ? ["easier", "angle", "retest", "main", "harder"] : smooth ? ["harder", "angle", "main", "retest", "easier"] : ["angle", "retest", "main", "harder", "easier"];
  for (const role of order) {
    const p = remaining.find((x) => x.role === role);
    if (p) return p;
  }
  return remaining[0];
}

const roundOf = (p) => p.round || 1;

export default function TodayView({ date, initialPid, plan, session, onSession, onMore }) {
  const { t, bi } = useT();
  const { local, info } = useSubject();
  // Only one round is shown at a time: the latest, or the one an archive link points into.
  const start = plan.problems.find((p) => p.id === initialPid);
  const round = start ? roundOf(start) : plan.round || 1;
  const problems = plan.problems.filter((p) => roundOf(p) === round);
  const [more, setMore] = useState("idle"); // idle | making | failed
  const [activeId, setActiveId] = useState(initialPid || problems[0]?.id);
  const [scratchOpen, setScratchOpen] = useState(false);
  // Wide screens keep the scratchpad open in a column beside the problem.
  const wide = useWide();
  const scratchRef = useRef(null);
  // SQL/Python have no scratchpad; on wide screens their code editor takes its column instead.
  const [codeSlot, setCodeSlot] = useState(null);
  const problemRef = useRef(null);

  const problem = problems.find((p) => p.id === activeId) || problems[0];
  const done = isDone(session, problem.id);
  const next = done ? suggestNext(problems, session, problem.id) : null;
  const allDone = problems.every((p) => isDone(session, p.id));
  const codeSide = wide && !!info.code && !!problem.code && ["sql", "python"].includes(problem.answerType);
  const twoColumns = info.code ? codeSide : true;

  async function makeMore() {
    setMore("making");
    try {
      await onMore();
    } catch {
      setMore("failed");
    }
  }

  function open(p) {
    setActiveId(p.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const scratchpad = (
    <Scratchpad
      ref={scratchRef}
      docked={wide}
      open={scratchOpen}
      onClose={() => setScratchOpen(false)}
      storageKey={local(`scratch_${date}_${problem.id}`)}
      attachLabel={t("grade")}
      onAttach={(img) => {
        setScratchOpen(false);
        problemRef.current?.checkImage(img);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    />
  );

  return (
    <div
      className={`${info.code ? "pb-16" : "pb-28 lg:pb-16"} ${twoColumns ? "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10" : ""}`}
    >
      <div>
        <div className="mb-5">
          <p className="text-xs text-neutral-400">{t(`move_${plan.decision.move}`)}</p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight">{bi(plan.headline)}</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">{bi(plan.decision.reason)}</p>
        </div>

        {problems.length > 1 && (
          <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 md:-mx-8 md:px-8 lg:mx-0 lg:flex-wrap lg:px-0">
            {problems.map((p, i) => (
              <button
                key={p.id}
                onClick={() => open(p)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm ${
                  p.id === problem.id ? "bg-neutral-900 text-white" : "border border-neutral-300 text-neutral-700"
                }`}
              >
                {i + 1}. {t(`role_${p.role}`)}
                {isDone(session, p.id) ? " ✓" : ""}
              </button>
            ))}
          </div>
        )}

        <ProblemView
          key={`${date}-${problem.id}`}
          ref={problemRef}
          date={date}
          problem={problem}
          session={session}
          onSession={onSession}
          scratchpad={scratchRef}
          onOpenScratch={() => setScratchOpen(true)}
          codeSlot={codeSide ? codeSlot : null}
        />

        {done && (
          <div className="mt-8 border-t border-neutral-200 pt-5">
            {next ? (
              <button onClick={() => open(next)} className="w-full rounded-xl bg-neutral-900 py-3.5 font-medium text-white">
                {t("next")}: {t(`role_${next.role}`)} →
              </button>
            ) : (
              allDone && (
                <>
                  <p className="text-[15px] leading-relaxed text-neutral-600">{t("allDone")}</p>
                  {onMore && round === (plan.round || 1) &&
                    (more === "making" ? (
                      <p className="mt-5 text-[15px] text-neutral-500">{t("makingMore")}</p>
                    ) : (
                      <button onClick={makeMore} className="mt-5 w-full rounded-xl border border-neutral-900 py-3.5 font-medium">
                        {t("oneMore")}
                      </button>
                    ))}
                  {more === "failed" && <p className="mt-2 text-sm text-red-600">{t("loadFailed")}</p>}
                </>
              )
            )}
          </div>
        )}
      </div>

      {info.code ? (
        codeSide && <div ref={setCodeSlot} className="sticky top-4 max-h-[calc(100dvh-2rem)] overflow-y-auto [&>div]:mt-0" />
      ) : wide ? (
        <div className="sticky top-4 h-[calc(100dvh-2rem)]">{scratchpad}</div>
      ) : (
        <>
          <div
            className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
          >
            <div className="mx-auto flex max-w-xl gap-2 px-4 pt-2 md:max-w-2xl md:px-8">
              <button onClick={() => setScratchOpen(true)} className="flex-1 rounded-xl bg-neutral-900 py-3 font-medium text-white">
                ✎ {t("scratch")}
              </button>
            </div>
          </div>
          {scratchpad}
        </>
      )}
    </div>
  );
}
