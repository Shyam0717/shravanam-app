'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';

interface AudioPlayerProps {
    src: string;
    onPlay: () => void;
    onPause: () => void;
    isPlaying: boolean;
    compact?: boolean;
}

export function AudioPlayer({ src, onPlay, onPause, isPlaying, compact = false }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isAudioLoaded, setIsAudioLoaded] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);

    useEffect(() => {
        const audio = new Audio();
        audioRef.current = audio;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => onPause();

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
        };
    }, [onPause]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            if (!isAudioLoaded) {
                audio.src = src;
                audio.preload = 'metadata';
                setIsAudioLoaded(true);
            }
            audio.play().catch(console.error);
        } else {
            audio.pause();
        }
    }, [isPlaying, src, isAudioLoaded]);

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isAudioLoaded || !duration || !audioRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioRef.current.currentTime = percent * duration;
    };

    const toggleMute = () => {
        if (!audioRef.current) return;
        audioRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return;
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        audioRef.current.volume = newVolume;
    };

    const handleSpeedChange = (rate: number) => {
        if (!audioRef.current) return;
        audioRef.current.playbackRate = rate;
        setPlaybackRate(rate);
        setShowSpeedMenu(false);
    };

    const skip = (seconds: number) => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className={`space-y-3 ${compact ? 'py-2' : ''}`}>
            {/* Main controls row */}
            <div className="flex items-center gap-3">
                {/* Skip back */}
                <button
                    onClick={() => skip(-15)}
                    className="btn-icon opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Skip back 15s"
                >
                    <SkipBack className="w-4 h-4" />
                </button>

                {/* Play/Pause button */}
                <button
                    onClick={isPlaying ? onPause : onPlay}
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 bg-gradient-to-br from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
                >
                    {isPlaying ? (
                        <Pause className="w-5 h-5" />
                    ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                    )}
                </button>

                {/* Skip forward */}
                <button
                    onClick={() => skip(15)}
                    className="btn-icon opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Skip forward 15s"
                >
                    <SkipForward className="w-4 h-4" />
                </button>

                {/* Progress bar */}
                <div className="flex-1">
                    <div
                        className={`h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full cursor-pointer hover:h-2 transition-all duration-200 relative overflow-hidden ${!isAudioLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleSeek}
                    >
                        <div
                            className="h-full bg-gradient-to-r from-sage-400 to-sage-500 rounded-full transition-all duration-150"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Time display */}
                <div className="text-xs text-foreground-muted min-w-[85px] text-right font-medium tabular-nums">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </div>
            </div>

            {/* Volume and Speed controls */}
            <div className="flex items-center justify-between pl-14">
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleMute}
                        className="text-foreground-muted hover:text-foreground transition-colors"
                    >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-20"
                    />
                </div>

                {/* Playback Speed */}
                <div className="relative">
                    <button
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="btn-icon text-xs font-medium w-9"
                        title="Playback Speed"
                    >
                        {playbackRate}x
                    </button>

                    {showSpeedMenu && (
                        <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 py-1 min-w-[100px] z-50">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                <button
                                    key={rate}
                                    onClick={() => handleSpeedChange(rate)}
                                    className={`w-full px-4 py-2 text-sm text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 ${playbackRate === rate ? 'text-sage-600 dark:text-sage-400 font-medium' : 'text-foreground'}`}
                                >
                                    {rate}x
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
