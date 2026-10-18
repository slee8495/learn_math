#!/usr/bin/env node
// Helper for the daily professor routine (see tutor/ROUTINE.md).
//
//   node scripts/tutor.mjs pull                 -> tutor/work/context.json
//   node scripts/tutor.mjs validate <file>      -> checks a TutorOutput JSON file
//   node scripts/tutor.mjs push <file> [date]   -> stores it as the plan for date (default: context's today)
//
// Needs TUTOR_URL (e.g. https://math-app-five-beta.vercel.app) and TUTOR_TOKEN.
import { execFileSync } from "node:child_process";
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
      `${TUTOR_URL.replace(/\/$/, "")}/api/tutor`,
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
  for (const w of warnings) console.warn(`warning: ${w}`);
  console.log(`OK: ${problems.length} problems.`);
  return raw;
}

const [cmd, file, dateArg] = process.argv.slice(2);

if (cmd === "pull") {
  const context = call("GET");
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
  const result = call("POST", { date, output });
  console.log("Pushed:", JSON.stringify(result));
} else {
  console.log("usage: node scripts/tutor.mjs pull | validate <file> | push <file> [date]");
  process.exit(1);
}
