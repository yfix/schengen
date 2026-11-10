#!/bin/sh
set -eu

stamp=node_modules/.lock.sha
want=$(sha1sum package-lock.json | cut -d' ' -f1)
if [ "$(cat "$stamp" 2>/dev/null)" != "$want" ]; then
  npm ci --no-audit
  echo "$want" > "$stamp"
fi

exec "$@"
