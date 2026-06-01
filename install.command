#!/bin/bash
# ============================================
# Sermon Note Clipper - One-Time Setup
# Double-click this file to install everything
# ============================================

cd "$(dirname "$0")"
clear

echo "============================================"
echo "  Sermon Note Clipper - Installation"
echo "============================================"
echo ""

# Check for Homebrew
if ! command -v brew &> /dev/null; then
    echo "Installing Homebrew (macOS package manager)..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Add brew to path for Apple Silicon
    if [ -f /opt/homebrew/bin/brew ]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
else
    echo "Homebrew found."
fi

# Install FFmpeg (required for video processing)
if ! command -v ffmpeg &> /dev/null; then
    echo ""
    echo "Installing FFmpeg (video processing)..."
    brew install ffmpeg
else
    echo "FFmpeg found."
fi

# Install Python 3.11+ if not present
if ! command -v python3 &> /dev/null; then
    echo ""
    echo "Installing Python 3..."
    brew install python@3.11
else
    echo "Python 3 found: $(python3 --version)"
fi

# Install Node.js (for the dashboard frontend)
if ! command -v node &> /dev/null; then
    echo ""
    echo "Installing Node.js (for the web dashboard)..."
    brew install node
else
    echo "Node.js found: $(node --version)"
fi

echo ""
echo "Setting up Python virtual environment..."

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip --quiet

# Install Python dependencies
echo "Installing Python packages (this may take a few minutes)..."
pip install -r requirements.txt --quiet

echo ""
echo "Setting up web dashboard..."
cd dashboard
npm install --silent 2>/dev/null
cd ..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "Creating .env file..."
    cp .env.example .env 2>/dev/null || touch .env
fi

echo ""
echo "============================================"
echo "  Installation Complete!"
echo "============================================"
echo ""
echo "NEXT STEPS:"
echo ""
echo "1. Get a FREE Gemini API key:"
echo "   https://aistudio.google.com/app/apikey"
echo ""
echo "2. Double-click 'Start Sermon Clipper.command'"
echo "   to launch the app"
echo ""
echo "3. Open http://localhost:5175 in your browser"
echo "   and paste your API key in Settings"
echo ""
echo "============================================"
echo ""
echo "Press any key to close this window..."
read -n 1
