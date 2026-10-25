# Schengen calculator — review & roadmap

Oct 25, 2026 · @Yuri

Starting point (upstream code @ e1c4697): CRA (react-scripts 5), React 16, plain JS + JSDoc types, localStorage, gh-pages. ~600 LOC, zero tests.

## Bugs

| #   | File                              | Issue                                                                                                                                                                        | Severity            | Fixed in                   |
| --- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | -------------------------- |
| B1  | settings.js, collectDays.js       | Hardcoded personal trips (`strDateRanges`) shipped to every visitor; set `selected` on `originalDays`, never in storage → cannot be deselected (`markWithSelect` only adds). | High                |                            |
| B2  | settings.js                       | `new Date('2025-07-21')` parses as UTC → off-by-one west of UTC. `date180DaysAgo` carries time-of-day, mismatches `cleanOutdatedDates`. Leftover `console.log`.              | Med                 |                            |
| B3  | useSchengenDays.js (filter block) | `days[i + ii]` unguarded → TypeError when ≥90 selected days fall in the last 179 rendered days.                                                                              | High (crash)        |                            |
| B4  | Calendar.jsx                      | Selected day with `available < 1` (over-limit) is unclickable → can't deselect to fix an overstay.                                                                           | Med                 |                            |
| B5  | Calendar.jsx                      | `key={...+Math.random()}` remounts every cell each render.                                                                                                                   | Med                 | PR1                        |
| B6  | Summary.jsx                       | Counts ALL selected days (past + future plans), not the current window. Hidden on mobile.                                                                                    | High (wrong output) |                            |
| B7  | cleanOutdatedDates.js             | Keeps `today-180` (181 days); window is `today-179..today`. Runs only on mount.                                                                                              | Low                 |                            |
| B8  | useSchengenDays.js                | `originalDays` built at module load → stale after midnight. `useState`+`useEffect` for derived data → flash + extra render.                                                  | Med                 | PR1 (memo), stale day open |
| B9  | queryParams.js                    | No decode, no validation; `?range=abc` → NaN everywhere.                                                                                                                     | Low                 |                            |
| B10 | storage.js                        | `JSON.parse` / localStorage access unguarded (private mode, quota).                                                                                                          | Low                 |                            |
| B11 | useSchengenDays.js                | "+N" extension loop is a heuristic, not a simulation; correctness unverified.                                                                                                | High (trust)        |                            |

## Quality

- [x] Two lockfiles → npm only (PR1)
- [x] CRA → Vite, React 19, `createRoot`, StrictMode (PR1)
- [x] Vitest + Testing Library, ESLint flat + Prettier, CI (PR1)
- [x] Manifest/meta defaults, dead service worker (PR1)
- [ ] Engine entangled with the React hook; no calculation tests
- [ ] a11y: div+onClick, no keyboard, no roles/labels, no weekday header; color-only state

## Roadmap

### Phase 0 — Tooling ✅ PR1

Vite 8 + React 19, TypeScript strict for new code (legacy JS allowed until rewritten), Vitest, ESLint, Prettier, GitHub Actions CI (typecheck, lint, test, build, Playwright smoke), devcontainer, Claude workflow (`CLAUDE.md`, `.claude/` agents + skills).
Deviation: deploy stays on `npm run deploy` → `gh-pages` branch (that's what Pages serves today). `public/CNAME` (`schengen.me.st`, upstream's domain) removed so a deploy can't claim it.

### Phase 1 — Engine rewrite

- Days as integer ordinals (days since epoch, from local Y/M/D via `Date.UTC`) → no TZ issues, `Set` lookups; storage as ISO `YYYY-MM-DD`.
- Pure `src/engine/`:
  - `windowCount(d)` via prefix sums: used days in `[d-179, d]`.
  - `remainingAt(d) = max - windowCount(d)`.
  - `maxStayFrom(d)`: simulate a consecutive stay.
  - `violations()`: days where windowCount > max.
  - `nextFreeDate()`: when the next day frees up.
- Tests: known cases, leap year, DST, range end, over-limit.
- Fixes B3, B6, B7, B11.

### Phase 2 — State

- `useSyncExternalStore` store: `Set<string>` persisted, versioned key + migration from the old `{year,month,date}` format, guarded storage (B10).
- `today` from a hook that updates at local midnight + `visibilitychange` (B8).
- Remove hardcoded ranges; add an **import ranges** UI (paste `YYYY-MM-DD YYYY-MM-DD` lines) (B1, B2).
- `URLSearchParams` + validated params (B9).

### Phase 3 — Drag-select

- Pointer Events on the grid container; cells carry `data-ord`.
- `pointerdown` on a cell: anchor; mode = cell selected ? `remove` : `add`.
- `pointermove`: `document.elementFromPoint` → `data-ord`. Range = linear `[min(anchor,cur), max]` in calendar order.
- Preview: transient set rendered with a distinct style; summary/violations recompute live.
- `pointerup`: single commit (one storage write, one undo entry). `Esc` / `pointercancel` aborts.
- Touch: long-press 300 ms starts the drag; otherwise native scroll (`touch-action: pan-y`). Auto-scroll near the container edge.
- Shift+click = range from last clicked. Click without move = toggle.
- Replace the "disable days" model with "warn": any selection allowed, overstay days marked red (fixes B4).
- Cells memoized, stable keys.
- Tests: drag add/remove, reverse drag, cancel, shift-range.

### Phase 4 — Auto-suggested UX

- Summary also on mobile (sticky header): used in window, remaining today, max stay if entering today, next day that frees up, overstay warning.
- Hover/tap a day → tooltip: window count, remaining, max consecutive stay from there.
- Trip list (ranges derived from the selection): edit/delete, add by dates.
- Planner: "enter on X, how long can I stay?" / "earliest entry for N days".
- Undo/redo (Ctrl+Z / Ctrl+Shift+Z), clear all with confirm.
- Export/import JSON + share link (ranges in the URL hash).
- Weekday header, `Intl.DateTimeFormat` month names, dark mode.
- a11y: `role="grid"`, `gridcell`, `aria-selected`, roving tabindex, arrows/Space/Shift+arrows.
- PWA offline (`vite-plugin-pwa`).
- Optional: ICS export; reminder when the allowance resets.

### PR order

1. tooling + AI workflow → 2. engine + state + bugfixes → 3. drag-select → 4. UX batches. Each PR green CI.
