import { useImperativeHandle, useState } from "react";
import Md from "./Md.jsx";
import { api } from "../lib/api.js";
import { matchesLocally } from "../lib/answer.js";
import { useT } from "../lib/i18n.js";

// One problem: statement, answer box with instant grading, hints and solution.
// The answer can also be the handwritten scratchpad: ref.checkImage(dataUrl).
export default function ProblemView({ date, problem, session, onSession, scratchpad, onOpenScratch, ref }) {
  const { t, bi, lang } = useT();
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

  async function check(value = answer, image) {
    const given = value.trim();
    if ((!given && !image) || checking) return;
    setChecking(true);
    setError(false);
    try {
      const res = await api.check(
        image
          ? { date, pid: problem.id, answer: given, image, lang }
          : { date, pid: problem.id, answer: given, lang, localCorrect: matchesLocally(problem, given) },
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
      <Md className="text-[17px] leading-relaxed">{bi(problem.prompt)}</Md>

      {problem.answerType === "choice" && problem.choices.length > 0 ? (
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

      {problem.answerType !== "choice" && !solved && (
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
          {t("yourAnswers")}: {attempts.map((a) => `${a.answer}${a.correct ? " ✓" : " ✗"}`).join(" · ")}
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
            <Md>{isLong || problem.answer.includes("$") ? problem.answer : `$${problem.answer}$`}</Md>
          </div>
        </div>
      )}
    </div>
  );
}
