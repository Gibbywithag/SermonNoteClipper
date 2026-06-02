# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sermon Note Clipper is an AI-powered vertical video generator that turns full sermon recordings (YouTube links or local uploads) into 45-60 second clips (9:16 format) for Instagram Reels, TikTok, and YouTube Shorts. It uses Google Gemini (2.5 Flash by default, set via `GEMINI_MODEL`) for viral-moment detection and title generation.

It is a fork of [OpenShorts](https://github.com/mutonby/openshorts), rebranded and focused for church media teams. The upstream "SaaSShorts" AI-actor UGC generator and its `/api/saasshorts/*` endpoints, `saasshorts.py`, and the `SaaShortsTab`/`UGCGallery` frontend were **removed** — do not re-add them. The app is **local-first**: the launcher binds `127.0.0.1` and CORS is locked to localhost; the API is unauthenticated and must not be exposed to a network.

## Development Commands

### Local Development (Docker)
```bash
docker compose up --build   # Build and run full stack
```
- Backend: http://localhost:8000 (FastAPI/Uvicorn)
- Frontend: http://localhost:5175 (Vite proxies API calls to backend)

### Frontend Only (Dashboard)
```bash
cd dashboard
npm install
npm run dev       # Dev server with HMR (port 5173)
npm run build     # Production build
npm run lint      # ESLint (strict, --max-warnings 0)
```

### Backend Only
```bash
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

## Architecture

### Core Processing Pipeline
1. **Ingest** - YouTube download (yt-dlp) or local upload
2. **Transcription** - faster-whisper with word-level timestamps
3. **Scene Detection** - PySceneDetect for segment boundaries
4. **AI Analysis** - Gemini identifies 3-15 viral moments (15-60 sec each)
5. **FFmpeg Extraction** - Precise clip cutting
6. **AI Cropping** - Vertical reframing with subject tracking
7. **Effects/Subtitles** - Optional AI-generated FFmpeg filters
8. **Hook Overlay** - Text overlays with styled fonts
9. **Voice Dubbing** - Optional ElevenLabs AI translation (30+ languages)
10. **S3 Backup** - Silent background upload

### Key Files
| File | Purpose |
|------|---------|
| `main.py` | Core video processing: transcription, scene detection, clip extraction, vertical reframing |
| `app.py` | FastAPI server with async job queue and REST endpoints |
| `editor.py` | Gemini AI integration for dynamic video effects (FFmpeg filter generation) |
| `hooks.py` | Hook text overlay generation with font rendering |
| `s3_uploader.py` | AWS S3 upload with caching |
| `subtitles.py` | SRT generation, FFmpeg subtitle burning, and dubbed video transcription |
| `translate.py` | ElevenLabs dubbing API for AI voice translation |
| `dashboard/src/App.jsx` | Main React component with state management |
| `dashboard/src/components/TranslateModal.jsx` | Voice dubbing UI with language selection |

### Dual-Mode Video Reframing
- **TRACK Mode** (single subject): MediaPipe face detection + YOLOv8 fallback with "Heavy Tripod" stabilization
- **GENERAL Mode** (groups/landscapes): Blurred background layout preserving full width

### Key Classes
- `SmoothedCameraman` - Stabilized camera movement with safe zone logic (prevents jitter)
- `SpeakerTracker` - Prevents rapid speaker switching, handles temporary occlusions

### API Endpoints
| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/process` | Submit video for processing |
| GET | `/api/status/{job_id}` | Poll job status and logs |
| POST | `/api/edit` | Apply AI video effects |
| POST | `/api/subtitle` | Generate and apply subtitles (auto-transcribes dubbed videos) |
| POST | `/api/hook` | Add text hook overlays |
| POST | `/api/translate` | AI voice dubbing via ElevenLabs |
| GET | `/api/translate/languages` | List supported dubbing languages |
| POST | `/api/effects/generate` | Generate AI FFmpeg/Remotion effect config |

### Concurrency Model
Async job queue with semaphore-based concurrency control. Configure via `MAX_CONCURRENT_JOBS` env var (default: 5). Jobs auto-cleanup after 1 hour.

## Environment Variables

**Server-side (.env):**
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET` - For S3 backup (optional)
- `MAX_CONCURRENT_JOBS` - Concurrent processing limit (default: 5)
- `GEMINI_MODEL` - Text/analysis model (default: `gemini-2.5-flash`)
- `GEMINI_BASE_URL` - Optional LLM gateway/proxy base URL (Cloudflare AI Gateway, LiteLLM, …). Threaded into every `genai.Client(http_options=HttpOptions(base_url=…))`. Default: Google direct.
- `DISABLE_YOUTUBE_URL` - Set `true` to allow file uploads only (no URL ingest)
- `CORS_ALLOW_ORIGINS` - Comma-separated allowed origins (default: localhost dev ports)
- `VITE_API_URL` - Production API URL override

**Client-side (localStorage):**
- `GEMINI_API_KEY` - Google Gemini API key (required)
- `ELEVENLABS_API_KEY` - ElevenLabs API key for voice dubbing (optional)

> API keys live only in the browser's localStorage (lightly obfuscated via XOR+base64 — **not** strong encryption) and are sent via request headers only when a feature needs them. Never stored server-side.

## Tech Stack
- **Backend:** Python 3.11, FastAPI, google-genai, faster-whisper, ultralytics (YOLOv8), mediapipe, opencv-python, yt-dlp, FFmpeg, httpx
- **Frontend:** React 18, Vite 4, Tailwind CSS 3.4
- **External APIs:** Google Gemini, ElevenLabs Dubbing
- **Infrastructure:** Docker + Docker Compose, AWS S3
