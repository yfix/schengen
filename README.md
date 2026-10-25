# Schengen 90/180 calendar

Mark the days you spent (or plan to spend) in the Schengen area and see how many days you have left under the 90-days-in-any-180 rule.

## Develop

```sh
nvm use                            # Node 24 LTS from .nvmrc (22.22+/24.15+/26+ also work)
npm install
npx playwright install chromium   # once, for the smoke test
npm run dev                        # http://localhost:5173
npm run check                      # test, typecheck, lint, build, smoke
```

Or open the repo in a devcontainer / Codespace.

URL params: `?range=180&max=90&repeat=4`.

## Deploy

`npm run deploy` builds and pushes `dist/` to the `gh-pages` branch.

## Working with Claude

See `CLAUDE.md` (rules, verification ladder, code map), `docs/PROGRESS.md` and `docs/plans/`. Slash commands: `/check`, `/ship`, `/review-merge <n>`.
