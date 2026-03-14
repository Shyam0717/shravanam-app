import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const streakPath = path.join(__dirname, '../db/streak.json');

interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastListenedDate: string | null;
    dailyGoalMinutes: number;
    totalMinutesListened: number;
    todayMinutesListened: number;
    achievements: string[];
}

// Load streak data
function loadStreak(): StreakData {
    try {
        return JSON.parse(fs.readFileSync(streakPath, 'utf-8'));
    } catch {
        return {
            currentStreak: 0,
            longestStreak: 0,
            lastListenedDate: null,
            dailyGoalMinutes: 30,
            totalMinutesListened: 0,
            todayMinutesListened: 0,
            achievements: [],
        };
    }
}

// Save streak data
function saveStreak(data: StreakData) {
    fs.writeFileSync(streakPath, JSON.stringify(data, null, 2));
}

// Check if two dates are consecutive days
function isConsecutiveDay(lastDate: string | null, today: string): boolean {
    if (!lastDate) return true;

    const last = new Date(lastDate);
    const current = new Date(today);

    const diffTime = current.getTime() - last.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays === 1;
}

// Check if same day
function isSameDay(date1: string | null, date2: string): boolean {
    if (!date1) return false;
    return date1.split('T')[0] === date2.split('T')[0];
}

// Achievement thresholds
const ACHIEVEMENTS = {
    'fire-starter': 3,
    'week-warrior': 7,
    'diamond-devotee': 30,
    'century-chanter': 100,
    'yearly-yogi': 365,
};

// GET /streak - Get current streak data
router.get('/', (req, res) => {
    const data = loadStreak();
    res.json(data);
});

// POST /streak/update - Update streak when lecture is listened
router.post('/update', (req, res) => {
    const { minutesListened } = req.body;
    const data = loadStreak();
    const today = new Date().toISOString();
    const todayDate = today.split('T')[0];

    // Reset today's minutes if it's a new day
    if (!isSameDay(data.lastListenedDate, today)) {
        data.todayMinutesListened = 0;
    }

    // Add minutes listened
    data.todayMinutesListened += minutesListened || 0;
    data.totalMinutesListened += minutesListened || 0;

    // Update streak
    if (!data.lastListenedDate) {
        // First time listening
        data.currentStreak = 1;
        data.longestStreak = 1;
    } else if (isSameDay(data.lastListenedDate, today)) {
        // Same day, no change to streak
    } else if (isConsecutiveDay(data.lastListenedDate, today)) {
        // Consecutive day, increment streak
        data.currentStreak += 1;
        if (data.currentStreak > data.longestStreak) {
            data.longestStreak = data.currentStreak;
        }
    } else {
        // Streak broken, reset
        data.currentStreak = 1;
    }

    data.lastListenedDate = today;

    // Check for new achievements
    for (const [achievement, threshold] of Object.entries(ACHIEVEMENTS)) {
        if (data.currentStreak >= threshold && !data.achievements.includes(achievement)) {
            data.achievements.push(achievement);
        }
    }

    saveStreak(data);
    res.json({ message: 'Streak updated', data });
});

// PATCH /streak/goal - Update daily goal
router.patch('/goal', (req, res) => {
    const { dailyGoalMinutes } = req.body;
    const data = loadStreak();

    if (typeof dailyGoalMinutes === 'number' && dailyGoalMinutes > 0) {
        data.dailyGoalMinutes = dailyGoalMinutes;
        saveStreak(data);
        res.json({ message: 'Goal updated', data });
    } else {
        res.status(400).json({ error: 'Invalid goal value' });
    }
});

export default router;
