// Does the student's output match the reference output? Both come from the
// same engine on the same data. Like the grader on the server, this ignores
// presentation the prompt can't reasonably pin down: column names, column
// order (when the columns can be matched by their values), row order unless
// the problem is `ordered`, and float noise past 6 decimals. Anything this
// can't confirm is judged again by the model.

function cell(v) {
  if (v === null || v === undefined) return "∅";
  if (typeof v === "boolean") return v ? "1" : "0";
  const n = typeof v === "number" ? v : /^\s*-?\d+(\.\d+)?(e[+-]?\d+)?\s*$/i.test(String(v)) ? Number(v) : null;
  if (n !== null) return Number.isFinite(n) ? String(Math.round(n * 1e6) / 1e6 + 0) : "∅";
  return String(v).trim();
}

const rowKey = (row) => JSON.stringify(row);

function sameRows(a, b, ordered) {
  const ka = a.map(rowKey);
  const kb = b.map(rowKey);
  if (!ordered) {
    ka.sort();
    kb.sort();
  }
  return ka.every((k, i) => k === kb[i]);
}

// Reorder the student's columns to the reference's when each column's values match one there.
function alignColumns(a, b) {
  const width = b[0]?.length ?? 0;
  const sig = (rows, c) => rows.map((r) => r[c]).sort().join("\u0001");
  const used = new Set();
  const order = [];
  for (let c = 0; c < width; c++) {
    const want = sig(b, c);
    const match = [...Array(width).keys()].find((x) => !used.has(x) && sig(a, x) === want);
    if (match === undefined) return null;
    used.add(match);
    order.push(match);
  }
  return a.map((r) => order.map((c) => r[c]));
}

function sameValue(x, y, ordered) {
  if (Array.isArray(x) && Array.isArray(y)) {
    if (x.length !== y.length) return false;
    const norm = (arr) => arr.map((v) => JSON.stringify(Array.isArray(v) ? v.map(cell) : cell(v)));
    const [nx, ny] = [norm(x), norm(y)];
    if (!ordered) {
      nx.sort();
      ny.sort();
    }
    return nx.every((v, i) => v === ny[i]);
  }
  if (x && y && typeof x === "object" && typeof y === "object") return JSON.stringify(x) === JSON.stringify(y);
  return cell(x) === cell(y);
}

const parse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export function sameOutput(mine, ref, ordered = false) {
  if (!mine || !ref || mine.error || ref.error) return false;
  // a single number in a 1x1 table vs a plain value
  const scalar = (r) => (r.value !== undefined ? parse(r.value) : r.rows?.length === 1 && r.rows[0].length === 1 ? r.rows[0][0] : undefined);
  if (mine.value !== undefined || ref.value !== undefined) {
    const [x, y] = [scalar(mine), scalar(ref)];
    return x !== undefined && y !== undefined && sameValue(x, y, ordered);
  }
  const a = (mine.rows || []).map((r) => r.map(cell));
  const b = (ref.rows || []).map((r) => r.map(cell));
  if (a.length !== b.length || (mine.columns || []).length !== (ref.columns || []).length) return false;
  if (!b.length) return true;
  if (sameRows(a, b, ordered)) return true;
  const aligned = alignColumns(a, b);
  return !!aligned && sameRows(aligned, b, ordered);
}

// What the server needs to see of a run: the first rows only.
export function brief(run) {
  if (!run) return null;
  const { rows, ...rest } = run;
  return rows ? { ...rest, rows: rows.slice(0, 30) } : rest;
}
