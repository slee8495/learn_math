# math-app — Project Reference

**GitHub repo:** https://github.com/slee8495/learn_math
**Live app:** https://math-app-five-beta.vercel.app (deployed on Vercel, `math-app` project)
**App subdirectory:** `math-app/` (the actual Vite app lives one level below repo root)

This document exists so a future Claude session (working in a *different* repo, e.g. a new subject app) can read it, look at the actual `learn_math` GitHub repo for concrete code, and rebuild the same product philosophy for a new subject — without re-deriving decisions that were already made and refined here through several rounds of user feedback.

This app itself was built by explicitly copying the philosophy of an earlier sibling project, **`learn_japanese`** (https://github.com/slee8495/learn_japanese, reference doc `learn_japanese.md` in that repo). Read that repo/doc too if you want the original reasoning trail — most of the "why" below traces back to decisions made there.

---

## 1. Who this is for and why it exists

Built for one person (the repo owner, based in California) to re-learn math on his own, from his phone. Origin conversation is in `claude.md` at repo root.

Core ask, distilled: **open the app, follow the day's 3 tasks, ~10 minutes, and eventually work all the way up through college-level math** (calculus, intro linear algebra, probability & statistics) starting from whatever level is *not already known*. No login, no backend, no cost, English UI (the user lives in the US), calendar/day-number pinned to California time.

---

## 2. Product philosophy (the part worth copying)

Same core defaults as `learn_japanese`, plus a few decisions specific to how this one evolved:

1. **Web app (PWA), not native.** Same reasoning as the Japanese app — `npx vercel` deploy, Safari "Add to Home Screen," no App Store review. See `learn_japanese.md` §2.1 for the full tradeoff writeup; it wasn't re-litigated here, just reused.

2. **Name-based profiles, not implicit single-user.** This app was originally built assuming "just for me" (no profile screen). The user later asked for the same name-keyed `localStorage` pattern as the Japanese app anyway, so it could be shared with someone else on the same link. **Lesson: default to the multi-profile pattern from the start** even for a "just for me" ask — it's cheap to add and the user asked for it retroactively once they remembered the sibling app had it. `localStorage["math_profile"]` stores the current name; `localStorage["math_daily_<name>"]` stores that person's day-by-day task completion.

3. **Day-number curriculum pinned to a fixed timezone.** Same pattern as the Japanese app: `dayNumber = floor((today - START) / 1 day) + 1`, with "today" always computed via `Intl.DateTimeFormat` against a fixed IANA timezone (`America/Los_Angeles` here, matching where the user actually lives — this app got it right from day one instead of hitting the off-by-one bug the Japanese app had). See `getCaliforniaToday()` in `curriculum.js`.

4. **Home screen is a dashboard, not a menu.** Identical to the Japanese app: Day X, streak, N task cards for today, a 7-day strip, and a button to a full month calendar for reaching any past day. No separate progress tab.

5. **Each day teaches 3 things (not 4 — this is subject-specific), ~10 minutes total:**
   - **Concept**: one explanation (bullet-point rules) + one fully worked example, for today's concept.
   - **Practice Problems**: a small seeded set of problems for that same concept (no answers shown) — "try it on paper."
   - **Solution Walkthrough**: the *same* problems, now with full step-by-step solutions and the answer.
   This 3-part split ("learn it / try it / check it") is the math-specific analogue of the Japanese app's 4-part split (character drill / vocab / grammar / sentences) — the number and shape of daily tasks should match what actually makes sense for the subject, not be copied literally.

6. **Difficulty must be strictly increasing — this is the single biggest structural difference from `learn_japanese`.** The Japanese app's vocab/grammar pools *cycle* (5 new words/day wrapping around a pool, grammar cycling N5→N4→N3→N2 repeatedly) because language content doesn't have one single correct difficulty ordering that must never repeat. Math is different: a concept must be taught *before* the concepts that depend on it, in a fixed, monotonically-increasing-difficulty sequence, and should not "cycle" back to easy material as if it were new. So `curriculum.js` here uses:
   - One **ordered, hand-authored array** (`concepts.js`) — difficulty strictly increasing by array position, never shuffled or cycled.
   - `CONCEPT_SPAN_DAYS = 3`: each concept is taught for 3 days in a row (learn → practice → practice again with fresh seeded problems), not "1 new concept/day" — this is what stretches a modest hand-authored concept list into many months of daily use.
   - Only *after* the entire ordered list has been taught once does the app enter **review mode** (cycling back through the same concepts with new seeded problem combinations) — analogous to the Japanese app's cycling pools, but only kicks in once as a fallback, not as the primary mechanism.
   - If you build a curriculum-shaped app for a subject with a real prerequisite chain (math, physics, programming, music theory), copy this ordered+span+review-fallback pattern. If the subject is more like vocabulary (many independent facts, no strict prerequisite order), the Japanese app's cycling-pool pattern is the better fit — pick based on whether the subject has hard dependencies.

7. **No separate "reference/browse corpus" split — everything is hand-authored.** The Japanese app deliberately split data into (a) a small hand-curated daily curriculum and (b) a large machine-fetched reference corpus (JMdict via Jisho API, Tatoeba sentences) pulled once via a `scripts/fetch-*.js` script, because JLPT vocab/sentence datasets exist publicly and bulk-fetching them is both feasible and gives real depth for a browsable dictionary tab. **Math doesn't have an equivalent low-effort public dataset to fetch** (no "JLPT word list" equivalent for "graded math problems with worked solutions" that's a trivial API call) — worked solutions specifically need to be authored, not just scraped as bare facts. So this app has no `scripts/` directory and no generated JSON; `concepts.js` and `problems.js` are both 100% hand-authored and are *both* the daily-curriculum data and the only browse-able reference (`ConceptLibrary.jsx`, the analogue of `VocabBook.jsx`/`KanaChart.jsx`). **Before assuming the Japanese app's fetch-a-corpus trick applies to a new subject, check whether a real public dataset with the needed depth (not just facts, but worked reasoning) actually exists for that subject.**

