#!/usr/bin/env node
// Helper for the daily professor routine (see tutor/ROUTINE.md).
//
//   node scripts/tutor.mjs pull                 -> tutor/work/context.json
//   node scripts/tutor.mjs validate <file>      -> checks a TutorOutput JSON file
//   node scripts/tutor.mjs push <file> [date]   -> stores it as the plan for date (default: context's today)
//
// Needs TUTOR_URL (e.g. https://math-app-five-beta.vercel.app) and TUTOR_TOKEN.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TutorOutput } from "../tutor/schema.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const workDir = join(root, "tutor", "work");
const contextFile = join(workDir, "context.json");

const { TUTOR_URL, TUTOR_TOKEN } = process.env;

function need(name, value) {
  if (!value) {
    console.error(`Missing ${name} environment variable.`);
    process.exit(1);
  }
}

async function call(method, body) {
  need("TUTOR_URL", TUTOR_URL);
  need("TUTOR_TOKEN", TUTOR_TOKEN);
  const res = await fetch(`${TUTOR_URL.replace(/\/$/, "")}/api/tutor`, {
    method,
    headers: { Authorization: `Bearer ${TUTOR_TOKEN}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`HTTP ${res.status}:`, JSON.stringify(data, null, 2));
    process.exit(1);
  }
  return data;
}

function validate(file) {
  const raw = JSON.parse(readFileSync(file, "utf8"));
  const result = TutorOutput.safeParse(raw);
  if (!result.success) {
    console.error("Invalid TutorOutput:");
    for (const issue of result.error.issues) console.error(`  ${issue.path.join(".")}: ${issue.message}`);
    process.exit(1);
  }
  const problems = result.data.plan.problems;
  const warnings = [];
  for (const p of problems) {
    if (p.hints.length !== 3) warnings.push(`${p.id}: has ${p.hints.length} hints (expected 3)`);
    if (["number", "expression"].includes(p.answerType) && !p.accept.length) warnings.push(`${p.id}: no accept forms`);
    if (p.answerType === "choice" && !p.choices.includes(p.answer)) warnings.push(`${p.id}: answer is not one of the choices`);
  }
  if (!problems.some((p) => p.role === "main")) warnings.push("no problem has role 'main'");
  if (result.data.plan.lecture.scenes.length < 3) warnings.push("lecture has fewer than 3 scenes");
  for (const w of warnings) console.warn(`warning: ${w}`);
  console.log(`OK: ${problems.length} problems, ${result.data.plan.lecture.scenes.length} lecture scenes.`);
  return raw;
}

const [cmd, file, dateArg] = process.argv.slice(2);

if (cmd === "pull") {
  const context = await call("GET");
  mkdirSync(workDir, { recursive: true });
  writeFileSync(contextFile, JSON.stringify(context, null, 2));
  console.log(
    `Wrote ${contextFile}. today=${context.today} dayCount=${context.dayCount} todayPlanExists=${context.todayPlanExists}`,
  );
} else if (cmd === "validate" && file) {
  validate(file);
} else if (cmd === "push" && file) {
  const output = validate(file);
  const date = dateArg || JSON.parse(readFileSync(contextFile, "utf8")).today;
  const result = await call("POST", { date, output });
  console.log("Pushed:", JSON.stringify(result));
} else {
  console.log("usage: node scripts/tutor.mjs pull | validate <file> | push <file> [date]");
  process.exit(1);
}
