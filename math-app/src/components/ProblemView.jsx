import { useEffect, useImperativeHandle, useState } from "react";
import Md from "./Md.jsx";
import CodeAnswer from "./CodeAnswer.jsx";
import { matchesLocally } from "../lib/answer.js";
import { useT } from "../lib/i18n.js";
import { useSubject } from "../lib/subject.js";

// When this problem was first opened on this device, kept so the clock
// survives leaving and coming back.
function startedAt(key) {
  try {
    const saved = Number(localStorage.getItem(key));
    if (saved) return saved;
    localStorage.setItem(key, String(Date.now()));
  } catch {
    // counts from now
  }
  return Date.now();
}

const clock = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

// Interview-style time limit: counts up against problem.minutes until solved.
function useTimer(key, running) {
  const [start] = useState(() => startedAt(key));
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);
  return (now - start) / 1000;
}

function Timer({ elapsed, minutes }) {
  const { t } = useT();
  const over = elapsed > minutes * 60;
  return (
    <p className={`mb-3 font-mono text-sm ${over ? "font-semibold text-red-600" : "text-neutral-500"}`}>
      ⏱ {clock(elapsed)} / {minutes}:00{over ? ` · ${t("overTime")}` : ""}
    </p>
  );
}

// One problem: statement, answer box with instant grading, hints and solution.
// The answer can also be the handwritten scratchpad: ref.checkImage(dataUrl).
// SQL/Python problems are answered with code instead (CodeAnswer).
export default function ProblemView({ date, problem, session, onSession, scratchpad, onOpenScratch, ref }) {
  const { t, bi, lang } = useT();
  const { id: subject, api, local } = useSubject();
  const [answer, setAnswer] = useState("");
  const [checking, setChecking] = useState(false);
  const [confirmSolution, setConfirmSolution] = useState(false);
  const [error, setError] = useState(false);

  const attempts = session.attempts[problem.id] || [];
  const hintsShown = session.hints[problem.id] || 0;
  const solutionShown = !!session.solutionViewed[problem.id];
  const last = attempts[attempts.length - 1];
  const solved = attempts.some((a) => a.correct);
  const isLong = problem.answerType === "proof" || problem.answerType === "text";
  const isCode = !!problem.code && ["sql", "python"].includes(problem.answerType);
  // math-style answer keys are bare LaTeX; career subjects' choices and code answers are prose
  const asMath = ["number", "expression"].includes(problem.answerType) || (problem.answerType === "choice" && subject === "math");
  const timed = problem.minutes > 0 && !solved && !solutionShown;
  const elapsed = useTimer(local(`timer_${date}_${problem.id}`), timed);

  async function submitCode(graded) {
    setChecking(true);
    setError(false);
    try {
      const res = await api.check({ date, pid: problem.id, lang, ...graded, ...(problem.minutes > 0 && { elapsed }) });
      onSession(res.session);
    } catch {
      setError(true);
    } finally {
      setChecking(false);
    }
  }

  async function check(value = answer, image) {
    const given = value.trim();
    if ((!given && !image) || checking) return;
    setChecking(true);
    setError(false);
    const time = problem.minutes > 0 ? { elapsed } : {};
    try {
      const res = await api.check(
        image
          ? { date, pid: problem.id, answer: given, image, lang, ...time }
          : { date, pid: problem.id, answer: given, lang, localCorrect: matchesLocally(problem, given), ...time },
      );
      onSession(res.session);
      if (res.correct) setAnswer("");
    } catch {
      setError(true);
    } finally {
      setChecking(false);
    }
  }

  useImperativeHandle(ref, () => ({ checkImage: (image) => check(answer, image) }));

  // Grade straight from the scratchpad; with nothing written yet, open it.
  function checkScratch() {
    const image = scratchpad?.current?.hasWork() ? scratchpad.current.exportImage() : null;
    if (image) check(answer, image);
    else onOpenScratch?.();
  }

  async function event(op) {
    try {
      const res = await api.event({ date, pid: problem.id, op });
      onSession(res.session);
    } catch {
      setError(true);
    }
  }

  function showSolution() {
    if (!confirmSolution && !solved) {
      setConfirmSolution(true);
      return;
    }
    event("solution");
  }

  return (
    <div>
      {timed && <Timer elapsed={elapsed} minutes={problem.minutes} />}
      <Md className="text-[17px] leading-relaxed">{bi(problem.prompt)}</Md>

      {isCode ? (
        <CodeAnswer problem={problem} draftKey={local(`code_${date}_${problem.id}`)} disabled={checking} onSubmit={submitCode} />
      ) : problem.answerType === "choice" && problem.choices.length > 0 ? (
        <div className="mt-5 space-y-2">
          {problem.choices.map((c) => (
            <button
              key={c}
              onClick={() => check(c)}
              disabled={checking}
              className="block w-full rounded-xl border border-neutral-300 px-4 py-3 text-left active:bg-neutral-100"
            >
              <Md>{c}</Md>
            </button>
          ))}
        </div>
      ) : (
        <div className={`mt-5 flex gap-2 ${isLong ? "flex-col" : ""}`}>
          {isLong ? (
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              placeholder={t("proofPlaceholder")}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-[16px] outline-none focus:border-neutral-900"
            />
          ) : (
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && check()}
              placeholder={t("answerPlaceholder")}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="min-w-0 flex-1 rounded-xl border border-neutral-300 px-4 py-3 text-[17px] outline-none focus:border-neutral-900"
            />
          )}
          <button
            onClick={() => check()}
            disabled={checking || !answer.trim()}
            className="shrink-0 rounded-xl bg-neutral-900 px-5 py-3 font-medium text-white disabled:opacity-30"
          >
            {checking ? t("checking") : t("check")}
          </button>
        </div>
      )}

      {problem.answerType !== "choice" && !isCode && !solved && (
        <button onClick={checkScratch} disabled={checking} className="mt-2 text-sm text-neutral-500 underline-offset-2 active:underline disabled:opacity-30">
          ✎ {t("checkScratch")}
        </button>
      )}

      {last && (
        <div className={`mt-3 text-[15px] ${last.correct ? "text-green-700" : "text-red-600"}`}>
          <p className="font-semibold">
            {last.correct ? `✓ ${t("correct")}` : `✗ ${t("wrong")}`}
          </p>
          {last.feedback && <Md className="mt-1 text-neutral-700">{last.feedback}</Md>}
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{t("loadFailed")}</p>}

      {attempts.length > 1 && (
        <p className="mt-2 text-xs text-neutral-400">
          {isCode
            ? `${t("submissions")}: ${attempts.map((a) => (a.correct ? "✓" : "✗")).join(" ")}`
            : `${t("yourAnswers")}: ${attempts.map((a) => `${a.answer}${a.correct ? " ✓" : " ✗"}`).join(" · ")}`}
        </p>
      )}

      {hintsShown > 0 && (
        <div className="mt-6 space-y-3">
          {problem.hints.slice(0, hintsShown).map((h, i) => (
            <div key={i} className="border-l-2 border-neutral-300 pl-3 text-[15px] text-neutral-700">
              <p className="mb-0.5 text-xs text-neutral-400">
                {t("hint")} {i + 1}
              </p>
              <Md>{bi(h)}</Md>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2 text-sm">
        {hintsShown < problem.hints.length && !solutionShown && (
          <button onClick={() => event("hint")} className="rounded-full border border-neutral-300 px-3.5 py-1.5">
            {t("hint")} {hintsShown + 1}/{problem.hints.length}
          </button>
        )}
        {!solutionShown && (
          <button onClick={showSolution} className="rounded-full border border-neutral-300 px-3.5 py-1.5 text-neutral-600">
            {confirmSolution ? t("confirmSolution") : t("showSolution")}
          </button>
        )}
      </div>

      {solutionShown && (
        <div className="mt-6 border-t border-neutral-200 pt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">{t("solution")}</p>
          <Md className="text-[15px] leading-relaxed">{bi(problem.solution)}</Md>
          <div className="mt-3 flex gap-2 text-[15px]">
            <span>→</span>
            <Md>{asMath && !problem.answer.includes("$") ? `$${problem.answer}$` : problem.answer}</Md>
          </div>
        </div>
      )}
    </div>
  );
}