8. **Be honest about scope, and expect to extend it across multiple sessions/rounds — don't try to hand-author everything in one shot.** This curriculum was built incrementally across this conversation: an initial ~60-concept version (arithmetic → Algebra I) was shipped first; the user then asked to cut the parts they already knew and extend "all the way through college," which turned into a second pass adding Geometry, Algebra II, the rest of Precalculus, all of Calculus I, and Calculus II/intro college math (Taylor series, linear algebra basics, probability, statistics) — 74 concepts total by the end. Each concept needs an explanation + worked example + a bank of ~4 problems with full step-by-step solutions; this is genuinely time-consuming to author well, so ship a coherent, honestly-scoped slice first (with a comment noting what's deliberately not covered yet) rather than stub out a huge skeleton with weak content.

9. **Renumbering ids after adding/removing units: use a script, not manual retyping.** When units were removed (e.g. "the user already knows this, delete it") or reordered, concept `id`s and the matching keys in the separate problems-bank file had to shift consistently, and unit-header comments had to be renumbered too. Doing this by hand across 40+ entries is error-prone. The reliable approach used here: a small Node script that (a) slices out the removed block by locating its unit-comment markers as text anchors, (b) regex-replaces `id: N,` → `id: N-offset,` across the remainder, and (c) does the same key-shift on the problems file's `N: [` keys. Verify afterward with a one-liner that imports both modules and checks `concepts.length`, `id` sequentiality, and that every concept id has a matching problems-bank entry with the expected problem count.

10. **Daily practice volume is a tunable knob, not fixed.** `PROBLEMS_PER_DAY` in `curriculum.js` controls how many problems are drawn (via `seededShuffle`) from each concept's problem bank per day. It was doubled from 2 → 4 partway through on request — but that only works if every concept's problem bank actually has ≥4 problems to draw from (a seeded-shuffle `.slice(0, N)` silently degrades to fewer if the pool is smaller). **If you raise this knob, first verify every concept's bank has enough entries**, don't just change the constant.

11. **iOS PWA status-bar overlap: pad with `env(safe-area-inset-*)`, don't fight it.** `apple-mobile-web-app-status-bar-style: black-translucent` (needed for the immersive, no-address-bar look) makes web content draw *underneath* the iPhone status bar/notch. Combined with `viewport-fit=cover`, any `position: sticky/fixed` header or bottom nav needs explicit `padding-top: env(safe-area-inset-top)` / `padding-bottom: env(safe-area-inset-bottom)` or its controls land under the clock/home-indicator and become unclickable. This is invisible in a normal desktop-browser check and only shows up on an actual installed iOS PWA — **if the user reports a control being unreachable specifically after installing to the home screen, suspect this first.**

