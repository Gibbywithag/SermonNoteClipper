#!/bin/bash
# ============================================
# Sermon Note Clipper — Start
# Double-click this file to launch the app (runs in Docker).
# ============================================

cd "$(dirname "$0")"
clear
echo "============================================"
echo "  Starting Sermon Note Clipper..."
echo "============================================"
echo ""

# A .env is required by docker-compose (it holds optional keys). Make sure one
# exists so startup never fails on a fresh machine.
[ -f .env ] || touch .env

# 1) Is Docker Desktop installed?
if ! command -v docker >/dev/null 2>&1 && [ ! -d "/Applications/Docker.app" ]; then
    echo "Docker Desktop isn't installed yet."
    echo ""
    echo "It's a free, one-time install:"
    echo "   https://www.docker.com/products/docker-desktop"
    echo ""
    echo "Install it, then double-click this file again."
    echo ""
    read -n 1 -s -r -p "Press any key to close..."
    exit 1
fi

# 2) Make sure Docker is running (start it if needed)
if ! docker info >/dev/null 2>&1; then
    echo "Starting Docker Desktop (this can take a minute the first time)..."
    open -a Docker 2>/dev/null
    printf "   waiting for Docker"
    for i in $(seq 1 90); do
        docker info >/dev/null 2>&1 && break
        printf "."
        sleep 2
    done
    echo ""
fi
if ! docker info >/dev/null 2>&1; then
    echo "Docker didn't start. Open Docker Desktop manually, then try again."
    read -n 1 -s -r -p "Press any key to close..."
    exit 1
fi

# 3) Build (first run only, several minutes) + start
echo "Starting the app — the FIRST run builds it and can take several minutes."
echo "(Later runs start in seconds.)"
docker compose up -d --build || {
    echo ""
    echo "Something went wrong starting the app. Logs:"
    docker compose logs --tail=30
    read -n 1 -s -r -p "Press any key to close..."
    exit 1
}

# 4) Wait for it to answer, then open the browser
printf "Getting it ready"
for i in $(seq 1 120); do
    curl -s http://127.0.0.1:8000/api/config >/dev/null 2>&1 && break
    printf "."
    sleep 1
done
echo ""

echo ""
echo "============================================"
echo "  Sermon Note Clipper is running!"
echo "============================================"
echo ""
echo "  It just opened in your browser:"
echo "     http://localhost:8000"
echo ""
echo "  To stop it: double-click 'Stop Sermon Clipper.command'"
echo "  (You can close this window — the app keeps running.)"
echo "============================================"
open "http://localhost:8000" 2>/dev/null
