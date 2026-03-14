# Streak Tracking & Daily Goals Implementation

Gamify spiritual practice with consistent listening habits, daily goals, and achievement milestones.

## Overview

Track user's listening streaks (consecutive days) and provide daily goals to encourage regular practice. Display progress on dashboard with beautiful visualizations.

## Proposed Changes

### Backend

#### [NEW] [streak.json](file:///Users/shyam/Documents/personal/kirtanam-sadhana-app/apps/backend/db/streak.json)
- Store user's streak data
- Fields: `currentStreak`, `longestStreak`, `lastListenedDate`, `dailyGoalMinutes`, `totalMinutesListened`, `achievements[]`

#### [NEW] [streakRoutes.ts](file:///Users/shyam/Documents/personal/kirtanam-sadhana-app/apps/backend/routes/streak.ts)
-  - [x] Create About page with credits
  - [x] Add About link to navigation
  - [x] Remove unused API routes
  - [x] Final security scan (Already passed: No dangerouslySetInnerHTML, No TODOs)CH /streak/goal` - Update daily goal

---

### Frontend

#### [NEW] [StreakCard.tsx](file:///Users/shyam/Documents/personal/kirtanam-sadhana-app/apps/frontend/src/components/StreakCard.tsx)
- Display current streak with fire emoji gradient
- Show longest streak record
- Daily goal progress bar
- Achievement badges

#### [MODIFY] [dashboard/index.tsx](file:///Users/shyam/Documents/personal/kirtanam-sadhana-app/apps/frontend/src/pages/dashboard/index.tsx)
- Add StreakCard component
- Show daily goal progress
- Display recent achievements

#### [MODIFY] [AudioContext.tsx](file:///Users/shyam/Documents/personal/kirtanam-sadhana-app/apps/frontend/src/contexts/AudioContext.tsx)
- Track lecture completion time
- Call streak API on lecture end
- Update daily minutes listened

---

## Features

### Streak Tracking
- **Current Streak**: Days with consecutive listening
- **Longest Streak**: Personal best record
- **Streak Milestones**: 3, 7, 14, 30, 50, 100, 365 days

### Daily Goals
- Default: 15 minutes per day
- Customizable by user
- Progress visualization
- Completion celebration

### Achievements
- 🔥 **Fire Starter** - 3-day streak
- ⚡ **Week Warrior** - 7-day streak
- 💎 **Diamond Devotee** - 30-day streak
- 🏆 **Century Chanter** - 100-day streak
- 👑 **Yearly Yogi** - 365-day streak

## Verification Plan

1. Test streak increments daily
2. Test streak resets when skipping a day
3. Test daily goal tracking
4. Verify achievements unlock properly
5. Check dashboard visualizations
