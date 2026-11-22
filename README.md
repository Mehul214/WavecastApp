# WaveCast - React Native Podcast App

<p align="left">
  <a href="https://github.com/Mehul214/WavecastApp/releases/latest">
    <img src="https://img.shields.io/badge/Download-Android%20APK-brightgreen.svg?style=flat-square&logo=android" alt="Download APK" />
  </a>
  <a href="https://apps.obtainium.imranr.dev/add?r=https://github.com/Mehul214/WavecastApp">
    <img src="https://img.shields.io/badge/Obtainium-Auto%20Update-9C27B0?style=flat-square" alt="Obtainium" />
  </a>
  <a href="https://github.com/RookieEnough/Orion-Data/issues/3253">
    <img src="https://img.shields.io/badge/Orion%20Store-Listing%20Submitted-00BCD4?style=flat-square" alt="Orion Store" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License MIT" />
  </a>
  <a href="https://buymeacoffee.com/mehulreshac" target="_blank">
    <img src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-FFDD00?style=flat-square&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
  </a>
  <a href="#-support-via-upi">
    <img src="https://img.shields.io/badge/Donate-UPI-orange.svg?style=flat-square" alt="Donate UPI" />
  </a>
</p>

A modern, full-featured podcast streaming application bootstrapped with **React Native Community CLI** (`@react-native-community/cli`), using **100% free open APIs** (Apple iTunes Search API + direct RSS XML Feeds) and **`@rntp/player`** for native iOS & Android audio streaming and background playback.

🌐 **Web Landing Page**: [https://mehul214.github.io/WavecastApp/](https://mehul214.github.io/WavecastApp/)

---

## 📲 Download & Install (Open Source Platforms)

You can install WaveCast using any of the following open-source methods:

| Method | Description | Link |
| :--- | :--- | :--- |
| **Direct APK** | Standalone pre-built APK for any Android phone/tablet (~27 MB) | [⬇️ **Download WaveCast.apk (v1.0.0)**](https://github.com/Mehul214/WavecastApp/releases/download/v1.0.0/WaveCast.apk) |
| **Obtainium** | 1-click install & automatic updates directly from GitHub Releases | [⚡️ **Add to Obtainium**](https://apps.obtainium.imranr.dev/add?r=https://github.com/Mehul214/WavecastApp) |
| **Orion Store** | Open-source Android app client catalog | [🪐 **Orion Store Request #3253**](https://github.com/RookieEnough/Orion-Data/issues/3253) |
| **GitHub Releases** | Official releases page with assets & changelogs | [📦 **View v1.0.0 Release**](https://github.com/Mehul214/WavecastApp/releases/tag/v1.0.0) |
| **Web Site** | Clean web showcase with one-tap downloads | [🌐 **WaveCast Web Page**](https://mehul214.github.io/WavecastApp/) |

---

## 📱 Screenshots

<p align="center">
  <img src="screenshots/discover.png" width="320" alt="WaveCast Discover Screen" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="screenshots/player.jpg" width="320" alt="WaveCast Full Player Screen" />
</p>

---

## 🎧 Features

- **Free Podcast Discovery**: Uses the free public Apple iTunes Search API (no API key or registration required) to search podcasts across categories (Technology, News, Business, True Crime, Comedy, Science).
- **Direct RSS Feed Parsing**: Fetches podcast RSS XML directly and parses episode audio enclosures (`<enclosure url="..." />`), titles, release dates, durations, and show notes using `fast-xml-parser`.
- **Native Audio Streaming**: Uses `@rntp/player` for audio playback directly from publishers' MP3/AAC streams.
- **Background & Lock Screen Controls**: Plays audio in the background with lock screen & notification bar controls (`FOREGROUND_SERVICE` and `FOREGROUND_SERVICE_MEDIA_PLAYBACK` configured on Android).
- **Interactive UI**:
  - Category filter pills
  - Fast search with instant suggestions and clear button
  - Podcast detail view with full episode list and release metadata
  - Docked Mini Player with real-time progress bar and quick +15s jump
  - Full-Screen Player Modal with scrubber, speed controls (1x, 1.25x, 1.5x, 2x), and episode notes

---

## 🛠 Project Architecture

```
Podcast/
├── android/               # Android native project files
│   └── app/src/main/AndroidManifest.xml (Configured with audio foreground service)
├── src/
│   ├── components/
│   │   ├── CategoryPills.tsx     # Category chips (Technology, News, etc.)
│   │   ├── EpisodeItem.tsx       # Episode list item with play indicator
│   │   ├── FullPlayerModal.tsx   # Scrubber, 15s skip, speed controls, notes
│   │   ├── MiniPlayer.tsx        # Bottom docked mini player with progress
│   │   └── PodcastCard.tsx       # Podcast cover & metadata card
│   ├── services/
│   │   ├── podcastApi.ts         # iTunes API search + RSS XML parser
│   │   └── playerService.ts      # Audio player setup, play, pause, seek, jump
│   └── types/
│       └── podcast.ts            # Podcast & Episode interfaces
├── service.ts             # Remote background media controls service
├── index.js               # App entrypoint + TrackPlayer service registration
├── App.tsx                # Main screen & state management
└── package.json
```

---

## 🚀 Running on Android

### 1. Start Metro Bundler
```bash
npm start
```

### 2. Run on Android Emulator or Device
Open another terminal tab and run:
```bash
npm run android
```
*(Make sure an Android Emulator is running or an Android device is connected via USB with USB debugging enabled).*

---

## 🌐 Free API Reference

### Apple iTunes Search API
```
GET https://itunes.apple.com/search?term={QUERY}&media=podcast&entity=podcast&limit=25
```
Returns podcast metadata and direct RSS `feedUrl`.

### Podcast RSS Feed (XML)
Every podcast host serves an RSS feed containing episode media links:
```xml
<item>
  <title>Episode Title</title>
  <enclosure url="https://.../episode.mp3" type="audio/mpeg" length="123456" />
</item>
```
The app parses the MP3 URL and hands it directly to `TrackPlayer` to stream for free.

---

## 💖 Support App Maintenance & Donate

Building and maintaining free, ad-free open-source applications takes dedicated effort. If **WaveCast** helps you enjoy podcasts or saves you subscription costs, please consider supporting development:

- ☕️ **[Buy Me a Coffee](https://buymeacoffee.com/mehulreshac)**

<p align="left">
  <a href="https://buymeacoffee.com/mehulreshac" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="42" />
  </a>
</p>

### ☕️ Support via UPI

If you're in India or use any UPI-enabled payment app (Google Pay, PhonePe, Paytm, BHIM, Cred, Amazon Pay):

- **UPI ID:** `mehulreshamwala7@okhdfcbank`
- **Payee Name:** Mehul Reshamwala

<p align="left">
  <a href="upi://pay?pa=mehulreshamwala7@okhdfcbank&pn=Mehul%20Reshamwala&cu=INR&tn=Support%20WaveCast%20App">
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi%3A%2F%2Fpay%3Fpa%3Dmehulreshamwala7%40okhdfcbank%26pn%3DMehul%2520Reshamwala%26cu%3DINR%26tn%3DSupport%2520WaveCast%2520App" alt="Scan to Pay with UPI" width="180" height="180" />
  </a>
  <br />
  <sub>Scan with Google Pay / PhonePe / Paytm or <a href="upi://pay?pa=mehulreshamwala7@okhdfcbank&pn=Mehul%20Reshamwala&cu=INR&tn=Support%20WaveCast%20App">tap here on mobile to pay directly</a>.</sub>
</p>
