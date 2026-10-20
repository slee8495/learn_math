import { useEffect, useRef, useState } from "react";
import { runSql, sqlTables } from "../lib/sqlrun.js";
import { pythonReady, runPython } from "../lib/pyrun.js";
import { brief, sameOutput } from "../lib/compare.js";
import { useT } from "../lib/i18n.js";

const MAX_SHOWN = 50;

function readDraft(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function saveDraft(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // not remembered, still works for this visit
  }
}

export function ResultTable({ result, title }) {
  const { t } = useT();
  if (result.value !== undefined) return <pre className="overflow-x-auto font-mono text-[13px]">{result.value}</pre>;
  if (!result.columns) return null;
  return (
    <div>
      {title && <p className="mb-1 font-mono text-xs font-semibold">{title}</p>}
      {result.rows.length === 0 ? (
        <p className="text-sm text-neutral-500">{t("noRows")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="font-mono text-[12px]">
            <thead>
              <tr>
                {result.columns.map((c, i) => (
                  <th key={i} className="border-b border-neutral-300 px-2 py-1 text-left font-semibold whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.slice(0, MAX_SHOWN).map((row, i) => (
                <tr key={i}>
                  {row.map((v, j) => (
                    <td key={j} className="border-b border-neutral-100 px-2 py-1 whitespace-nowrap">
                      {v === null ? <span className="text-neutral-400">NULL</span> : String(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-1 text-xs text-neutral-400">
        {result.rowCount} {t("rows")}
      </p>
    </div>
  );
}

function Output({ run }) {
  const { t } = useT();
  return (
    <div className="mt-3 rounded-xl bg-neutral-50 px-3 py-2.5">
      <p className="mb-1.5 text-xs text-neutral-400">{t("output")}</p>
      {run.error && <pre className="overflow-x-auto font-mono text-[12px] whitespace-pre-wrap text-red-600">{run.error}</pre>}
      {!run.error && <ResultTable result={run} />}
      {run.stdout && (
        <>
          <p className="mt-2 mb-1 text-xs text-neutral-400">{t("printed")}</p>
          <pre className="max-h-48 overflow-auto font-mono text-[12px]">{run.stdout}</pre>
        </>
      )}
    </div>
  );
}

// The problem's sample data: SQL tables as tables, Python setup as code.
function DataPanel({ language, setup }) {
  const [tables, setTables] = useState(null);
  useEffect(() => {
    if (language === "sql") sqlTables(setup).then(setTables, () => setTables([]));
  }, [language, setup]);
  if (language === "python")
    return <pre className="overflow-x-auto rounded-xl bg-neutral-50 px-3 py-2.5 font-mono text-[12px]">{setup}</pre>;
  if (!tables) return null;
  return (
    <div className="space-y-4 rounded-xl bg-neutral-50 px-3 py-2.5">
      {tables.map((tb) => (
        <ResultTable key={tb.name} result={tb} title={tb.name} />
      ))}
    </div>
  );
}

// Keep the indentation of the line above on Enter (one more level after a
// Python colon); Tab inserts spaces. No autocomplete, by design.
function onEditorKey(e, setCode, language) {
  const el = e.currentTarget;
  const { selectionStart: a, selectionEnd: b, value } = el;
  let insert = null;
  if (e.key === "Tab" && !e.shiftKey) insert = "    ";
  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
    const line = value.slice(value.lastIndexOf("\n", a - 1) + 1, a);
    const indent = line.match(/^\s*/)[0];
    insert = `\n${indent}${language === "python" && line.trimEnd().endsWith(":") ? "    " : ""}`;
  }
  if (insert === null) return;
  e.preventDefault();
  const next = value.slice(0, a) + insert + value.slice(b);
  setCode(next);
  requestAnimationFrame(() => {
    el.selectionStart = el.selectionEnd = a + insert.length;
  });
}

// The answer box of a SQL/Python problem: a plain code editor, a run button
// that shows the output on the sample data, and submit, which runs it next to
// the reference solution and hands both outputs to onSubmit for grading.
export default function CodeAnswer({ problem, draftKey, disabled, onSubmit }) {
  const { t } = useT();
  const language = problem.answerType;
  const { setup, starter, solution, ordered } = problem.code;
  const [code, setCodeState] = useState(() => readDraft(draftKey, starter || ""));
  const [run, setRun] = useState(null);
  const [busy, setBusy] = useState(null); // null | "run" | "submit"
  const [showData, setShowData] = useState(false);
  const editor = useRef(null);

  const setCode = (value) => {
    setCodeState(value);
    saveDraft(draftKey, value);
  };

  // grow with the code instead of scrolling inside a small box
  useEffect(() => {
    const el = editor.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 168)}px`;
  }, [code]);

  const exec = (src) => (language === "sql" ? runSql(setup, src) : runPython(setup, src));

  async function doRun() {
    if (!code.trim() || busy) return;
    setBusy("run");
    try {
      setRun(await exec(code));
    } finally {
      setBusy(null);
    }
  }

  async function submit() {
    if (!code.trim() || busy) return;
    setBusy("submit");
    try {
      const mine = await exec(code);
      setRun(mine);
      const expected = await exec(solution);
      await onSubmit({ code, run: brief(mine), expected: brief(expected), localCorrect: sameOutput(mine, expected, ordered) });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-5">
      <button onClick={() => setShowData((v) => !v)} className="mb-2 text-sm text-neutral-500">
        {showData ? `▾ ${t("hideData")}` : `▸ ${t("data")}`}
      </button>
      {showData && (
        <div className="mb-3">
          <DataPanel language={language} setup={setup} />
        </div>
      )}

      <textarea
        ref={editor}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => onEditorKey(e, setCode, language)}
        placeholder={t("codePlaceholder")}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        wrap="off"
        className="block w-full resize-none overflow-x-auto rounded-xl border border-neutral-300 px-3 py-2.5 font-mono text-[14px] leading-relaxed outline-none focus:border-neutral-900"
      />

      <div className="mt-2 flex gap-2">
        <button
          onClick={doRun}
          disabled={!!busy || !code.trim()}
          className="rounded-xl border border-neutral-900 px-4 py-3 font-medium disabled:opacity-30"
        >
          {t("run")}
        </button>
        <button
          onClick={submit}
          disabled={!!busy || disabled || !code.trim()}
          className="flex-1 rounded-xl bg-neutral-900 py-3 font-medium text-white disabled:opacity-30"
        >
          {busy === "submit" ? t("checking") : t("submit")}
        </button>
      </div>
      {busy && language === "python" && !pythonReady && <p className="mt-2 text-sm text-neutral-500">{t("loadingPython")}</p>}
      {busy === "run" && (language === "sql" || pythonReady) && <p className="mt-2 text-sm text-neutral-500">{t("running")}</p>}
      {run && !busy && <Output run={run} />}
    </div>
  );
}
