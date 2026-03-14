# Kirtanam Sadhana v1 Finalization & Deployment Plan

## Objective
Finalize Version 1 for deployment, ensuring multi-user support (via local storage), code quality, compliance, and proper documentation.

## 1. Code Analysis & Security
- **Current State**: Backend uses `lowdb` (JSON files) to store `listened`, `bookmarked`, `notes`, `streak`.
- **Issue**: Deploying this to a server means *all users share the same database*. If User A listens to a lecture, it gets marked as listened for User B.
- **Solution**: Move "User State" (listened, bookmarks, notes, streak, daily goal) to **Browser LocalStorage**.
- **Security**: The backend becomes read-only (serving lecture metadata). No user data is sent to the server, improving privacy and simplifying GDPR/compliance.
- **Standards**: Remove `any` types and ensure proper error handling.

## 2. Regulatory & Copyright Compliance
- Add an **About / Credits** page.
- **Content**:
  - Acknowledge **ISKCON Desire Tree** as the audio source.
  - Dedication to **His Divine Grace A.C. Bhaktivedanta Swami Prabhupada**.
  - Disclaimer that this is a personal sadhana tool.
  - Link to original sources.

## 3. Architecture for "Simple, Personal History"
Refactor the app to be a **Static Web App** (Serverless).
- **Backend Removal**: We don't need the Express server for V1. Next.js API routes (or just `getStaticProps`) can serve the JSON data.
- **Data persistence**: Use `useLocalStorage` hook for:
  - `listenedLectures`: Array of IDs
  - `bookmarks`: Array of IDs
  - `notes`: Dictionary of `{id: content}`
  - `streak`: Object with `{current, best, lastDate}`
- **Benefits**:
  - Free deployment on Vercel/Netlify.
  - Zero server maintenance.
  - Every user naturally has their own isolated history.
  - Instant load times (cacheable).

## 4. Documentation & Future Planning
- **README.md**: Update with "How to Run", "Tech Stack", "Credits".
- **roadmap.md**: Document V2 ideas (User Accounts, Cloud Sync, Social Features).
- **CHANGELOG.md**: Record v1 features.

## Execution Steps

1.  **Create `storage.ts` Utility**: Helper for LocalStorage operations with types.
2.  **Refactor Components**:
    - Update `AudioContext` and `StreakCard` to read/write local storage instead of API calls.
    - Update `LectureCard` to toggle listen/bookmark in local storage.
3.  **Add `About` Page**: `/pages/about.tsx`.
4.  **Migrate Data**: Move `sb_lectures.json` etc. to Frontend for direct import.
5.  **Cleanup**: Remove unused backend code (Express server) to simplify repo for V1.
6.  **Docs**: Create final documentation.
