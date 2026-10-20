// Python (Pyodide + pandas) off the main thread, so a slow or endless run can
// be stopped by terminating the worker. Loaded from the CDN on first use.
const PYODIDE = "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/";

// _run executes setup then the code in a fresh namespace and returns `result`
// as JSON: a table ({ columns, rows, rowCount }) for a DataFrame/Series (a
// non-default index becomes columns), otherwise { value }; plus what it printed.
const HELPER = `
import io, json, contextlib, traceback
import numpy as np
import pandas as pd

def _table(df):
    if not (isinstance(df.index, pd.RangeIndex) and df.index.start == 0 and df.index.step == 1):
        df = df.reset_index()
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = ["_".join(str(x) for x in c if str(x)) for c in df.columns]
    d = json.loads(df.to_json(orient="split", date_format="iso", index=False, default_handler=str))
    return {"columns": [str(c) for c in df.columns], "rows": d["data"], "rowCount": len(df)}

def _norm(v):
    if isinstance(v, pd.Series):
        v = v.to_frame(name=v.name if v.name is not None else "value")
    if isinstance(v, pd.DataFrame):
        return _table(v)
    if isinstance(v, np.ndarray):
        v = v.tolist()
    if isinstance(v, np.generic):
        v = v.item()
    try:
        return {"value": json.dumps(v, default=str, ensure_ascii=False)}
    except Exception:
        return {"value": json.dumps(repr(v))}

def _error(e, label):
    lines = traceback.format_exception_only(type(e), e)
    at = [f.lineno for f in traceback.extract_tb(e.__traceback__) if f.filename == label]
    where = f"line {at[-1]}: " if at else ""
    return where + "".join(lines).strip()

def _run(setup, code):
    ns = {}
    out = io.StringIO()
    try:
        with contextlib.redirect_stdout(out):
            exec(compile(setup, "<setup>", "exec"), ns)
            exec(compile(code, "<code>", "exec"), ns)
            if "result" not in ns:
                raise NameError("result is not defined: assign your final answer to result")
            r = _norm(ns["result"])
    except Exception as e:
        r = {"error": _error(e, "<code>")}
    r["stdout"] = out.getvalue()[-4000:]
    return json.dumps(r, ensure_ascii=False)
`;

let ready;

async function boot() {
  const { loadPyodide } = await import(/* @vite-ignore */ `${PYODIDE}pyodide.mjs`);
  const py = await loadPyodide({ indexURL: PYODIDE });
  await py.loadPackage(["pandas"]);
  py.runPython(HELPER);
  return py;
}

self.onmessage = async ({ data: { id, setup, code } }) => {
  try {
    const py = await (ready ??= boot());
    self.postMessage({ id, started: true });
    const run = py.globals.get("_run");
    self.postMessage({ id, result: JSON.parse(run(setup, code)) });
  } catch (err) {
    ready = null;
    self.postMessage({ id, result: { error: `Python could not load: ${err.message}` } });
  }
};
