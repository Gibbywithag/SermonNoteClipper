# Sermon Note Clipper — Desktop (Electron) App

This wraps the web app in a native desktop window. There's no terminal, no
two-server dance — you double-click the app and it opens.

## How it works

```
┌─────────────────────────── Electron app ───────────────────────────┐
│  electron/main.js                                                   │
│   • picks a free local port                                         │
│   • spawns the Python backend:  python -m uvicorn app:app --port N  │
│   • waits until /api/config answers                                 │
│   • shows a native window pointed at  http://127.0.0.1:N            │
│                                                                     │
│  app.py  (FastAPI)                                                  │
│   • serves the REST API (/api/*), media (/videos, /thumbnails)      │
│   • ALSO serves the built dashboard (dashboard/dist) at "/"         │
│     → API + UI + media are same-origin on one port (no proxy)       │
└─────────────────────────────────────────────────────────────────────┘
```

Because the backend serves the UI too, the renderer just uses relative paths —
nothing about the API URL is baked in, and any free port works.

## Prerequisites (one time)

1. The Python engine must be set up: run **`install.command`** once (creates the
   `venv` with all AI dependencies). The Electron app reuses that `venv`.
2. Node.js + npm (already installed if you've run the dashboard).

## Run it

```bash
npm install            # installs Electron toolchain (once)
npm start              # builds the dashboard, then launches the desktop app
```

`npm start` runs `build:web` (which `npm install`s + builds `dashboard/dist`)
then `electron .`. The backend is started automatically and stopped when you
quit the app.

### Develop with hot reload

```bash
npm run dev            # Vite dev server (5175) + Electron, with live reload
```

### Regenerate the icon

```bash
npm run icon           # writes build/icon.png via build/make-icon.py
```

## Which Python does it use?

`electron/backend.js` looks, in order, for:

1. `$SERMON_PYTHON` (override)
2. `./venv/bin/python`  ← the project venv (default)
3. `~/miniconda3/envs/py312/bin/python`
4. `python3`

The backend log is written to Electron's `userData/backend.log`
(Help → "Open engine log").

## Packaging a standalone `.app` / `.dmg` (the "wrap it later" step)

`npm run dist:mac` is wired up (electron-builder, `build` config in
`package.json`, icon at `build/icon.png`). It produces a `.dmg` and `.zip` in
`release/`.

**The one remaining piece is bundling the Python backend**, so the app doesn't
depend on the user's `venv`. The cleanest options:

- **Relocatable env (simplest):** stage a self-contained Python + deps into a
  top-level `backend/` folder and uncomment the `extraResources` block in
  `package.json` (it copies `backend/` into the app's `Resources/`).
  `backend.js` already prefers `Resources/backend` when `app.isPackaged`.
  Build that folder with e.g. `conda-pack` (pack the working `py312` env) or
  `python -m venv --copies` + path fix-ups, and copy in `app.py`, `main.py`,
  and the helper modules.
- **PyInstaller:** freeze `app.py` (and its `main.py` subprocess) into a binary.
  More work because of `torch`/`mediapipe`/`ffmpeg`, but yields the smallest,
  most portable result.

Also remember for distribution outside your own Mac:

- **FFmpeg** must be bundled or installed (the pipeline shells out to `ffmpeg`).
- **Code signing + notarization** (`hardenedRuntime` is already set) — set
  `CSC_LINK`/`CSC_KEY_PASSWORD` and an Apple notarization profile, or the app
  will be Gatekeeper-blocked on other Macs.
- First run still downloads the Whisper + YOLO models (~hundreds of MB) unless
  you pre-bundle them.

Until that bundling is done, the app runs perfectly on **this** machine via
`npm start` (it uses the local `venv`).
