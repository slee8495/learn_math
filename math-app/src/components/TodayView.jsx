import { useRef, useState } from "react";
import ProblemView from "./ProblemView.jsx";
import Scratchpad from "./Scratchpad.jsx";
import ChatSheet from "./ChatSheet.jsx";
import { useT } from "../lib/i18n.js";

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

export default function TodayView({ date, initialPid, plan, session, onSession }) {
  const { t, bi } = useT();
  const problems = plan.problems;
  const [activeId, setActiveId] = useState(initialPid || problems[0]?.id);
  const [sheet, setSheet] = useState(null); // "scratch" | "chat"
  const scratchRef = useRef(null);
  const problemRef = useRef(null);

  const problem = problems.find((p) => p.id === activeId) || problems[0];
  const done = isDone(session, problem.id);
  const next = done ? suggestNext(problems, session, problem.id) : null;
  const allDone = problems.every((p) => isDone(session, p.id));

  const chatThread = session.chat
    .filter((m) => m.pid === problem.id)
    .map((m) => ({ role: m.role, text: m.text, image: m.image || undefined }));

  function open(p) {
    setActiveId(p.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="pb-28">
      <div className="mb-5">
        <p className="text-xs text-neutral-400">{t(`move_${plan.decision.move}`)}</p>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight">{bi(plan.headline)}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">{bi(plan.decision.reason)}</p>
      </div>

      {problems.length > 1 && (
        <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4">
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
        onOpenScratch={() => setSheet("scratch")}
      />

      {done && (
        <div className="mt-8 border-t border-neutral-200 pt-5">
          {next ? (
            <button onClick={() => open(next)} className="w-full rounded-xl bg-neutral-900 py-3.5 font-medium text-white">
              {t("next")}: {t(`role_${next.role}`)} →
            </button>
          ) : (
            allDone && <p className="text-[15px] leading-relaxed text-neutral-600">{t("allDone")}</p>
          )}
        </div>
      )}

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
      >
        <div className="mx-auto flex max-w-xl gap-2 px-4 pt-2">
          <button onClick={() => setSheet("scratch")} className="flex-1 rounded-xl border border-neutral-300 py-3 font-medium">
            ✎ {t("scratch")}
          </button>
          <button onClick={() => setSheet("chat")} className="flex-1 rounded-xl bg-neutral-900 py-3 font-medium text-white">
            {t("ask")}
          </button>
        </div>
      </div>

      <Scratchpad
        ref={scratchRef}
        open={sheet === "scratch"}
        onClose={() => setSheet(null)}
        storageKey={`mp_scratch_${date}_${problem.id}`}
        attachLabel={t("grade")}
        onAttach={(img) => {
          setSheet(null);
          problemRef.current?.checkImage(img);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
      <ChatSheet
        open={sheet === "chat"}
        onClose={() => setSheet(null)}
        date={date}
        problem={problem}
        initial={chatThread}
        scratchpad={scratchRef}
        onOpenScratch={() => setSheet("scratch")}
        onExchange={(userMsg, reply) => {
          // mirror what the server saved, so switching problems keeps the thread
          const pid = problem.id;
          onSession((s) => ({
            ...s,
            chat: [
              ...s.chat,
              { role: "user", pid, text: userMsg.text, image: !!userMsg.image },
              { role: "assistant", pid, text: reply },
            ],
          }));
        }}
      />
    </div>
  );
}
