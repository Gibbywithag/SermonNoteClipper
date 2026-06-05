#!/bin/bash
# ============================================================================
# Sermon Note Clipper — One-time setup. Double-click this ONCE.
# It installs Docker (if needed), builds the app, and opens it. After this,
# just double-click "Sermon Clipper.app" to run it any time.
# ============================================================================
cd "$(dirname "$0")" || exit 1
clear
URL="http://127.0.0.1:8000"

# Clear the macOS "downloaded from the internet" quarantine flag on this whole
# folder, so the app and its files stop triggering the "unverified developer /
# malware" warning after this first run. (This first run already got past it.)
xattr -dr com.apple.quarantine "$PWD" 2>/dev/null

echo "============================================================"
echo "   Sermon Note Clipper — One-Time Setup"
echo "============================================================"
echo ""
echo "   This sets everything up for you automatically."
echo "   The FIRST run can take 10-20 minutes (it downloads and"
echo "   builds the app). You only do this once. Grab a coffee."
echo ""

find_docker() {
  for d in /usr/local/bin/docker /opt/homebrew/bin/docker /usr/bin/docker; do
    [ -x "$d" ] && { echo "$d"; return; }
  done
  command -v docker 2>/dev/null
}
DOCKER="$(find_docker)"

# ---- 1) Install Docker Desktop if it's missing -----------------------------
if [ -z "$DOCKER" ] && [ ! -d "/Applications/Docker.app" ]; then
  echo "▶  Docker Desktop isn't installed yet — installing it for you..."
  ARCH="$(uname -m)"
  if [ "$ARCH" = "arm64" ]; then
    DMG="https://desktop.docker.com/mac/main/arm64/Docker.dmg"
  else
    DMG="https://desktop.docker.com/mac/main/amd64/Docker.dmg"
  fi
  echo "   Downloading Docker Desktop (about 600 MB — this part takes a while)..."
  if ! curl -L --fail -o /tmp/SC_Docker.dmg "$DMG"; then
    echo "   ✗ Couldn't download Docker. Opening the download page so you can"
    echo "     install it by hand, then run this installer again."
    open "https://www.docker.com/products/docker-desktop"
    read -n 1 -s -r -p "Press any key to close..."; exit 1
  fi
  echo "   Installing Docker (a password box will pop up — that's your Mac password)..."
  hdiutil attach /tmp/SC_Docker.dmg -nobrowse -quiet
  osascript -e 'do shell script "/Volumes/Docker/Docker.app/Contents/MacOS/install --accept-license" with administrator privileges' || {
    echo "   ✗ Docker install didn't finish. Open the download page to install it"
    echo "     manually, then run this installer again."
    hdiutil detach /Volumes/Docker -quiet 2>/dev/null
    open "https://www.docker.com/products/docker-desktop"
    read -n 1 -s -r -p "Press any key to close..."; exit 1
  }
  hdiutil detach /Volumes/Docker -quiet 2>/dev/null
  rm -f /tmp/SC_Docker.dmg
  echo "   ✓ Docker installed."
fi
[ -z "$DOCKER" ] && DOCKER="$(find_docker)"
[ -z "$DOCKER" ] && DOCKER="/usr/local/bin/docker"

# ---- 2) Start Docker and wait for it ---------------------------------------
echo ""
echo "▶  Starting Docker..."
open -a Docker 2>/dev/null
printf "   waiting for Docker to be ready"
for i in $(seq 1 90); do "$DOCKER" info >/dev/null 2>&1 && break; printf "."; sleep 2; done
echo ""
if ! "$DOCKER" info >/dev/null 2>&1; then
  echo "   ✗ Docker didn't finish starting. Open 'Docker Desktop' from your"
  echo "     Applications, wait until it says it's running, then run this again."
  read -n 1 -s -r -p "Press any key to close..."; exit 1
fi
echo "   ✓ Docker is running."

# ---- 3) Build + start the app ----------------------------------------------
echo ""
echo "▶  Building the app — this is the long part (first time only)..."
[ -f .env ] || touch .env
if ! "$DOCKER" compose up -d --build; then
  echo "   ✗ The build didn't finish. Check your internet connection and run"
  echo "     this installer again."
  read -n 1 -s -r -p "Press any key to close..."; exit 1
fi

# ---- 4) Wait for it to answer, then open it --------------------------------
printf "▶  Almost there"
for i in $(seq 1 180); do curl -s "$URL/api/config" >/dev/null 2>&1 && break; printf "."; sleep 1; done
echo ""

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PROFILE="$HOME/Library/Application Support/SermonClipper"
if [ -x "$CHROME" ]; then
  open -na "Google Chrome" --args --app="$URL" \
    --user-data-dir="$PROFILE" --window-size=1180,1000 \
    --no-first-run --no-default-browser-check
else
  open "$URL"
fi

echo ""
echo "============================================================"
echo "   ✅  All set — Sermon Note Clipper is open!"
echo ""
echo "   From now on you DON'T need this installer. Just"
echo "   double-click  \"Sermon Clipper.app\"  to open it."
echo "   (Tip: drag that app onto your Dock for one-click access.)"
echo "============================================================"
echo ""
read -n 1 -s -r -p "Press any key to close this window..."
