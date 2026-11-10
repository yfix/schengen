# Progress log

Where the project stands, for the next person or AI session. Plans live in `docs/plans/`; working rules in `CLAUDE.md`.

## State (Nov 10, 2026)

- Toolchain: Node 24 LTS (`.nvmrc`, `engine-strict`), Vite 8, React 19, TypeScript 6 (strictest flags), Vitest + happy-dom with v8 coverage thresholds, ESLint 10 with type-aware typescript-eslint, Prettier, no deprecated packages, CI on every PR (typecheck, lint, tests under coverage gate, build, Playwright smoke desktop + mobile); workflows least-privilege (`contents: read`, no persisted checkout token); Dependabot weekly for npm + actions (grouped minor/patch).
- All TypeScript. Pure engine in `src/engine/` (ordinal days, prefix sums, brute-force-oracle test); selection store with v2 storage + legacy migration; bugs B1–B11 fixed (see `docs/plans/2026-10-25-review-and-roadmap.md`).
- UI: drag across days to mark or clear a range (long-press on touch, Shift+click extends, Esc cancels, live preview of the summary), undo/redo; click a day to toggle it (any day in the window, incl. overstay days); small number on future days = longest stay entering that day; overstay days red with an alert; summary (used, left, stay-until / earliest entry, planned) also on mobile; weekday header; scrolls to today; import trips (paste ranges) + clear all; trip list with edit/delete; JSON export/import and share link (`#t=` hash, confirm before adding); trip planner (stay from a date, earliest entry for N days); day tooltip shows days used in the window. Hardcoded personal trips removed.
- Deploy: automatic on push to `master` (CI `deploy` job after checks pass → `actions/deploy-pages`). Pages source must be "GitHub Actions".
- Local dev: Node only in Docker via `./run` (`compose.yaml`, `docker/`); no host Node.
- Perf: `stayFrom` for the whole calendar 33 ms → 5 ms (empty selection) via the `stay(d) ≥ stay(d−1) − 1` bound.
- Keyboard: calendar is a roving-tabindex grid (arrows, Space, Shift+arrows, Home/End, PageUp/PageDown), visible focus ring.
- Locale: week starts on the locale's first day (`?week=` overrides); month/day names via `Intl`. Dark mode follows the OS (`prefers-color-scheme`), colors are CSS variables.
- PWA: installable manifest, offline via `public/sw.js` (smoke checks an offline reload); strict CSP meta in the build.
- Next: ICS export.

## History

Every merged PR is a squash commit on `master` titled `<what> (#n)`:

```
git log --oneline master | grep '(#'
```

Before that: upstream `termosa/schengen.me.st` (2020) plus Yuri's initial date-range settings (2024–2025).