12. **No fluff copy, minimal chrome.** Same as the Japanese app — no motivational taglines, no redundant progress tab.

13. **Tap-to-hear pronunciation doesn't apply here** (no equivalent need for a math app) — don't cargo-cult every Japanese-app feature; only port the ones that make sense for the new subject.

---

## 3. Architecture

Plain Vite + React (no Next.js, no router — a `useState` tab/screen switch in `App.jsx`), Tailwind CSS v4 via `@tailwindcss/vite`. No backend, no database.

```
math-app/
  index.html                 # PWA meta tags, apple-mobile-web-app-*, manifest link, viewport-fit=cover
  public/manifest.json       # PWA manifest
  public/icon.svg, icon-192.png, icon-512.png   # generated via `sharp` from icon.svg (no design tool needed)
  vite.config.js             # react() + tailwindcss() plugins only
  src/
    main.jsx
    App.jsx                  # root: profile gate (ProfileSetup) + MainApp (tab shell, bottom nav, safe-area padding)
    data/
      concepts.js              # THE ordered curriculum — 74 hand-authored concepts, strictly increasing difficulty,
                                #   grouped into unit comments (Coordinate Plane & Solids → ... → Calculus II & Intro College Math)
                                #   each: { id, unit, level, title, explain: [bullets], example: {problem, steps, answer} }
      problems.js               # problemsByConcept[id] = 4 hand-authored { q, steps, a } problems per concept
      curriculum.js             # day-number math (California tz) + getDayLesson(dayNum) assembly logic
    hooks/
      useDailyProgress.js      # localStorage read/write per profile name, streak calc, week-status calc
    components/
      Home.jsx                 # dashboard: Day X, streak, 3 task cards, 7-day strip, "open calendar" button
      CalendarView.jsx         # full month calendar modal, jump to any reachable past day
      DayTaskPicker.jsx        # small modal shown after picking a calendar day — choose which of the 3 tasks to open
      DailyLesson.jsx          # task-type switch: renders ConceptView / ProblemView / SolutionView for a given day
      ConceptLibrary.jsx        # browsable reference: all concepts grouped by unit, expand-to-view (analogue of VocabBook)
    utils/
      seededShuffle.js          # mulberry32-based deterministic shuffle, seeded by dayNum*1000 + conceptId
```

### Data model

Unlike the Japanese app, there is **no** curriculum/reference-corpus split (see §2.7). `concepts.js` + `problems.js` together are both the daily curriculum *and* the only browsable reference. Both are 100% hand-authored, no fetch scripts, no generated JSON.

- `concepts.js`: ordered array, id = array position + 1, strictly increasing difficulty. Grouped into "unit" labels purely for display/comment organization — the app logic doesn't care about unit boundaries, only array order.
- `problems.js`: `problemsByConcept[conceptId]` → array of `{ q, steps, a }`. Currently 4 per concept (see §2.10 on why this number matters).

### Progress/state model

- `localStorage["math_profile"]` — current user's chosen display name (no auth).
- `localStorage["math_daily_<profileName>"]` — `{ "YYYY-MM-DD": { concept: true, problem: true, solution: true } }`.
- Day number and calendar date are always derived from a fixed `START` date + California-timezone "today" (`getCaliforniaToday()`/`getDayNumber()` in `curriculum.js`), never stored directly.

### Curriculum generation logic (`getDayLesson(dayNum)` in `curriculum.js`)

```
CONCEPT_SPAN_DAYS = 3        // each concept is taught for 3 days in a row
TOTAL_NEW_DAYS = concepts.length * CONCEPT_SPAN_DAYS
PROBLEMS_PER_DAY = 4         // seeded-shuffled draw from that concept's problem bank

conceptIndex =
  dayNum <= TOTAL_NEW_DAYS
    ? floor((dayNum - 1) / CONCEPT_SPAN_DAYS)             // strictly sequential
    : (dayNum - TOTAL_NEW_DAYS - 1) % concepts.length     // review mode: cycle, once the list is exhausted
```

`isReview` flag is exposed to the UI so the home header can show "Review" instead of the unit name once past `TOTAL_NEW_DAYS`.

---

## 4. Iteration history (what actually changed, round by round)

