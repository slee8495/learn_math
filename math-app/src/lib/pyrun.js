// Runs Python in a worker (see pyworker.js). The first run downloads Python
// and pandas (tens of MB, cached by the browser afterwards).
const TIMEOUT_MS = 20000; // per run, after Python has loaded

let worker;
let nextId = 0;
const pending = new Map();
export let pythonReady = false;

function start() {
  worker = new Worker(new URL("./pyworker.js", import.meta.url), { type: "module" });
  worker.onmessage = ({ data }) => {
    const job = pending.get(data.id);
    if (!job) return;
    if (data.started) {
      pythonReady = true;
      job.timer = setTimeout(() => {
        // an endless loop: the only way out is a new worker
        worker.terminate();
        worker = null;
        pythonReady = false;
        for (const [id, j] of pending) {
          clearTimeout(j.timer);
          j.resolve({ error: "Timed out after 20s (an endless loop?)" });
          pending.delete(id);
        }
      }, TIMEOUT_MS);
      return;
    }
    clearTimeout(job.timer);
    pending.delete(data.id);
    job.resolve(data.result);
  };
}

function send(message) {
  if (!worker) start();
  const id = ++nextId;
  return new Promise((resolve) => {
    pending.set(id, { resolve });
    worker.postMessage({ id, ...message });
  });
}

// -> { columns, rows, rowCount } or { value } or { missing } / { none }, with
// stdout and last (the last line's value); or { error }
export const runPython = (setup, code) => send({ setup, code });

// The setup's data variables: [{ name, columns, rows, rowCount } | { name, value }]
export async function pythonData(setup) {
  const found = await send({ setup, inspect: true });
  return Array.isArray(found) ? found : [];
}
