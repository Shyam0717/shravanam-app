'use client';

import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { AnyLecture } from '@/types/Lecture';
import { storage } from '@/lib/storage';

interface AudioState {
    currentLecture: AnyLecture | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    playbackRate: number;
    sleepTimerMinutes: number | null;
    sleepTimerEndsAt: number | null;
}

interface AudioContextType extends AudioState {
    play: (lecture: AnyLecture) => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    skip: (seconds: number) => void;
    setPlaybackRate: (rate: number) => void;
    setSleepTimer: (minutes: number | null) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);
const AUDIO_PREFERENCES_KEY = 'shravanam_audio_preferences';

export function useAudio() {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
}

interface AudioProviderProps {
    children: ReactNode;
    onLectureComplete?: (lecture: AnyLecture) => void;
}

export function AudioProvider({ children, onLectureComplete }: AudioProviderProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const startTimeRef = useRef<number>(0);
    const [state, setState] = useState<AudioState>({
        currentLecture: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        isMuted: false,
        playbackRate: 1,
        sleepTimerMinutes: null,
        sleepTimerEndsAt: null,
    });

    // Initialize audio element
    useEffect(() => {
        const audio = new Audio();
        // Avoid fetching audio metadata until the user explicitly plays a lecture.
        audio.preload = 'none';
        audioRef.current = audio;

        if (typeof window !== 'undefined') {
            try {
                const savedPreferences = window.localStorage.getItem(AUDIO_PREFERENCES_KEY);
                if (savedPreferences) {
                    const parsed = JSON.parse(savedPreferences) as Partial<Pick<AudioState, 'volume' | 'playbackRate' | 'isMuted'>>;
                    if (typeof parsed.volume === 'number') {
                        audio.volume = parsed.volume;
                    }
                    if (typeof parsed.isMuted === 'boolean') {
                        audio.muted = parsed.isMuted;
                    }
                    if (typeof parsed.playbackRate === 'number') {
                        audio.playbackRate = parsed.playbackRate;
                    }
                    setState(prev => ({
                        ...prev,
                        volume: typeof parsed.volume === 'number' ? parsed.volume : prev.volume,
                        isMuted: typeof parsed.isMuted === 'boolean' ? parsed.isMuted : prev.isMuted,
                        playbackRate: typeof parsed.playbackRate === 'number' ? parsed.playbackRate : prev.playbackRate,
                    }));
                }
            } catch {
                // Ignore invalid local preferences and continue with defaults.
            }
        }

        const handleTimeUpdate = () => {
            setState(prev => ({ ...prev, currentTime: audio.currentTime }));
        };

        const handleDurationChange = () => {
            setState(prev => ({ ...prev, duration: audio.duration }));
        };

        const handleEnded = async () => {
            // Calculate listening time
            const listenedMinutes = (audio.duration || 0) / 60;
            const today = new Date().toISOString();

            // Update streak in local storage
            storage.update(prev => {
                const isSameDay = (d1: string | null, d2: string) =>
                    d1?.split('T')[0] === d2.split('T')[0];

                const isConsecutive = (d1: string | null, d2: string) => {
                    if (!d1) return true;
                    const diff = new Date(d2).getTime() - new Date(d1).getTime();
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    return days === 1;
                };

                const next = { ...prev };

                // Reset daily minutes if new day
                if (!isSameDay(next.streak.lastUpdated, today)) {
                    next.streak.todayMinutes = 0;
                }

                next.streak.todayMinutes += listenedMinutes;
                next.streak.totalMinutes += listenedMinutes;
                next.streak.lastUpdated = today;

                // Update streak count
                if (!next.streak.lastListenedDate) {
                    next.streak.current = 1;
                    next.streak.longest = 1;
                } else if (isSameDay(next.streak.lastListenedDate, today)) {
                    // Same day, no streak change
                } else if (isConsecutive(next.streak.lastListenedDate, today)) {
                    next.streak.current += 1;
                    if (next.streak.current > next.streak.longest) {
                        next.streak.longest = next.streak.current;
                    }
                } else {
                    next.streak.current = 1; // Broken streak
                }

                next.streak.lastListenedDate = today;

                // Check achievements
                const newAchievements = [...next.achievements];
                const thresholds: Record<string, number> = {
                    'fire-starter': 3,
                    'week-warrior': 7,
                    'diamond-devotee': 30,
                    'century-chanter': 100,
                    'yearly-yogi': 365
                };

                Object.entries(thresholds).forEach(([id, days]) => {
                    if (next.streak.current >= days && !newAchievements.includes(id)) {
                        newAchievements.push(id);
                    }
                });
                next.achievements = newAchievements;

                return next;
            });

            setState(prev => {
                if (prev.currentLecture && onLectureComplete) {
                    onLectureComplete(prev.currentLecture);
                }
                return { ...prev, isPlaying: false, currentTime: 0, sleepTimerMinutes: null, sleepTimerEndsAt: null };
            });
        };

        const handlePlay = () => {
            startTimeRef.current = Date.now();
            setState(prev => ({ ...prev, isPlaying: true }));
        };

        const handlePause = () => {
            setState(prev => ({ ...prev, isPlaying: false }));
        };

        const handleRateChange = () => {
            setState(prev => ({ ...prev, playbackRate: audio.playbackRate }));
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ratechange', handleRateChange);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ratechange', handleRateChange);
            audio.pause();
            audio.src = '';
        };
    }, [onLectureComplete]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        window.localStorage.setItem(
            AUDIO_PREFERENCES_KEY,
            JSON.stringify({
                volume: state.volume,
                isMuted: state.isMuted,
                playbackRate: state.playbackRate,
            })
        );
    }, [state.isMuted, state.playbackRate, state.volume]);

    useEffect(() => {
        if (!state.sleepTimerEndsAt) return;
        const sleepTimerEndsAt = state.sleepTimerEndsAt;

        const interval = window.setInterval(() => {
            const remainingMs = sleepTimerEndsAt - Date.now();

            if (remainingMs <= 0) {
                audioRef.current?.pause();
                setState(prev => ({
                    ...prev,
                    isPlaying: false,
                    sleepTimerMinutes: null,
                    sleepTimerEndsAt: null,
                }));
                window.clearInterval(interval);
                return;
            }

            const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60000));
            setState(prev => (
                prev.sleepTimerMinutes === remainingMinutes
                    ? prev
                    : { ...prev, sleepTimerMinutes: remainingMinutes }
            ));
        }, 1000);

        return () => window.clearInterval(interval);
    }, [state.sleepTimerEndsAt]);

    const play = useCallback((lecture: AnyLecture) => {
        const audio = audioRef.current;
        if (!audio) return;

        // If same lecture, just resume
        if (state.currentLecture?.id === lecture.id && audio.src) {
            audio.play().catch(console.error);
            return;
        }

        // Load new lecture
        audio.src = lecture.audioUrl;
        // Restore playback rate
        audio.playbackRate = state.playbackRate;

        setState(prev => ({
            ...prev,
            currentLecture: lecture,
            currentTime: 0,
            duration: 0,
        }));
        audio.play().catch(console.error);
    }, [state.currentLecture?.id, state.playbackRate]);

    const pause = useCallback(() => {
        audioRef.current?.pause();
    }, []);

    const resume = useCallback(() => {
        audioRef.current?.play().catch(console.error);
    }, []);

    const stop = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            audio.src = '';
        }
        setState(prev => ({
            ...prev,
            currentLecture: null,
            isPlaying: false,
            currentTime: 0,
            duration: 0,
        }));
    }, []);

    const seek = useCallback((time: number) => {
        const audio = audioRef.current;
        if (audio && !isNaN(time)) {
            audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0));
        }
    }, []);

    const setVolume = useCallback((volume: number) => {
        const audio = audioRef.current;
        if (audio) {
            audio.volume = volume;
            audio.muted = volume === 0;
            setState(prev => ({ ...prev, volume, isMuted: volume === 0 }));
        }
    }, []);

    const toggleMute = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.muted = !audio.muted;
            setState(prev => ({ ...prev, isMuted: audio.muted }));
        }
    }, []);

    const skip = useCallback((seconds: number) => {
        const audio = audioRef.current;
        if (audio) {
            let newTime = audio.currentTime + seconds;
            // Prevent seeking beyond duration or before 0
            newTime = Math.max(0, Math.min(newTime, audio.duration || 0));
            audio.currentTime = newTime;
        }
    }, []);

    const setPlaybackRate = useCallback((rate: number) => {
        const audio = audioRef.current;
        if (audio) {
            audio.playbackRate = rate;
            setState(prev => ({ ...prev, playbackRate: rate }));
        }
    }, []);

    const setSleepTimer = useCallback((minutes: number | null) => {
        setState(prev => ({
            ...prev,
            sleepTimerMinutes: minutes,
            sleepTimerEndsAt: minutes ? Date.now() + minutes * 60 * 1000 : null,
        }));
    }, []);

    const value: AudioContextType = {
        ...state,
        play,
        pause,
        resume,
        stop,
        seek,
        setVolume,
        toggleMute,
        skip,
        setPlaybackRate,
        setSleepTimer,
    };

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
}
