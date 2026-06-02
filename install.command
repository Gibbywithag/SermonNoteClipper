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

# ---------------------------------------------------------------------------
# Pick a Python that (a) is version 3.10-3.12 (the AI libraries ship wheels for
# those) and (b) has working XML support. Some macOS Homebrew Python builds ship
# a broken `pyexpat`, so we test for it and, if nothing works, set up a private
# Python 3.12 via Miniconda in your home folder (no admin password required).
# ---------------------------------------------------------------------------
CONDA_DIR="$HOME/miniconda3"

python_is_good() {
    # $1 = path to a python interpreter; returns 0 if it's usable here.
    [ -n "$1" ] && [ -x "$1" ] || return 1
    "$1" - <<'PYEOF' >/dev/null 2>&1
import sys
maj, minr = sys.version_info[:2]
assert maj == 3 and 10 <= minr <= 12       # AI libs need Python 3.10-3.12
import xml.parsers.expat                    # must not be the broken pyexpat
PYEOF
}

find_python() {
    # Echo the first usable interpreter found, or nothing.
    for c in \
        "$CONDA_DIR/envs/py312/bin/python" \
        "$(command -v python3.12)" \
        "$(command -v python3.11)" \
        "$(command -v python3.10)" \
        "$(command -v python3)"; do
        if python_is_good "$c"; then echo "$c"; return 0; fi
    done
    return 1
}

PYTHON_BIN="$(find_python)"

if [ -z "$PYTHON_BIN" ]; then
    echo "No compatible Python found. Setting up a private Python 3.12 via Miniconda..."
    if [ ! -x "$CONDA_DIR/bin/conda" ]; then
        ARCH="$(uname -m)"   # arm64 (Apple Silicon) or x86_64 (Intel)
        curl -fsSL "https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-${ARCH}.sh" -o /tmp/miniconda.sh
        bash /tmp/miniconda.sh -b -p "$CONDA_DIR"
    fi
    # conda-forge avoids the Anaconda default-channel Terms-of-Service prompt.
    "$CONDA_DIR/bin/conda" create -y -n py312 -c conda-forge --override-channels python=3.12
    PYTHON_BIN="$CONDA_DIR/envs/py312/bin/python"
fi

if ! python_is_good "$PYTHON_BIN"; then
    echo "ERROR: could not set up a working Python."
    echo "Install Python 3.12 from https://www.python.org/downloads/ and run this again."
    echo ""
    echo "Press any key to close..."
    read -n 1
    exit 1
fi

echo "Using Python: $("$PYTHON_BIN" --version 2>&1)"

# Create the virtual environment (reuse an existing good one; otherwise rebuild)
if [ -d venv ] && python_is_good "venv/bin/python"; then
    echo "Existing virtual environment looks good, reusing it."
else
    rm -rf venv
    "$PYTHON_BIN" -m venv venv
fi
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
