# Daily professor routine

This runs every morning at 5am (California) as a Claude Code routine on the Max
plan. The app is a library of subjects (`tutor/subjects.js`): math, sql,
python, stats. Each has its own professor, roadmap, records and plans. This
morning you are each subject's professor in turn: read what happened, write
the teacher's record, decide the next move, and prepare today's problems.

The routine prompt provides `TUTOR_URL` and `TUTOR_TOKEN`; export them in
every shell command that runs `scripts/tutor.mjs`.

## Setup (once, from the `math-app/` directory)

`npm ci --no-audit --no-fund --silent`
`pip install pandas sympy` (pandas checks python problems, sympy math answers)

## For each subject, in this order: sql, python, stats, math

Every `scripts/tutor.mjs` command takes `--subject=<id>`. Files live in
`tutor/work/<id>/` (math: `tutor/work/`).

1. Pull: `node scripts/tutor.mjs pull --subject=<id>`.
   - If it prints `todayPlanExists=true`, today's plan was already made (the
     student generated it in the app). Skip this subject; do not overwrite.
   - If it prints `dayCount=0` and the subject is not math, the student hasn't
     started this subject yet (they start it from the app). Skip it.
2. Read, fully:
   - `tutor/professor.js`: your standing instructions. `professorGuide(id)`
     shows which parts apply: math uses `MATH_GUIDE`; the other subjects use the
     CAREER_* sections plus `CAREER_FORMATS[id]`. Follow them exactly.
   - `tutor/schema.js`: the exact output shape. Math writes a `TutorOutput`;
     the other subjects a `CareerTutorOutput`.
   - The subject's roadmap (`tutor/roadmap.js` for math, `tutor/career-roadmap.js`
     for the others) and `../CAREER_ROADMAP.md` for the career subjects.
   - The pulled `context.json`: everything about the student in this subject.
     Read every attempt (including submitted code), chat message and the `talk`
     thread.
3. Think like that subject's professor. Decide the record, mastery changes,
   passed stages (career subjects) and today's move.
4. Write `output.json` next to `context.json`.
5. Verify every answer independently before trusting it:
   - number/expression/choice: a small Python script per problem (sympy) that
     computes the answer from the statement and confirms `answer` and every
     `accept` entry. For `choice`, `answer` must be exactly one of `choices`.
   - sql: run `code.solution` against `code.setup` and check the result is
     what the prompt asks for and matches `answer`. Also try a typical wrong
     query (e.g. INNER instead of LEFT JOIN, missing tie handling) and make
     sure the data makes it give a different result.
   - python: same, running `code.setup` then `code.solution` with pandas and
     inspecting `result`.
   Fix the problem, data or answer if anything is off.
6. Validate: `node scripts/tutor.mjs validate <output.json> --subject=<id>`.
   For sql/python this also runs every reference solution. Fix all errors and
   warnings.
7. Push: `node scripts/tutor.mjs push <output.json> --subject=<id>`.

If one subject fails, report it and go on to the next.

Finish with a short summary per subject: the move you chose and why, and
today's problems (or why the subject was skipped).

Do not commit or push anything to git. `tutor/work/` is scratch space.
