# Sermon Note Clipper

Turn your sermon recordings into powerful 45-60 second social media clips for Instagram Reels, TikTok, and YouTube Shorts.

Built for church media teams. No developer skills required.

---

## What It Does

Upload a full sermon recording (video file or YouTube link) and the AI automatically finds the best moments:

- **Scripture references** — powerful Bible verse explanations
- **Key illustrations** — compelling stories and analogies
- **Application points** — practical "here's what to do" moments
- **Emotional peaks** — passion, conviction, vulnerability
- **Calls to action** — invitations and challenges
- **Memorable one-liners** — quotable phrases for social media

Each clip is 45-60 seconds, vertical (9:16), ready to post.

---

## Setup (One Time)

### Step 1: Get a Gemini API Key (FREE)

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with any Google account
3. Click "Create API Key"
4. Copy the key (it looks like `AIzaSy...`)

The free tier gives you 1,500 requests/day — more than enough.

### Step 2: Install

1. Open the `SermonNoteClipper` folder on your Desktop
2. **Double-click `install.command`**
3. If macOS asks "Are you sure?", right-click > Open instead
4. Wait for it to finish (5-10 minutes first time)

This installs Python, FFmpeg, and all required packages.

### Step 3: Launch

1. **Double-click `Start Sermon Clipper.command`**
2. Your browser opens to `http://localhost:5175`
3. Go to **Settings** (gear icon) and paste your Gemini API key
4. You're ready to clip sermons!

---

## How to Use

1. Click **Sermon Clipper** in the sidebar
2. Upload a sermon video file OR paste a YouTube link
3. Check the "I own this content" box and click Process
4. Wait 2-5 minutes (depends on sermon length)
5. Review the clips — the AI shows the best moments first
6. For each clip you can:
   - **Add subtitles** (auto-generated from speech)
   - **Add hook text** (attention-grabbing overlay)
   - **Download** the clip
   - **Post directly** to social media (requires Upload-Post key, optional)

---

## API Keys Reference

| Key | Required? | Cost | Where to get it |
|-----|-----------|------|-----------------|
| **Gemini API Key** | YES | Free (1,500 req/day) | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| **ElevenLabs API Key** | No (for voice dubbing/translation) | Free tier available | [elevenlabs.io](https://elevenlabs.io) |
| **Upload-Post API Key** | No (for direct social posting) | Free tier available | [upload-post.com](https://upload-post.com) |

For basic sermon clipping, you ONLY need the Gemini key.

---

## Troubleshooting

### "Are you sure you want to open this?"
Right-click the .command file > Open (or go to System Settings > Privacy & Security > Allow)

### App won't start
- Make sure you ran `install.command` first
- Check that you have internet access (needed for first-time model downloads)

### "FFmpeg not found"
Run `install.command` again — it will install FFmpeg via Homebrew.

### Clips are too short / too long
The AI targets 45-60 seconds. If your sermon has very few clear moments, you may get fewer clips.

### Processing takes a long time
- 30-minute sermon: ~3-5 minutes processing
- 60-minute sermon: ~5-10 minutes processing
- The first run downloads AI models (~500MB), subsequent runs are faster

---

## Stopping the App

Close the Terminal window that says "Sermon Note Clipper is running!" — this stops both servers.

---

## Technical Details (for IT)

- **Backend**: Python 3.11, FastAPI, Google Gemini 2.5 Flash, faster-whisper
- **Frontend**: React 18, Vite, Tailwind CSS
- **Video**: FFmpeg for cutting/encoding, MediaPipe for face tracking
- **Ports**: Backend on 8000, Frontend on 5175 (localhost only)
- **Storage**: Clips are stored temporarily in the `output/` folder (auto-cleaned after 1 hour)

---

## Credits

Based on [OpenShorts](https://github.com/mutonby/openshorts) (MIT License), customized for church sermon clipping.
