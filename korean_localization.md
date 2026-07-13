# Korean language support — parked idea (not started)

**Status:** idea only, nothing implemented yet. This doc exists so a future Claude session can pick this up cold without re-deriving context.

## The ask

User (based in California, but Korean-speaking) wants the app to support Korean in addition to English. Proposed UX: on the name-entry screen (`ProfileSetup` in `math-app/src/App.jsx`), let the user pick a language via flag — 🇬🇧 (English) or 🇰🇷 (Korean) — similar to how the name is entered today.

Confirmed requirement: this must **also work for people already using the app**, not just new profiles created after this feature ships. Language choice should be an editable setting, not a one-time onboarding lock-in.

## Current state (as of 2026-07-12)

- Plain React 19 + Vite SPA, no i18n library installed (no i18next/react-intl/etc. — see `package.json`).
- All user-facing strings are hardcoded English JSX literals, scattered across every component (`App.jsx`, `Home.jsx`, `CalendarView.jsx`, `DayTaskPicker.jsx`, `DailyLesson.jsx`, `ConceptLibrary.jsx`, and whatever renders concept/problem/solution views). No central strings file exists.
- `ProfileSetup` (`App.jsx`, roughly lines 24-66) is just a name `<input>` + "Start →" button. No language/country/flag picker anywhere in the codebase today.
- Profile/progress storage: `localStorage["math_profile"]` = current name; `localStorage["math_daily_<name>"]` = per-day task completion. See `math_app.md` §3 "Progress/state model" for the full model.

## Key scope decision to make before starting (ask the user first)

There are two very different sizes of project hiding under "Korean support":

1. **UI chrome only** (buttons, headers, tab labels, empty states, "Start →", task labels, etc.) — translate the *app shell*, but concept explanations / worked examples / practice problems stay in English. Small-ish: extract maybe a few dozen strings into a `strings.js` dict keyed by language, add a lookup helper, swap literals for lookups.
2. **Full content translation** — also translate all 74 concepts' explanations + worked examples, and every problem/solution in `problems.js` (4 problems × 74 concepts = ~300 problems). This is a large hand-authoring effort, same order of magnitude as authoring the curriculum itself (see `math_app.md` §2.8 on how long the original English curriculum took to write).

**Do not assume which scope the user wants — ask explicitly when this is picked up.** Given the app's own philosophy of "be honest about scope, ship incrementally" (`math_app.md` §2.8), the likely right move is to ship (1) first as a real, complete feature, then treat (2) as a separate, much bigger follow-on decision.

## Sketch of an implementation approach (chrome-only scope)

- Add a new storage key, e.g. `localStorage["math_lang"]` (or a per-profile key, `localStorage["math_lang_<name>"]`, if different people sharing the same link/device might want different languages — decide based on whether this app is actually shared, per `math_app.md` §2.2).
- Build one small reusable `LanguagePicker` component (two flag buttons, 🇬🇧/🇰🇷) and use it in two places:
  - `ProfileSetup` (first-time onboarding), so new profiles pick a language up front.
  - Some existing-user-reachable settings surface — there isn't a settings screen today, so this likely means adding a small "change language" affordance somewhere already visible (e.g. near the profile name on `Home.jsx`), not just at signup. This is the part that satisfies "existing users too."
- No need for a heavy library like `react-i18next` at this app's size — a flat `strings.js` object (`{ en: {...}, ko: {...} }`) with a `t(key)` helper reading the stored language is consistent with this app's "no unnecessary dependencies" style (see `math_app.md` §2 overall philosophy: minimal chrome, no fluff).
- Flags-for-languages is a known imprecise pattern (a flag represents a country, not a language — English isn't only spoken in the UK) but this is a personal/small-shared app where the user explicitly asked for exactly this pattern, so it's fine to use as-is rather than over-engineering a "language name" selector instead.

## Next step when this is picked up

1. Re-confirm scope with the user (chrome-only vs. full content translation) — do not start authoring Korean content without this.
2. If chrome-only: inventory every hardcoded string across the components listed above, build `strings.js` + `t()` helper, add `LanguagePicker` to `ProfileSetup` and to a new/existing settings surface reachable by existing users, wire `Home.jsx` etc. to read the stored language.
3. Verify manually (this repo has no automated test suite — see `math_app.md` §6) that switching language actually re-renders all screens, and that an existing profile with no `math_lang` key yet defaults sensibly (English) rather than crashing.
