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
}

const AudioContext = createContext<AudioContextType | null>(null);

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
    });

    // Initialize audio element
    useEffect(() => {
        const audio = new Audio();
        audio.preload = 'metadata';
        audioRef.current = audio;

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
                return { ...prev, isPlaying: false, currentTime: 0 };
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
        audio.load();
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
    };

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
}
