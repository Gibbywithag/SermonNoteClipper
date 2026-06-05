#!/bin/bash
# ============================================================================
# Portable launcher for "Sermon Clipper.app".
# Lives in the project folder and derives the project path from its OWN location,
# so it works on ANY Mac, any username, wherever the folder is copied.
# Starts Docker (and Docker Desktop if needed), then opens the app as a clean,
# standalone window. No Terminal, no hardcoded paths.
# ============================================================================
PROJECT="$(cd "$(dirname "$0")" && pwd)"
URL="http://127.0.0.1:8000"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PROFILE="$HOME/Library/Application Support/SermonClipper"

note() { /usr/bin/osascript -e "display notification \"$1\" with title \"Sermon Note Clipper\"" >/dev/null 2>&1; }
say()  { /usr/bin/osascript -e "display dialog \"$1\" buttons {\"OK\"} default button \"OK\" with title \"Sermon Note Clipper\"" >/dev/null 2>&1; }

# Finder-launched apps get a minimal PATH, so locate docker explicitly.
DOCKER=""
for d in /usr/local/bin/docker /opt/homebrew/bin/docker /usr/bin/docker; do
  [ -x "$d" ] && DOCKER="$d" && break
done
[ -z "$DOCKER" ] && command -v docker >/dev/null 2>&1 && DOCKER="$(command -v docker)"

if [ -z "$DOCKER" ]; then
  say "Docker Desktop isn’t installed yet. It’s a free, one-time install — I’ll open the download page. Install it, then open Sermon Clipper again."
  /usr/bin/open "https://www.docker.com/products/docker-desktop"
  exit 1
fi

note "Starting…"

# 1) Make sure Docker Desktop is running.
if ! "$DOCKER" info >/dev/null 2>&1; then
  /usr/bin/open -a Docker
  for i in $(seq 1 60); do "$DOCKER" info >/dev/null 2>&1 && break; sleep 2; done
fi
if ! "$DOCKER" info >/dev/null 2>&1; then
  say "Couldn’t start Docker Desktop. Open it manually, wait for it to finish starting, then open Sermon Clipper again."
  exit 1
fi

# 2) Start the app engine (first run builds the image — can take several minutes).
cd "$PROJECT" || { say "Could not find the app folder."; exit 1; }
[ -f .env ] || touch .env
"$DOCKER" compose up -d >/dev/null 2>&1 || {
  say "Something went wrong starting the app. Make sure Docker Desktop is running and try again."
  exit 1
}

# 3) Wait for the backend (allow up to ~10 min for the first-run build).
note "Getting things ready… (first run can take a few minutes)"
for i in $(seq 1 600); do /usr/bin/curl -s "$URL/api/config" >/dev/null 2>&1 && break; sleep 1; done

# 4) Open as a standalone, chromeless app window (isolated Chrome profile).
if [ -x "$CHROME" ]; then
  /usr/bin/open -na "Google Chrome" --args \
    --app="$URL" \
    --user-data-dir="$PROFILE" \
    --window-size=1180,1000 \
    --no-first-run --no-default-browser-check
else
  /usr/bin/open "$URL"
fi
note "Ready."
