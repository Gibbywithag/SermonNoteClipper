# Sermon Clipper — Setup Guide

Welcome! Setting this up is mostly **one double-click**. You only do it once per Mac; after that it's a single click to use. No tech experience needed.

---

## 1. What you need

- A **Mac** (laptop or desktop) connected to the internet.
- The **SermonNoteClipper folder** — someone on your team sent it to you. It already includes everything: the app, the installer, and your private settings.

That's it. The installer handles the rest (including a free helper called Docker).

---

## 2. First-time setup — one click

1. **Put the folder somewhere safe.** Drag the whole **SermonNoteClipper** folder into your **Applications** or **Documents** folder. Keep everything inside it together.

2. **Double-click `Install Sermon Clipper.command`.**
   - The first time, macOS may say it's from an *"unidentified developer."* If so: **right-click** the file (or Control-click) → **Open** → **Open**. This just means it came from your team, not the App Store. One time only.

3. **Let it run.** A black setup window opens and does everything automatically:
   - Installs **Docker** if your Mac doesn't have it (a password box pops up — that's just your normal Mac login password).
   - Builds the app and opens it.
   - **This takes about 10–20 minutes the first time** (it downloads a lot). Totally normal — grab a coffee. ☕

4. When it's done, the app **opens by itself** and the window says "All set!" You're ready.

---

## 3. Every day after — just open the app

- Double-click **`Sermon Clipper.app`** inside the folder. It opens in a few seconds.
- **Tip:** drag `Sermon Clipper.app` onto your **Dock** once, and it's always one click away.
- *(You never need the installer again — only the app.)*

---

## 4. How to use it

1. Open the app.
2. **Drag a sermon video** into the window (MP4 or MOV).
3. Click **Generate**.
4. Watch it find the best moments and cut your vertical clips.
5. Click **Download** on a clip — or grab them anytime from the **Exports** tab.

---

## 5. Where your clips go

- **Exports tab** (inside the app) — always shows your clips. Easiest place to grab them.
- They're also saved in the **`output`** folder inside SermonNoteClipper.
- Clips are kept for **7 days**, so download anything you want to keep.

---

## 6. Stopping it

- Just **close the window** to take a break.
- To fully shut it down, double-click **`Stop Sermon Clipper.command`**.

---

## 7. Troubleshooting

- **"Unidentified developer" warning** → right-click the file → **Open** (only the first time).
- **It says Docker isn't running** → open **Docker Desktop** from Applications, wait for the little whale icon at the top of your screen to settle, then open the app again.
- **The setup window closed with an error** → just run **`Install Sermon Clipper.command`** again. It's safe to re-run.
- **Keep the folder together.** Don't move the app out of its folder, or it won't find its settings.

---

## 8. About the API key

- The folder includes a small settings file (`.env`) with the **API key** that powers the AI. It's already set up — don't touch it.
- Using the AI is **very cheap** — a few cents per sermon.
- Because that key lives in the folder, **keep the folder private** — don't post it online or share it outside your team.

---

That's it — enjoy turning sermons into shareable clips. 🙌
