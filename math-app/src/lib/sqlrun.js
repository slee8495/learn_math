import wasmUrl from "sql.js/dist/sql-wasm.wasm?url";

// SQLite in the browser (sql.js), loaded the first time a SQL problem runs.
// Every run gets a fresh database built from the problem's setup, so the
// student's query and the reference solution see exactly the same data.
let engine;
const load = () => (engine ??= import("sql.js").then((m) => m.default({ locateFile: () => wasmUrl })));

// -> { columns, rows, rowCount } of the last statement that returned rows, or { error }
export async function runSql(setup, query) {
  const SQL = await load();
  const db = new SQL.Database();
  try {
    try {
      db.exec(setup);
    } catch (err) {
      return { error: `setup: ${err.message}` };
    }
    const sets = db.exec(query);
    const last = sets[sets.length - 1];
    if (!last) return { columns: [], rows: [], rowCount: 0 };
    return { columns: last.columns, rows: last.values, rowCount: last.values.length };
  } catch (err) {
    return { error: err.message };
  } finally {
    db.close();
  }
}

// The problem's tables with their rows, for the "data" panel.
export async function sqlTables(setup) {
  const SQL = await load();
  const db = new SQL.Database();
  try {
    db.exec(setup);
    const names = db.exec("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY rowid")[0]?.values.flat() || [];
    return names.map((name) => {
      const [set] = db.exec(`SELECT * FROM "${name.replaceAll('"', '""')}"`);
      return {
        name,
        columns: set?.columns || db.exec(`PRAGMA table_info("${name}")`)[0]?.values.map((v) => v[1]) || [],
        rows: set?.values || [],
        rowCount: set?.values.length || 0,
      };
    });
  } finally {
    db.close();
  }
}
