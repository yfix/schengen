# Schengen calculator — working notes for Claude

Schengen 90/180 short-stay calculator: a scrolling calendar where the user marks days spent (or planned) in the Schengen area and sees how many days are left. React 19 + Vite 8 + TypeScript 6 + Vitest (happy-dom) + ESLint 10 (type-aware `strictTypeChecked`), Node 24 LTS (`.nvmrc`; `engine-strict` rejects unsupported Node like 25), deployed to GitHub Pages (`gh-pages` branch). Solo dev (Yuri) + AI. Fork of `termosa/schengen.me.st` (remote `upstream`); default branch is **`master`**.

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
4. `npm run smoke` (~5 s) — boots the built app in headless Chromium, clicks today, drags 9 days with the mouse (desktop), fails on any page/console error, writes `.smoke/desktop.png`. `--mobile` for a 390×844 touch viewport. Prints `skipped` when Chromium isn't installed. Cloud sandbox (Playwright CDN blocked): `npm i --prefix /tmp/chr @sparticuz/chromium`, unpack once with `node -e "require('/tmp/chr/node_modules/@sparticuz/chromium').default.executablePath()"`, then `CHROMIUM_PATH=/tmp/chromium npm run smoke`.
5. Look at `.smoke/*.png` — only when the change is visual.

`npm run check` = rungs 1–4, with tests under coverage thresholds (95% statements/lines/functions, 90% branches; `npm run test:coverage`, HTML report in `coverage/`).

## Commands

| Command                      | What                                                                                          |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| `npm run dev`                | Vite dev server on :5173                                                                      |
| `npm run check`              | test + typecheck + lint + build + smoke                                                       |
| `npm run test:watch`         | Vitest watch mode                                                                             |
| `npm run deploy`             | build + `scripts/deploy.sh` force-pushes `dist/` to `gh-pages` (Yuri only; denied for agents) |
| `?range=180&max=90&repeat=4` | URL params: window length, allowed days, how many windows ahead to render                     |

## Code map

- `src/engine/dates.ts` — days as integer ordinals (`Ord`, days since epoch from local Y/M/D); `parseIso`/`toIso`, `localToday`. No `Date` math elsewhere.
- `src/engine/schengen.ts` — pure calculation: `analyze(selected, from, to, rules)` → `count(day)` (days in the window ending that day, prefix sums), `remaining`, `stayFrom(day)` (longest consecutive stay entering that day, binary search), `overstays`; `earliestEntry`, `visibleRange`. Tested against a brute-force oracle — keep that test passing.
- `src/engine/ranges.ts` — parses pasted trips (`YYYY-MM-DD YYYY-MM-DD` per line).
- `src/state/selection.ts` — external store (`useSyncExternalStore`) of selected `Ord`s, persisted as sorted ISO strings under `schengen/v2/days`; `migrate()` reads the legacy `schengen/selectedDates`. Syncs across tabs. **Any storage-shape change needs a new versioned key + migration + test.**
- `src/state/storage.ts` — guarded localStorage JSON helpers. `src/state/useToday.ts` — today that rolls over at local midnight.
- `src/settings.ts` — validated URL params → `{ window, max, windowsAhead }`.
- `src/App.tsx` — wires today + selection → `analyze` → `Summary` + `Calendar`; prunes days older than the window.
- `src/state/useDragSelect.ts` — pointer-event drag select: mouse drags at once (pointer capture), touch needs a 300 ms long-press (else the list scrolls), Shift+click extends from the last day, Esc cancels, auto-scroll near the edges. The preview set feeds `analyze` live; one store write per gesture. `applyRange` is the pure part.
- Undo/redo live in the selection store (`undo`, `redo`, `useHistory`); Ctrl/Cmd+Z, Ctrl+Shift+Z / Ctrl+Y.
- `src/Calendar.tsx` — Monday-first grid, weekday header, month labels, memoized `Day` cells with `data-ord`; small number = `stayFrom` for unselected future days; `Day-Over` red, `Day-Blocked` dimmed (still clickable: warn, don't block).
- `src/Summary.tsx` — used/left today, stay-until or earliest entry, planned days, overstay alert, import trips / clear all. Shown on mobile as a compact header.
- `scripts/smoke.mjs` — Playwright smoke test. `scripts/deploy.sh` — publish `dist/` to `gh-pages` (no npm dependency).
- Tests sit next to the code (`*.test.ts[x]`): engine (`dates`, `ranges`, `schengen` + oracle), `storage`, `selection` (migration, undo/redo, cross-tab), `useToday`, `useDragSelect`, `settings`, `format`, `Summary`, `App`.
- `src/test/renderApp.tsx` — shared test helper (`renderApp(store?)` → `{ store, cell(ord), … }`, `sorted`).

## Conventions and gotchas

- The rule: on any day, the days spent in the window `[day − 179, day]` must be ≤ 90 (entry and exit days count). Defaults come from `settings.ts`; never hardcode 90/180 elsewhere.
- Dates are local calendar days. Never parse `YYYY-MM-DD` with `new Date(str)` (that is UTC midnight → off-by-one west of UTC).
- TypeScript `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `verbatimModuleSyntax` + `erasableSyntaxOnly` (no enums/namespaces/parameter properties). Tests run with `TZ=America/Los_Angeles` to catch UTC-parsing bugs.
- Vite `base: './'` so the build works under `yfix.github.io/schengen/`.
- Branch per PR from `master`; never commit to `master`. PR description: what changed + how it was checked.
- **Keep the docs current, inside the same PR:** update the State section of `docs/PROGRESS.md` and the code map above when the picture changes; tick items in `docs/plans/` when built. A design doc written in chat gets saved as `docs/plans/YYYY-MM-DD-<topic>.md` in the next PR.
- **Merge flow (Yuri approved):** PRs are merged only through the separate reviewer: after `/ship` opens a PR, run `/review-merge <n>` (forked `reviewer` agent on Sonnet: waits for CI, reviews the diff against the blocker list, squash-merges, deletes the branch). Never merge from the main context. Then `git checkout master && git pull --ff-only` and branch the next task. For a stack, review-merge bottom-up. Stop and ask only when the reviewer reports BLOCKED or a decision is genuinely Yuri's.
- Dependent PRs: prefer merging before branching the next one; otherwise use `gh stack` (see the shipper agent).
- GitHub: if `gh pr create` fails (GraphQL blocked in some sandboxes), use `gh api repos/yfix/schengen/pulls -f title=… -f head=… -f base=master -F body=@file`.
- Cloud sandbox only: npm may need `npm_config_noproxy=localhost NO_PROXY=localhost no_proxy=localhost` for the smoke server; never `pkill -f` a pattern that matches your own shell.
