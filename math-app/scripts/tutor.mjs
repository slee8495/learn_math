#!/usr/bin/env node
// Helper for the daily professor routine (see tutor/ROUTINE.md).
//
//   node scripts/tutor.mjs pull                 -> tutor/work/context.json
//   node scripts/tutor.mjs validate <file>      -> checks a TutorOutput JSON file
//   node scripts/tutor.mjs push <file> [date]   -> stores it as the plan for date (default: context's today)
//
// Add --subject=<math|sql|python|stats> to work on that subject (default math;
// other subjects use tutor/work/<subject>/). For sql and python problems,
// validate also runs every reference solution on its setup data: SQL with
// sql.js (the same engine the app uses), Python with the local python3 + pandas.
//
// Needs TUTOR_URL (e.g. https://math-app-five-beta.vercel.app) and TUTOR_TOKEN.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tutorOutputFor } from "../tutor/schema.js";
import { SUBJECT_IDS } from "../tutor/subjects.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
const flag = args.find((a) => a.startsWith("--subject"));
const subject = flag?.includes("=") ? flag.split("=")[1] : flag ? args[args.indexOf(flag) + 1] : "math";
const positional = args.filter((a, i) => !a.startsWith("--") && !(flag && !flag.includes("=") && args[i - 1] === flag));
if (!SUBJECT_IDS.includes(subject)) {
  console.error(`Unknown subject "${subject}". One of: ${SUBJECT_IDS.join(", ")}`);
  process.exit(1);
}

const workDir = subject === "math" ? join(root, "tutor", "work") : join(root, "tutor", "work", subject);
const contextFile = join(workDir, "context.json");

const { TUTOR_URL, TUTOR_TOKEN } = process.env;

function need(name, value) {
  if (!value) {
    console.error(`Missing ${name} environment variable.`);
    process.exit(1);
  }
}

// curl rather than fetch: cloud sandboxes reach the internet through an
// HTTPS_PROXY that curl honors and Node's fetch ignores.
function call(method, body) {
  need("TUTOR_URL", TUTOR_URL);
  need("TUTOR_TOKEN", TUTOR_TOKEN);
  const marker = "\n__HTTP_STATUS__";
  const out = execFileSync(
    "curl",
    [
      "-sS",
      "-X",
      method,
      "-H",
      `Authorization: Bearer ${TUTOR_TOKEN}`,
      "-H",
      "Content-Type: application/json",
      ...(body ? ["--data-binary", "@-"] : []),
      "-w",
      `${marker}%{http_code}`,
      `${TUTOR_URL.replace(/\/$/, "")}/api/tutor?subject=${subject}`,
    ],
    { input: body ? JSON.stringify(body) : undefined, maxBuffer: 64 * 1024 * 1024, encoding: "utf8" },
  );
  const at = out.lastIndexOf(marker);
  const status = Number(out.slice(at + marker.length));
  let data = {};
  try {
    data = JSON.parse(out.slice(0, at));
  } catch {
    data = { raw: out.slice(0, at).slice(0, 500) };
  }
  if (status < 200 || status >= 300) {
    console.error(`HTTP ${status}:`, JSON.stringify(data, null, 2));
    process.exit(1);
  }
  return data;
}

let sqlEngine;

async function runSql(setup, query) {
  if (!sqlEngine) sqlEngine = await (await import("sql.js")).default();
  const db = new sqlEngine.Database();
  try {
    db.exec(setup);
    const sets = db.exec(query);
    const last = sets[sets.length - 1];
    if (!last) throw new Error("the query returned no result set");
    return `${last.values.length} row(s) × ${last.columns.length} col(s) [${last.columns.join(", ")}]; first: ${JSON.stringify(last.values[0] ?? null)}`;
  } finally {
    db.close();
  }
}

const PY_CHECK = `
import json, sys
src = json.load(sys.stdin)
ns = {}
exec(src["setup"], ns)
exec(src["solution"], ns)
if "result" not in ns:
    raise SystemExit("solution does not assign result")
r = ns["result"]
shape = getattr(r, "shape", None)
print(f"{type(r).__name__}{' ' + str(shape) if shape is not None else ''}: {str(r)[:160]!r}")
`;

