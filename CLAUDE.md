# Schengen calculator — working notes for Claude

Schengen 90/180 short-stay calculator: a scrolling calendar where the user marks days spent (or planned) in the Schengen area and sees how many days are left. React 19 + Vite 8 + Vitest, deployed to GitHub Pages (`gh-pages` branch). Solo dev (Yuri) + AI. Fork of `termosa/schengen.me.st` (remote `upstream`); default branch is **`master`**.

**Catch up here first:** `docs/PROGRESS.md` (where things stand; PR history = `git log --oneline master`) and `docs/plans/` (review findings + the roadmap with bug IDs B1–B11).

## Be cheap: token + effort rules

- **Search, then read a range.** `Grep` for the symbol, then `Read` with `offset`/`limit`. Never re-read a file you just edited.
- **Edit, don't rewrite.** `Edit` for changes; `Write` only for new files.
- **Trim command output.** Pipe long output through `| tail -n 20`; never paste build logs.
- **Verify with the cheapest check that proves the change** (ladder below).
- **Delegate mechanical work to cheap agents:** `/ship` (commit + push + PR) and `/check` (full ladder) run on Haiku in a forked context; `/review-merge` on Sonnet. Use the built-in `Explore` agent for wide searches.
- **Short replies.** Outcome in a few lines; no step-by-step recap. No code comments unless the why is non-obvious.
- **Ask Yuri before** product/UX decisions that are hard to undo; just do clear, reversible code work.

## Verification ladder (stop at the first rung that proves the change)

1. `npm test` — engine/logic changes. Calculation changes **must** come with a test case.
2. `npm run typecheck && npm run lint` — types, imports, hooks rules.
3. `npm run build` — bundling, assets, config.
4. `npm run smoke` (~5 s) — boots the built app in headless Chromium, clicks today, fails on any page/console error, writes `.smoke/desktop.png`. `--mobile` for a 390×844 touch viewport. Prints `skipped` when Chromium isn't installed (cloud sandbox blocks the Playwright CDN; CI installs it).
5. Look at `.smoke/*.png` — only when the change is visual.

`npm run check` = rungs 1–4.

## Commands

| Command                      | What                                                                      |
| ---------------------------- | ------------------------------------------------------------------------- |
| `npm run dev`                | Vite dev server on :5173                                                  |
| `npm run check`              | test + typecheck + lint + build + smoke                                   |
| `npm run test:watch`         | Vitest watch mode                                                         |
| `npm run deploy`             | build + push `dist/` to `gh-pages` (Yuri only; denied for agents)         |
| `?range=180&max=90&repeat=4` | URL params: window length, allowed days, how many windows ahead to render |

## Code map

- `src/useSchengenDays.js` — the availability calculation (sliding 180-day windows, "+N" per day). Being replaced by a pure engine (plan PR2).
- `src/collectDays.js` — builds the rendered day list (window before today, `repeat` windows after, padded to whole months).
- `src/useSelectedDates.js`, `useStorage.js`, `storage.js` — selection persisted in localStorage under `schengen/selectedDates`. **Any storage-shape change needs a versioned key + migration.**
- `src/settings.js` — URL params and constants. `src/queryParams.js` parses the query string.
- `src/Calendar.jsx` — the grid (Monday-first, month labels); `Summary.jsx` — the big counter (hidden < 640 px).
- `src/date.js`, `compareDates.js`, `findDate.js`, `today.js` — `{year, month, date}` date helpers (month is 0-based).
- `scripts/smoke.mjs` — Playwright smoke test.

## Conventions and gotchas

- The rule: on any day, the days spent in the window `[day − 179, day]` must be ≤ 90 (entry and exit days count). Defaults come from `settings.js`; never hardcode 90/180 elsewhere.
- Dates are local calendar days. Never parse `YYYY-MM-DD` with `new Date(str)` (that is UTC midnight → off-by-one west of UTC).
- New code goes in TypeScript (`strict`, `noUncheckedIndexedAccess`); legacy `.js/.jsx` is allowed until it's rewritten.
- Vite `base: './'` so the build works under `yfix.github.io/schengen/`.
- Branch per PR from `master`; never commit to `master`. PR description: what changed + how it was checked.
- **Keep the docs current, inside the same PR:** update the State section of `docs/PROGRESS.md` and the code map above when the picture changes; tick items in `docs/plans/` when built. A design doc written in chat gets saved as `docs/plans/YYYY-MM-DD-<topic>.md` in the next PR.
- **Autonomous flow (Yuri approved):** after `/ship` opens a PR, run `/review-merge <n>`, then `git checkout master && git pull --ff-only` and branch the next task. Stop and ask only when the reviewer reports BLOCKED or a decision is genuinely Yuri's.
- Dependent PRs: prefer merging before branching the next one; otherwise use `gh stack` (see the shipper agent).
- GitHub: if `gh pr create` fails (GraphQL blocked in some sandboxes), use `gh api repos/yfix/schengen/pulls -f title=… -f head=… -f base=master -F body=@file`.
- Cloud sandbox only: npm may need `npm_config_noproxy=localhost NO_PROXY=localhost no_proxy=localhost` for the smoke server; never `pkill -f` a pattern that matches your own shell.
