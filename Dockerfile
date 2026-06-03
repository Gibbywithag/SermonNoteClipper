# ─────────────────────────────────────────────────────────────────────
# Sermon Note Clipper — single-container image.
# The Python backend serves both the REST API and the built dashboard on
# one port (8000), so this image is the whole app.
# ─────────────────────────────────────────────────────────────────────

# ---- Stage 1: build the React dashboard into static files ----
FROM node:20-slim AS web
WORKDIR /web
COPY dashboard/package.json dashboard/package-lock.json* ./
RUN npm install
COPY dashboard/ ./
RUN npm run build          # → /web/dist (served by the backend at "/")

# ---- Stage 2: Python backend ----
FROM python:3.11-slim
WORKDIR /app

# System libraries the pipeline needs: ffmpeg (cut/encode), libGL + glib
# (OpenCV / MediaPipe).
RUN apt-get update && apt-get install -y --no-install-recommends \
        ffmpeg \
        libgl1 \
        libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies (cached layer — only re-runs when requirements change)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Pre-download the small YOLO model so the first job doesn't have to.
RUN python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')" || true

# Application code
COPY . .

# The built dashboard from stage 1 — the backend serves it at "/".
COPY --from=web /web/dist ./dashboard/dist

ENV PYTHONUNBUFFERED=1

# Liveness probe (uses python so we don't need curl in the slim image). Lets
# Docker restart a wedged backend instead of leaving it "up" but unresponsive.
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/config', timeout=4)" || exit 1

EXPOSE 8000
# Bind 0.0.0.0 INSIDE the container; docker-compose only publishes it to
# 127.0.0.1 on the host. app.py spawns main.py with sys.executable (this
# image's python), which has all the deps.
CMD ["python", "-u", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
