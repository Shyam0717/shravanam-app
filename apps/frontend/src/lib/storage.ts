export interface UserStorage {
    listenedLectures: number[]; // Array of lecture IDs
    bookmarkedLectures: number[]; // Array of lecture IDs
    notes: Record<number, string>; // Map of ID -> Note content
    dailyGoal: number; // Minutes
    streak: {
        current: number;
        longest: number;
        lastListenedDate: string | null;
        totalMinutes: number;
        todayMinutes: number;
        lastUpdated: string; // To reset todayMinutes
    };
    achievements: string[];
}

const STORAGE_KEY = 'kirtanam_sadhana_data';

const DEFAULT_STORAGE: UserStorage = {
    listenedLectures: [],
    bookmarkedLectures: [],
    notes: {},
    dailyGoal: 30,
    streak: {
        current: 0,
        longest: 0,
        lastListenedDate: null,
        totalMinutes: 0,
        todayMinutes: 0,
        lastUpdated: new Date().toISOString(),
    },
    achievements: [],
};

export const storage = {
    get: (): UserStorage => {
        if (typeof window === 'undefined') return DEFAULT_STORAGE;
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? { ...DEFAULT_STORAGE, ...JSON.parse(data) } : DEFAULT_STORAGE;
        } catch {
            return DEFAULT_STORAGE;
        }
    },

    set: (data: UserStorage) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        // Dispatch event for reactive updates in hooks
        window.dispatchEvent(new Event('storage-update'));
    },

    update: (updater: (prev: UserStorage) => UserStorage) => {
        const current = storage.get();
        const next = updater(current);
        storage.set(next);
        return next;
    }
};
