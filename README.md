# 🎥 Twitch - Force Source Quality (URL Change Only)

A userscript for Tampermonkey that automatically forces Twitch streams to open at **Source (highest available)** quality every time you open a stream or switch between streams.  
No longer will you have to open the settings menu every time.

***

## ⚙️ Overview

Twitch can reset stream quality when changing between live channels or browsing through the sidebar.

This userscript automatically switches to **“Source”**, **“1080p60”**, or your preferred resolution every time the Twitch video player changes.  
It integrates smoothly with:

- Opening a new Twitch stream  
- Moving between channels using the sidebar  
- Viewing embedded players (for example `player.twitch.tv`)  

***

## ✨ Features

- 🔁 **Auto-detects URL changes**  
  Responds to navigation changes in Twitch’s single-page app structure.  

- 🏗️ **Forces Source / Highest quality**  
  Picks from preferred quality labels (`Source`, `1080p60`, `1080p`, `chunked`).  

- ⚡ **No repeated UI actions**  
  Automatically sets your desired quality when the player is ready.  

- 💻 **Fully client-side**  
  Everything runs in your browser — no servers or external dependencies.  

- 🧩 **Customizable**  
  You can easily modify the script to prefer only `1080p60` or any other label.  

---

## 🧠 How It Works

The script:
1. Waits for the Twitch player to load.  
2. Opens the settings menu.  
3. Chooses your desired quality option (for example, “Source”).  
4. Closes the settings menu automatically.  
5. Repeats this process every time the URL on Twitch changes (when switching streams).  

---

## 🧭 Installation

1. Download and install [**Tampermonkey**](https://tampermonkey.net/).  
2. Click **“Create a new script”**.  
3. Copy the contents of `TwitchForceSource.user.js` into the editor.  
4. Save and enable the script.  
5. Open any Twitch stream — it will automatically play in **Source** quality.  

---

## ⚙️ Configuration

In the script itself, you can alter your preferred quality settings:

```js
// Default: prefer Source quality
const PREFERRED_QUALITY_LABELS = ["Source", "1080p60", "1080p", "chunked"];

// To force only 1080p60:
const PREFERRED_QUALITY_LABELS = ["1080p60"];
```

## 📜 License

Unlicensed – free to use, modify, and share. Don't commercialize it.

## 👤 Author

xolossus

Designed for a seamless quality viewing experience.
