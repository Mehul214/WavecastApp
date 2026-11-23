# Changelog

All notable changes to **WaveCast** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-11-23

### Added
- **Full Offline Podcast Playback & Download Manager**:
  - Download full podcast episodes locally to device storage for offline playback anywhere without network access.
  - Native Android downloader module (`PodcastDownloaderModule.kt`) using `OkHttpClientProvider` with mobile browser User-Agent and automatic redirect following to bypass CDN blocks (Megaphone, Libsyn, Cloudflare).
  - Native iOS downloader module (`PodcastDownloader.m`) utilizing `NSURLSessionDownloadTask` with progress delegation.
  - Persistent offline index stored securely via `@react-native-async-storage/async-storage`.
  - Zero-buffering playback automatically routed to local storage when playing downloaded episodes.
- **Dedicated Downloads Tab**:
  - New 5th navigation tab on the bottom bar with dynamic badge counter indicating total downloaded episodes.
  - Clean library list showing downloaded episodes, publication dates, and human-readable file sizes (e.g., `45.2 MB`).
  - Total offline storage footprint summary card with one-tap "Clear All" and individual swipe/tap deletion.
  - One-tap instant play from the downloads list.
- **Real-time Circular Progress Indicators**:
  - Reusable SVG circular progress ring (`CircularProgress.tsx`) displaying live percentage completion (`0%` to `100%`) directly inside the download button.
  - Instant transition to green checkmark badge (`CheckCircle`) once download finishes.
  - Subtle `Offline Ready` pill indicator below the episode date.

### Changed
- **Ultra-Smooth Audio Scrubber**:
  - Replaced basic slider with a responsive `PanResponder` touch controller.
  - Dynamic scroll locking (`scrollEnabled={!isScrubbing}`) to prevent modal scroll bounce during drag seeking.
  - 34px vertical touch hit-padding with visual expansion of scrubber thumb (`16px` to `22px`) while active.
  - Accurate absolute measurement tracking to eliminate touch offset lag.
- **Cleaner Now Playing Player UI**:
  - Removed redundant horizontal downloading bar and text line below the date to keep the UI minimal and distraction-free.

### Fixed
- Fixed HTTP 403 Forbidden CDN issues when streaming and downloading episodes from enterprise podcast hosts.
- Pinned Kotlin Gradle Plugin version to `$kotlinVersion` to eliminate Kotlin 2.2.10 vs KSP 2.2.0-2.0.2 compiler mismatch.
- Added IPv4 preference and HTTP timeout flags in `gradle.properties` to avoid dependency hanging during Android builds.

---

## [1.0.0] - 2026-11-22

### Added
- Initial open-source release of WaveCast.
- Free podcast search and category browsing powered by the public Apple iTunes Directory.
- Direct RSS XML feed parsing using `fast-xml-parser`.
- Native background and lock-screen media playback powered by `@rntp/player`.
- Docked Mini Player and Full Player Modal with variable speed controls (1x, 1.25x, 1.5x, 2x) and jump ±15s.
- Bookmarks / Favorites system and listening history tracking with auto-resume.
- Responsive dark and light theme support.
- Multi-platform distribution support (Obtainium, F-Droid metadata, direct APK).