let pythonOk;

function runPython(setup, solution) {
  if (pythonOk === undefined) pythonOk = spawnSync("python3", ["-c", "import pandas"]).status === 0;
  if (!pythonOk) return { skipped: true };
  const out = spawnSync("python3", ["-I", "-c", PY_CHECK], { input: JSON.stringify({ setup, solution }), encoding: "utf8", timeout: 60000 });
  if (out.status !== 0) throw new Error((out.stderr || out.stdout || "python failed").trim().split("\n").slice(-6).join("\n"));
  return { summary: out.stdout.trim() };
}

// Run every reference solution on its data. Errors are fatal: a problem whose
// own solution doesn't run would be unsolvable in the app.
async function runCode(problems, errors, warnings) {
  for (const p of problems) {
    if (!["sql", "python"].includes(p.answerType)) {
      if (p.code) warnings.push(`${p.id}: has code but answerType ${p.answerType}`);
      continue;
    }
    if (!p.code?.solution?.trim()) {
      errors.push(`${p.id}: ${p.answerType} problem without code.solution`);
      continue;
    }
    try {
      if (p.answerType === "sql") {
        console.log(`  ${p.id} (sql): ${await runSql(p.code.setup, p.code.solution)}`);
      } else {
        const r = runPython(p.code.setup, p.code.solution);
        if (r.skipped) warnings.push(`${p.id}: python3 with pandas not found; reference solution NOT run (pip install pandas)`);
        else console.log(`  ${p.id} (python): ${r.summary}`);
      }
    } catch (err) {
      errors.push(`${p.id}: reference solution failed: ${err.message}`);
    }
  }
}

async function validate(file) {
  const raw = JSON.parse(readFileSync(file, "utf8"));
  const result = tutorOutputFor(subject).safeParse(raw);
  if (!result.success) {
    console.error("Invalid TutorOutput:");
    for (const issue of result.error.issues) console.error(`  ${issue.path.join(".")}: ${issue.message}`);
    process.exit(1);
  }
  const problems = result.data.plan.problems;
  const warnings = [];
  const errors = [];
  for (const p of problems) {
    if (p.hints.length !== 3) warnings.push(`${p.id}: has ${p.hints.length} hints (expected 3)`);
    if (["number", "expression"].includes(p.answerType) && !p.accept.length) warnings.push(`${p.id}: no accept forms`);
    if (p.answerType === "choice" && !p.choices.includes(p.answer)) warnings.push(`${p.id}: answer is not one of the choices`);
  }
  if (!problems.some((p) => p.role === "main")) warnings.push("no problem has role 'main'");
  if (subject !== "math") await runCode(problems, errors, warnings);
  for (const w of warnings) console.warn(`warning: ${w}`);
  if (errors.length) {
    for (const e of errors) console.error(`error: ${e}`);
    process.exit(1);
  }
  console.log(`OK: ${subject}, ${problems.length} problems.`);
  return raw;
}

const [cmd, file, dateArg] = positional;

if (cmd === "pull") {
  const context = call("GET");
  // A deployment from before the library ignores ?subject= and answers with math.
  if ((context.subject || "math") !== subject) {
    console.error(`The server answered with ${context.subject || "math"} data for subject=${subject}; it needs the library deploy first. Skip this subject.`);
    process.exit(1);
  }
  mkdirSync(workDir, { recursive: true });
  writeFileSync(contextFile, JSON.stringify(context, null, 2));
  console.log(
    `Wrote ${contextFile}. subject=${subject} today=${context.today} dayCount=${context.dayCount} todayPlanExists=${context.todayPlanExists} lastPlanUntouched=${context.lastPlanUntouched}`,
  );
} else if (cmd === "validate" && file) {
  await validate(file);
} else if (cmd === "push" && file) {
  const output = await validate(file);
  const date = dateArg || JSON.parse(readFileSync(contextFile, "utf8")).today;
  const result = call("POST", { subject, date, output });
  console.log("Pushed:", JSON.stringify(result));
} else {
  console.log("usage: node scripts/tutor.mjs pull | validate <file> | push <file> [date]  [--subject=math|sql|python|stats]");
  process.exit(1);
}
