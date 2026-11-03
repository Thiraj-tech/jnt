#!/bin/sh
# Run npm inside Node 24 so the Mac's own Node version doesn't matter.
# Usage: dev/npm.sh install | dev/npm.sh run build | dev/npm.sh run dev
cd "$(dirname "$0")/.." || exit 1
exec docker run --rm -it -v "$PWD:/app" -w /app -p 4321:4321 \
  -e SITE_BASE -e STAGING -e PUBLIC_TURNSTILE_SITE_KEY \
  node:24-alpine npm "$@"
