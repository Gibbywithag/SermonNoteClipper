#!/bin/bash
# ============================================
# Sermon Note Clipper - Start App
# Double-click this file to launch
# ============================================

cd "$(dirname "$0")"
clear

echo "============================================"
echo "  Starting Sermon Note Clipper..."
echo "============================================"
echo ""

# Add Homebrew to path (Apple Silicon)
if [ -f /opt/homebrew/bin/brew ]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "ERROR: Virtual environment not found."
    echo "Please run 'install.command' first."
    echo ""
    echo "Press any key to close..."
    read -n 1
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check for FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "ERROR: FFmpeg not found. Please run 'install.command' first."
    echo ""
    echo "Press any key to close..."
    read -n 1
    exit 1
fi

# Create required directories
mkdir -p uploads output

# Cleanup function
cleanup() {
    echo ""
    echo "Shutting down..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup EXIT INT TERM

# Start the backend API server (FastAPI with uvicorn)
# Bind to localhost only — this is a personal/local app and the API is
# unauthenticated. Binding 0.0.0.0 would expose it to your whole network.
echo "Starting backend server on port 8000..."
uvicorn app:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 2

# Start the frontend dashboard
echo "Starting web dashboard on port 5175..."
cd dashboard
npx vite --host &
FRONTEND_PID=$!
cd ..

# Wait a moment for servers to start
sleep 3

echo ""
echo "============================================"
echo "  Sermon Note Clipper is running!"
echo "============================================"
echo ""
echo "  Open in your browser:"
echo "  http://localhost:5175"
echo ""
echo "  First time? Go to Settings and paste"
echo "  your Gemini API key."
echo ""
echo "  Close this window to stop the app."
echo "============================================"
echo ""

# Open browser automatically
open "http://localhost:5175" 2>/dev/null

# Keep running until window is closed
wait
