# Changelog

## [Unreleased]

### Added
- **Install as a mobile app (PWA)**: web app manifest, app icons, and a service worker so Shravanam can be added to the home screen on iPhone and Android and opens full-screen.
- **Offline browsing**: all pages and the lecture catalog are cached after the first visit; streaming audio still needs a connection.
- **Lock-screen controls**: lecture title, speaker and artwork on the lock screen / notification, with play, pause, ±15s and scrubbing.
- **Install prompt**: one-tap install button on Android, "Add to Home Screen" instructions on iPhone; dismissible.
- Player respects the iPhone home-indicator safe area.

### Changed (mobile UI)
- **Bottom tab bar on phones** replaces the 2×2 header menu, which took a fifth of the screen and stayed pinned while scrolling. Tablets and desktop keep the header menu.
- **Mini player + Now Playing**: phones get a compact mini player (readable title and speaker, play/pause) above the tab bar; tapping it opens a full-screen Now Playing view with a draggable seek bar, ±15s, speed and sleep timer.
- **Library reaches lectures on the first screen**: compact title on phones, speakers and collections as scrolling chips (the sidebar list stays on wide screens), filters side by side.
- **Compact lecture cards** (about half the height): play button beside the details, location and date on one line, actions kept in reach.
- **Long collections load as you scroll** (40 at a time) instead of rendering up to 1,400 cards at once.
- **Notes editor** opens full-screen on phones with Save at the top, where the keyboard can't cover it.

### Fixed
- Theme colours that never rendered: lotus/sand shades 300 and 600–900 (e.g. link and icon colours, dark-mode tiles) and sky 300/600–900 now use the app palette; neutrals use the app's slate tones, so dark-mode inputs are no longer brownish.
- "Now playing" and "listened" highlights on lecture cards were hidden by the card shadow; they now show.
- Slider tracks (volume) were invisible because of a misspelled CSS pseudo-element.
- Dark-mode badges had low-contrast text.
- Hover styles no longer stick after a tap on touch screens; iOS no longer zooms into the search box and notes field.
- Each lecture card's notes dialog reset the page scroll lock on every re-render.

## [1.0.0] - 2025-12-31

### 🎉 Initial Release
Version 1.0 of **Shravanam** is now live! This release focuses on providing a solid foundation for personal hearing practice.

### Added
- **Core Architecture**:
  - Migrated to Client-Side Architecture (Static Site) for privacy and performance.
  - Implemented `useUserStorage` hook for local data persistence.
- **Content**:
  - **Bhagavad-gita Lectures**: Filterable list with chapter navigation.
  - **Srimad-Bhagavatam Lectures**: Organized by Canto.
  - **Nectar of Devotion Lectures**: Searchable and filterable.
- **Features**:
  - **Global Audio Player**: Persistent playback across pages.
  - **Streak System**: Daily streak tracking on Dashboard.
  - **Notes System**: Add/Edit notes for any lecture.
  - **Progress Tracking**: Visual progress bars for Cantos and overall completion.
  - **Themes**: Light/Dark mode with spiritual color palette (Sage, Lotus, Sand).
- **Pages**:
  - `Home`: Hero section and quick start.
  - `Dashboard`: User stats, streaks, and bookmarks.
  - `Lectures` (BG/SB/NOD): Content libraries.
  - `About`: Credits, Mission, and Disclaimer.
