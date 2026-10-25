# Progress log

Where the project stands, for the next person or AI session. Plans live in `docs/plans/`; working rules in `CLAUDE.md`.

## State (Oct 25, 2026)

- Toolchain: Vite 8, React 19, Vitest, ESLint, Prettier, CI on every PR (typecheck, lint, test, build, Playwright smoke desktop + mobile).
- App behavior unchanged from upstream: click a day to toggle it; "+N" shows how many more consecutive days fit; the counter shows all selected days.
- Calculation still in `src/useSchengenDays.js` (legacy JS); known bugs B1–B4, B6–B11 open (see `docs/plans/2026-10-25-review-and-roadmap.md`).
- Deploy: `npm run deploy` (Yuri) → `gh-pages` branch → GitHub Pages.
- Next: PR2 engine rewrite + state + bugfixes, then drag-select.

## History

Every merged PR is a squash commit on `master` titled `<what> (#n)`:

```
git log --oneline master | grep '(#'
```

Before that: upstream `termosa/schengen.me.st` (2020) plus Yuri's initial date-range settings (2024–2025).
