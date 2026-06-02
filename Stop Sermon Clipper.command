#!/bin/bash
# ============================================
# Sermon Note Clipper — Stop
# Double-click this file to stop the app.
# ============================================

cd "$(dirname "$0")"
clear
echo "Stopping Sermon Note Clipper..."
docker compose down
echo ""
echo "Stopped. Double-click 'Start Sermon Clipper.command' to run it again."
echo ""
read -n 1 -s -r -p "Press any key to close..."
