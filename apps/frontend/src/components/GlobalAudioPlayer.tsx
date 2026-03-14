'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, X, ChevronUp, ChevronDown, MoonStar, Gauge } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { collectionDefinitions } from '@/lib/library';

export function GlobalAudioPlayer() {
    const audio = useAudio();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const speedOptions = [0.75, 1, 1.25, 1.5, 2];
    const sleepOptions = [10, 20, 30, 45];

    // Don't render if no lecture is loaded
    if (!audio.currentLecture) return null;

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progress = audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0;
    const sleepTimerCountdown = audio.sleepTimerEndsAt
        ? Math.max(0, Math.ceil((audio.sleepTimerEndsAt - Date.now()) / 1000))
        : null;

    const formatCountdown = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audio.duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.seek(percent * audio.duration);
    };

    const libraryHref = `/lectures?speaker=${audio.currentLecture.speakerSlug}&collection=${audio.currentLecture.collection}`;

    if (isMinimized) {
        // Minimized floating button
        return (
            <button
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-sage-500 to-sage-600 text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 sm:bottom-6 sm:right-6"
            >
                {audio.isPlaying ? (
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full animate-ping opacity-30 bg-white" />
                        <Pause className="w-6 h-6" />
                    </div>
                ) : (
                    <Play className="w-6 h-6 ml-0.5" />
                )}
            </button>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            <div className="mx-1 mb-1 rounded-[22px] border border-[color:var(--card-border)] bg-[color:var(--card-bg)]/95 backdrop-blur-xl shadow-[var(--card-shadow-hover)] sm:mx-4 sm:mb-2 sm:rounded-[28px]">
                {/* Progress bar at top */}
                <div
                    className="h-1.5 bg-neutral-200 dark:bg-neutral-700 cursor-pointer group rounded-t-[22px] overflow-hidden sm:rounded-t-[28px]"
                    onClick={handleSeek}
                >
                    <div
                        className="h-full bg-gradient-to-r from-lotus-500 via-sand-500 to-sky-500 transition-all duration-150 relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-sand-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4">
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Play controls */}
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                onClick={() => audio.skip(-15)}
                                className="btn-icon hidden sm:inline-flex"
                                title="Skip back 15s"
                            >
                                <SkipBack className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => audio.isPlaying ? audio.pause() : audio.resume()}
                                className="w-12 h-12 rounded-full flex items-center justify-center transition-all bg-gradient-to-br from-lotus-500 to-sand-500 hover:from-lotus-600 hover:to-sand-600 text-white shadow-md hover:shadow-lg"
                            >
                                {audio.isPlaying ? (
                                    <Pause className="w-5 h-5" />
                                ) : (
                                    <Play className="w-5 h-5 ml-0.5" />
                                )}
                            </button>

                            <button
                                onClick={() => audio.skip(15)}
                                className="btn-icon"
                                title="Skip forward 15s"
                            >
                                <SkipForward className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Time */}
                        <div className="text-[11px] text-foreground-muted font-medium tabular-nums min-w-[72px] sm:text-xs sm:min-w-[100px]">
                            {formatTime(audio.currentTime)} / {formatTime(audio.duration)}
                        </div>

                        {/* Lecture info */}
                        <div className="flex-1 min-w-0">
                            <Link
                                href={libraryHref}
                                className="block group"
                            >
                                <p className="text-sm font-medium text-foreground truncate group-hover:text-sage-600 dark:group-hover:text-sage-400 transition-colors">
                                    {audio.currentLecture.title}
                                </p>
                                <p className="text-xs text-foreground-muted truncate">
                                    {audio.currentLecture.speakerName} • {collectionDefinitions[audio.currentLecture.collection].label}
                                </p>
                            </Link>
                        </div>

                        {/* Playback Speed */}
                        <div className="relative hidden md:block">
                            <button
                                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                                className="btn-icon text-xs font-medium w-9"
                                title="Playback Speed"
                            >
                                {audio.playbackRate}x
                            </button>

                            {showSpeedMenu && (
                                <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-700 py-1 min-w-[100px] z-50">
                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                        <button
                                            key={rate}
                                            onClick={() => {
                                                audio.setPlaybackRate(rate);
                                                setShowSpeedMenu(false);
                                            }}
                                            className={`w-full px-4 py-2 text-sm text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 ${audio.playbackRate === rate ? 'text-sage-600 dark:text-sage-400 font-medium' : 'text-foreground'}`}
                                        >
                                            {rate}x
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Volume */}
                        <div className="hidden md:flex items-center gap-2">
                            <button
                                onClick={() => audio.toggleMute()}
                                className="text-foreground-muted hover:text-foreground transition-colors"
                            >
                                {audio.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={audio.isMuted ? 0 : audio.volume}
                                onChange={(e) => audio.setVolume(parseFloat(e.target.value))}
                                className="w-20"
                            />
                        </div>

                        {/* Expand/minimize controls */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="btn-icon"
                                title={isExpanded ? 'Collapse' : 'Expand'}
                            >
                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => setIsMinimized(true)}
                                className="btn-icon"
                                title="Minimize"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                            <div className="flex items-start gap-4">
                                {/* Chapter badge */}
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lotus-100 to-sand-100 dark:from-lotus-900/40 dark:to-sand-900/30 flex items-center justify-center text-lotus-700 dark:text-sand-300 font-bold text-sm text-center px-2 flex-shrink-0">
                                    {collectionDefinitions[audio.currentLecture.collection].shortLabel}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-foreground mb-1">
                                        {audio.currentLecture.title}
                                    </h4>
                                    <p className="text-sm text-foreground-muted">
                                        {audio.currentLecture.speakerName}
                                        {audio.currentLecture.location ? ` • ${audio.currentLecture.location}` : ''}
                                        {audio.currentLecture.date ? ` • ${audio.currentLecture.date}` : ''}
                                    </p>

                                    <div className="mt-3 flex items-center gap-3">
                                        <Link
                                            href={libraryHref}
                                            className="text-sm text-sage-600 dark:text-sage-400 hover:underline"
                                        >
                                            View in library →
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                                <div className="rounded-2xl border border-neutral-200/80 bg-white/75 p-4 dark:border-neutral-700 dark:bg-neutral-800/70">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                                        <Gauge className="h-4 w-4 text-sky-600" />
                                        Playback controls
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="mb-2 flex items-center justify-between text-xs text-foreground-muted">
                                                <span>Speed</span>
                                                <span>{audio.playbackRate}x</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {speedOptions.map((rate) => (
                                                    <button
                                                        key={rate}
                                                        onClick={() => audio.setPlaybackRate(rate)}
                                                        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                                                            audio.playbackRate === rate
                                                                ? 'bg-sky-600 text-white'
                                                                : 'border border-neutral-200 bg-white text-foreground-muted hover:border-sky-200 hover:text-foreground dark:border-neutral-700 dark:bg-neutral-800'
                                                        }`}
                                                    >
                                                        {rate}x
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="mb-2 flex items-center justify-between text-xs text-foreground-muted">
                                                <span>Volume</span>
                                                <span>{Math.round((audio.isMuted ? 0 : audio.volume) * 100)}%</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => audio.toggleMute()}
                                                    className="btn-icon shrink-0"
                                                    title={audio.isMuted ? 'Unmute' : 'Mute'}
                                                >
                                                    {audio.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                                </button>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.05"
                                                    value={audio.isMuted ? 0 : audio.volume}
                                                    onChange={(e) => audio.setVolume(parseFloat(e.target.value))}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-neutral-200/80 bg-white/75 p-4 dark:border-neutral-700 dark:bg-neutral-800/70">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                                        <MoonStar className="h-4 w-4 text-sand-600" />
                                        Sleep timer
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {sleepOptions.map((minutes) => (
                                            <button
                                                key={minutes}
                                                onClick={() => audio.setSleepTimer(minutes)}
                                                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                                                    audio.sleepTimerMinutes === minutes
                                                        ? 'bg-sand-500 text-white'
                                                        : 'border border-neutral-200 bg-white text-foreground-muted hover:border-sand-200 hover:text-foreground dark:border-neutral-700 dark:bg-neutral-800'
                                                }`}
                                            >
                                                {minutes} min
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => audio.setSleepTimer(null)}
                                            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-foreground-muted transition-colors hover:border-neutral-300 hover:text-foreground dark:border-neutral-700 dark:bg-neutral-800"
                                        >
                                            Off
                                        </button>
                                    </div>

                                    <p className="mt-3 text-xs text-foreground-muted">
                                        {sleepTimerCountdown !== null
                                            ? `Playback will pause in ${formatCountdown(sleepTimerCountdown)}.`
                                            : audio.sleepTimerMinutes
                                            ? `Playback will pause in about ${audio.sleepTimerMinutes} minute${audio.sleepTimerMinutes === 1 ? '' : 's'}.`
                                            : 'Set a timer if you want playback to stop automatically.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