Useful context for judging which decisions are "final" vs. still in flux:

1. **v1**: ~60 concepts, elementary arithmetic → Algebra I, 2 problems/day, no profile screen (single implicit user).
2. Added name-based profiles (copying the Japanese app pattern) after the user asked "can we do the same per-person tracking as the Japanese app?"
3. Removed the 18 Elementary-level concepts (too easy to be worth a full day each), added 18 new concepts of equal count (Geometry, Algebra II, start of Precalculus) to keep the total at 60 but push the ceiling further — and doubled daily problems 2→4 (required adding a 4th problem to every existing concept's bank first).
4. Removed two more units the user already knew (Negative Numbers & Exponents, Expressions & Equations — both Middle School), and in the same pass filled out the **entire rest of the roadmap through intro college math**: remaining Precalculus (trig identities, inverse trig, law of sines/cosines, vectors, matrices, conics, limits, continuity), all of Calculus I, and Calculus II/intro college math (integration by parts, series, Taylor series, linear systems, determinants, eigenvalues, probability, statistics) — landing at 74 concepts.
5. Fixed an iOS PWA-specific bug: the back button was unreachable under the iPhone status bar in the installed home-screen app (see §2.11).

**Pattern to notice**: scope grew by *removing* known/low-value content and *reinvesting* that budget into new content at the frontier, rather than just appending forever. When a user says "I already know X," the right move is deleting X and renumbering, not leaving it in as dead weight.

---

## 5. How to replicate this for a different subject

If you're Claude reading this from a new repo for a different subject:

1. Read `learn_japanese.md` first (in the `learn_japanese` repo) for the base philosophy — PWA choice, no-backend multi-profile pattern, day-number dashboard, full-history calendar, minimal chrome. That doc is the foundation; this one only documents where a *second* subject (math) diverged from it and why.
2. **Decide early: does this subject have a strict prerequisite chain, or is it more like independent facts?** If there's a real dependency order (math, chemistry, programming, music theory, chess openings), use this app's ordered-array + `CONCEPT_SPAN_DAYS` + review-fallback pattern (§2.6). If it's closer to vocabulary/independent facts, use the Japanese app's cycling-pool pattern instead.
3. **Check whether a real public dataset exists for the "depth" content** before assuming you can split data into hand-curated-curriculum + fetched-reference-corpus like the Japanese app did. If the subject needs authored *reasoning* (worked solutions, explanations) rather than bare facts (word lists), you likely can't offload that to a bulk API fetch — budget for hand-authoring it incrementally across sessions (see §2.8), and say so honestly rather than promising thousands of entries up front.
4. **Default to the name-based profile pattern from the start**, even if the initial ask is "just for me" — it's cheap, and users tend to ask for it later once they remember it exists in the sibling app.
5. Pin "today" to the timezone the actual user lives in, from day one (don't repeat the Japanese app's off-by-one bug).
6. If it's a PWA installed to an iOS home screen, proactively add `env(safe-area-inset-top/bottom)` padding to sticky headers/footers rather than waiting for a bug report (§2.11).
7. Design the "N tasks per day" shape around what's actually pedagogically right for the subject — don't assume it's 3 or 4 just because the two existing sibling apps happen to use those numbers.
8. Go read the actual code in this repo (`learn_math`, `math-app/` subdirectory) for concrete patterns — this doc is a summary; the code is the source of truth for exact implementation (e.g. how `seededShuffle` is seeded, how the id-renumbering script works, how `getDayLesson` splits sequential-vs-review mode).

---

## 6. Known rough edges (don't silently "fix" without asking — but worth knowing about)

- No automated tests — verification so far has been manual (build + Playwright-driven headless-browser smoke checks per change, not a checked-in test suite).
- `problems.js` and `concepts.js` are large hand-authored files with no lint/validation step beyond the ad hoc `node -e "import(...)..."` sanity checks used during development (concept count, id sequentiality, problems-per-concept count). Worth turning into a real `scripts/validate-curriculum.mjs` if this keeps growing.
- Review mode (past `TOTAL_NEW_DAYS`) reuses the same 4-problem banks with a different seeded subset — there's no mechanism yet for surfacing genuinely new problems during long-term review beyond re-combining the existing bank.
- Deploy is manual (`npx vercel` / `npx vercel --prod` from `math-app/`) — no CI/CD.
