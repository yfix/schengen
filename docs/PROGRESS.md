# Progress log

Where the project stands, for the next person or AI session. Plans live in `docs/plans/`; working rules in `CLAUDE.md`.

## State (Oct 25, 2026)

- Toolchain: Node 24 LTS (`.nvmrc`, `engine-strict`), Vite 8, React 19, TypeScript 6 (strictest flags), Vitest + happy-dom with v8 coverage thresholds, ESLint 10 with type-aware typescript-eslint, Prettier, no deprecated packages, CI on every PR (typecheck, lint, test, build, Playwright smoke desktop + mobile).
- All TypeScript. Pure engine in `src/engine/` (ordinal days, prefix sums, brute-force-oracle test); selection store with v2 storage + legacy migration; bugs B1–B11 fixed (see `docs/plans/2026-10-25-review-and-roadmap.md`).
- UI: drag across days to mark or clear a range (long-press on touch, Shift+click extends, Esc cancels, live preview of the summary), undo/redo; click a day to toggle it (any day in the window, incl. overstay days); small number on future days = longest stay entering that day; overstay days red with an alert; summary (used, left, stay-until / earliest entry, planned) also on mobile; weekday header; scrolls to today; import trips (paste ranges) + clear all. Hardcoded personal trips removed.
- Deploy: `npm run deploy` (Yuri) → `gh-pages` branch → GitHub Pages.
- Next: the UX batch (phase 4): trip list, planner, keyboard/a11y, share link, PWA.

## History

Every merged PR is a squash commit on `master` titled `<what> (#n)`:

```
git log --oneline master | grep '(#'
```

Before that: upstream `termosa/schengen.me.st` (2020) plus Yuri's initial date-range settings (2024–2025).
