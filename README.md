# Schengen 90/180 calendar

Mark the days you spent (or plan to spend) in the Schengen area and see how many days you have left under the 90-days-in-any-180 rule.

## Develop

Node runs in Docker only; no host Node, nvm or brew needed. Any Docker CLI works (OrbStack, Docker Desktop, Colima).

```sh
./run npm run dev                  # http://localhost:5173
./run npm run check                # test, typecheck, lint, build, smoke (headless Chromium)
./run npm run test:watch
./run npm install <pkg>            # updates package.json + package-lock.json on the host
./run                              # shell in the container
```

`./run` builds a `node:<.nvmrc>` image with Playwright Chromium matching `package-lock.json`, keeps `node_modules` in a Docker volume (Linux binaries, never on the host) and reruns `npm ci` whenever the lockfile changes. Reset: `docker compose down -v`.

Or open the repo in a devcontainer / Codespace.

URL params: `?range=180&max=90&repeat=4`.

## Deploy

Automatic: every push to `master` (i.e. a merged PR) runs CI and, if it passes, deploys `dist/` to GitHub Pages via `actions/deploy-pages`. Manual re-deploy: Actions → CI → Run workflow on `master`.

## Working with Claude

See `CLAUDE.md` (rules, verification ladder, code map), `docs/PROGRESS.md` and `docs/plans/`. Slash commands: `/check`, `/ship`, `/review-merge <n>`.
