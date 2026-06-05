# Sermon Clipper — Setup Guide

Welcome! This guide will help you set up **Sermon Clipper** on your church's Macs. No tech experience needed — just follow the steps in order. You only do the setup once per Mac; after that, it's a double-click to use.

---

## 1. What You Need

- A **Mac** (laptop or desktop).
- **Docker Desktop** — a free helper program that runs the app's engine behind the scenes. (We'll install it in the next section.)
- The **SermonNoteClipper folder** — someone on your team gave you this. It already includes everything, including the app and your private settings file.

---

## 2. One-Time Setup (do this once per Mac)

1. **Install Docker Desktop.**
   - Go to **https://www.docker.com/products/docker-desktop**
   - Download the Mac version, open the downloaded file, and drag Docker into your Applications.
   - Open **Docker Desktop** once and let it finish starting (you'll see a little whale icon at the top of your screen when it's ready). You can accept the default options.

2. **Put the SermonNoteClipper folder somewhere safe.**
   - Drag the whole **SermonNoteClipper** folder into your **Applications** or **Documents** folder.
   - Keep the folder together as-is. Don't move things out of it.

3. **Open the app for the first time.**
   - Inside the folder, find **Sermon Clipper.app**.
   - The first time only, **right-click** it (or hold Control and click), then choose **Open**, then **Open** again.
   - This is just macOS asking "are you sure?" because the app came from your team and not the App Store. You only have to do this once.

4. **Let it build (first run only).**
   - The very first launch sets things up and downloads what it needs. This takes about **5 to 15 minutes**. That's normal!
   - Grab a coffee. After this one time, the app opens in just a few seconds.

---

## 3. How to Use It Every Day

1. **Double-click "Sermon Clipper.app"** inside the folder.
2. **Wait for the app window to appear.** (A few seconds — the first run of the day may take a little longer while the engine wakes up.)
3. **Drag your sermon video** into the window. MP4 or MOV files work great.
4. Click **Generate**.
5. **Watch the steps go by** as the app finds the best moments and creates your vertical clips.
6. When it's done, your **clips appear** right there.
7. Click **Download** to save a clip — or find them anytime in the **Exports** tab.

---

## 4. Where Your Clips Go

- **Exports tab** — inside the app, this always shows your recent clips. Easiest place to grab them.
- **The `output` folder** — clips are also saved inside the SermonNoteClipper folder, in a folder called `output`.
- Clips are kept for **7 days**, so download anything you want to keep.

---

## 5. Stopping It

- To take a break: just **close the app window**.
- To fully shut everything down: double-click **"Stop Sermon Clipper.command"** inside the folder.

---

## 6. Troubleshooting

- **It says Docker isn't running.** Open **Docker Desktop** and wait for the whale icon to settle at the top of your screen, then try again.
- **"Unidentified developer" warning.** Right-click the app and choose **Open** (see Step 3 above). Only needed the first time.
- **The app window didn't appear.** On the very first run it's still building — give it several minutes. After that, wait a few seconds and it should pop up.
- **Keep the folder and its hidden settings file together.** Don't separate the app from its folder, or it won't know your settings.

---

## 7. A Quick Note on the API Key

- Your folder includes a small settings file (called `.env`) that holds the **API key** powering the AI. It's already set up for you — you don't need to touch it.
- Using the AI is **very cheap** — roughly a few cents per sermon.
- Because that key lives in the folder, **keep the folder private**. Don't post it online or share it outside your team.

---

That's it! Enjoy turning your sermons into shareable clips. 🙌
