#!/bin/sh
set -eu

[ -f dist/index.html ] || { echo "dist missing: run npm run build" >&2; exit 1; }

remote=$(git remote get-url origin)
rev=$(git rev-parse --short HEAD)
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

cp -R dist/. "$tmp"
touch "$tmp/.nojekyll"
cd "$tmp"
git init -q -b gh-pages
git add -A
git -c user.name="$(git -C "$OLDPWD" config user.name || echo deploy)" \
    -c user.email="$(git -C "$OLDPWD" config user.email || echo deploy@localhost)" \
    commit -q -m "Deploy $rev"
git push -q --force "$remote" gh-pages
echo "deployed $rev to gh-pages"
