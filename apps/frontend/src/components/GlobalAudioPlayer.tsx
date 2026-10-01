'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, X, ChevronUp, ChevronDown, MoonStar, Gauge, RotateCcw, RotateCw, BookOpen } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { collectionDefinitions } from '@/lib/library';

const formatTime = (time: number) => {
    if (isNaN(time) || !Number.isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatDate = (dateStr: string) => {
    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export function GlobalAudioPlayer() {
    const audio = useAudio();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const speedOptions = [0.75, 1, 1.25, 1.5, 2];
    const sleepOptions = [10, 20, 30, 45];

    useEffect(() => {
        if (!audio.currentLecture) setIsExpanded(false);
    }, [audio.currentLecture]);

    // Phones show the expanded player as a full-screen page: stop the page behind it from
    // scrolling, and let Escape close it.
    useEffect(() => {
        if (!isExpanded || !window.matchMedia('(max-width: 767px)').matches) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsExpanded(false);
        };
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isExpanded]);

    // Don't render if no lecture is loaded
    if (!audio.currentLecture) return null;

    const lecture = audio.currentLecture;
    const collection = collectionDefinitions[lecture.collection];
    const progress = audio.duration > 0 ? (audio.currentTime / audio.duration) * 100 : 0;
    const sleepTimerCountdown = audio.sleepTimerEndsAt
        ? Math.max(0, Math.ceil((audio.sleepTimerEndsAt - Date.now()) / 1000))
        : null;

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audio.duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.seek(percent * audio.duration);
    };

    const togglePlay = () => (audio.isPlaying ? audio.pause() : audio.resume());

    const libraryHref = `/lectures?speaker=${lecture.speakerSlug}&collection=${lecture.collection}`;

    const sleepTimerMessage = sleepTimerCountdown !== null
        ? `Playback will pause in ${formatTime(sleepTimerCountdown)}.`
        : audio.sleepTimerMinutes
            ? `Playback will pause in about ${audio.sleepTimerMinutes} minute${audio.sleepTimerMinutes === 1 ? '' : 's'}.`
            : 'Set a timer if you want playback to stop automatically.';

    const speedButtons = speedOptions.map((rate) => (
        <button
            key={rate}
            onClick={() => audio.setPlaybackRate(rate)}
            aria-pressed={audio.playbackRate === rate}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                audio.playbackRate === rate
                    ? 'bg-sky-600 text-white'
                    : 'border border-neutral-200 bg-white text-foreground-muted hover:border-sky-200 hover:text-foreground dark:border-neutral-700 dark:bg-neutral-800'
            }`}
        >
            {rate}x
        </button>
    ));

    const sleepButtons = (
        <>
            {sleepOptions.map((minutes) => (
                <button
                    key={minutes}
                    onClick={() => audio.setSleepTimer(minutes)}
                    aria-pressed={audio.sleepTimerMinutes === minutes}
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
        </>
    );

    if (isMinimized) {
        // Minimized floating button (sits above the tab bar on phones)
        return (
            <button
                onClick={() => setIsMinimized(false)}
                aria-label="Show player"
                className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-sage-500 to-sage-600 text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 md:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] md:right-6"
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
        <>
            {/* Phones: mini player above the tab bar. Tapping the lecture opens Now Playing. */}
            <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-50 px-2 pb-2 md:hidden">
                <div className="overflow-hidden rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card-bg)]/95 shadow-[var(--card-shadow-hover)] backdrop-blur-xl">
                    <div className="h-0.5 bg-[color:var(--track)]">
                        <div
                            className="h-full bg-gradient-to-r from-lotus-500 via-sand-500 to-sky-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex items-center gap-2 py-2 pl-2 pr-1.5">
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 text-left"
                            aria-label={`Open player: ${lecture.title}`}
                        >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 via-sage-500 to-lotus-500 text-[11px] font-bold text-white">
                                {collection.shortLabel}
                            </span>
                            <span className="min-w-0">
                                <span className="block truncate text-sm font-medium text-foreground">{lecture.title}</span>
                                <span className="block truncate text-xs text-foreground-muted">{lecture.speakerName}</span>
                            </span>
                        </button>

                        <button
                            onClick={togglePlay}
                            aria-label={audio.isPlaying ? 'Pause' : 'Play'}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lotus-500 to-sand-500 text-white shadow-md"
                        >
                            {audio.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                        </button>
                        <button
                            onClick={() => setIsMinimized(true)}
                            aria-label="Minimize player"
                            className="flex h-10 w-9 shrink-0 items-center justify-center text-foreground-muted"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Phones: full-screen Now Playing */}
            {isExpanded && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Now playing"
                    className="fixed inset-0 z-[60] flex flex-col overflow-y-auto overscroll-contain bg-[color:var(--background)] px-5 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:hidden"
                >
                    <div className="flex items-center justify-between">
                        <button onClick={() => setIsExpanded(false)} className="btn-icon" aria-label="Close player">
                            <ChevronDown className="w-5 h-5" />
                        </button>
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-foreground-muted">Now playing</p>
                        <span className="w-10" aria-hidden="true" />
                    </div>

                    <div className="mx-auto mt-4 flex aspect-square w-full max-w-[min(15rem,30vh)] shrink-0 flex-col items-center justify-center gap-3 rounded-[28px] bg-gradient-to-br from-sky-600 via-sage-500 to-lotus-500 text-white shadow-[var(--card-shadow-hover)]">
                        <BookOpen className="h-14 w-14" strokeWidth={1.5} />
                        <span className="px-4 text-center text-xs font-semibold uppercase tracking-[0.18em]">{collection.label}</span>
                    </div>

                    <div className="mt-6">
                        <h2 className="text-xl font-semibold leading-snug text-foreground line-clamp-3">{lecture.title}</h2>
                        <p className="mt-1 text-foreground-muted">{lecture.speakerName}</p>
                        <p className="mt-0.5 text-sm text-foreground-muted">
                            {[lecture.location, lecture.date ? formatDate(lecture.date) : ''].filter(Boolean).join(' · ')}
                        </p>
                    </div>

                    <div className="mt-5">
                        <SeekBar currentTime={audio.currentTime} duration={audio.duration} onSeek={audio.seek} />
                        <div className="flex justify-between text-xs font-medium tabular-nums text-foreground-muted">
                            <span>{formatTime(audio.currentTime)}</span>
                            <span>-{formatTime(Math.max(0, audio.duration - audio.currentTime))}</span>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-8">
                        <button
                            onClick={() => audio.skip(-15)}
                            aria-label="Back 15 seconds"
                            className="relative flex h-14 w-14 items-center justify-center text-foreground"
                        >
                            <RotateCcw className="h-8 w-8" strokeWidth={1.75} />
                            <span className="absolute pt-0.5 text-[10px] font-bold">15</span>
                        </button>
                        <button
                            onClick={togglePlay}
                            aria-label={audio.isPlaying ? 'Pause' : 'Play'}
                            className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-gradient-to-br from-lotus-500 to-sand-500 text-white shadow-lg"
                        >
                            {audio.isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                        </button>
                        <button
                            onClick={() => audio.skip(15)}
                            aria-label="Forward 15 seconds"
                            className="relative flex h-14 w-14 items-center justify-center text-foreground"
                        >
                            <RotateCw className="h-8 w-8" strokeWidth={1.75} />
                            <span className="absolute pt-0.5 text-[10px] font-bold">15</span>
                        </button>
                    </div>

                    <div className="mt-8 space-y-5">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                                <Gauge className="h-4 w-4 text-sky-600" />
                                Speed
                            </div>
                            <div className="flex flex-wrap gap-2">{speedButtons}</div>
                        </div>
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                                <MoonStar className="h-4 w-4 text-sand-600" />
                                Sleep timer
                            </div>
                            <div className="flex flex-wrap gap-2">{sleepButtons}</div>
                            <p className="mt-2 text-xs text-foreground-muted">{sleepTimerMessage}</p>
                        </div>
                    </div>

                    <Link
                        href={libraryHref}
                        onClick={() => setIsExpanded(false)}
                        className="mt-8 self-center text-sm font-medium text-sage-600 dark:text-sage-400"
                    >
                        View in library →
                    </Link>
                </div>
            )}

            {/* Tablets and desktop */}
            <div className="fixed bottom-0 left-0 right-0 z-50 hidden pb-[env(safe-area-inset-bottom)] md:block">
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
                                    onClick={togglePlay}
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
                                        {lecture.title}
                                    </p>
                                    <p className="text-xs text-foreground-muted truncate">
                                        {lecture.speakerName} • {collection.label}
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
                            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 max-h-[60vh] overflow-y-auto">
                                <div className="flex items-start gap-4">
                                    {/* Chapter badge */}
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lotus-100 to-sand-100 dark:from-lotus-900/40 dark:to-sand-900/30 flex items-center justify-center text-lotus-700 dark:text-sand-300 font-bold text-sm text-center px-2 flex-shrink-0">
                                        {collection.shortLabel}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-foreground mb-1">
                                            {lecture.title}
                                        </h4>
                                        <p className="text-sm text-foreground-muted">
                                            {lecture.speakerName}
                                            {lecture.location ? ` • ${lecture.location}` : ''}
                                            {lecture.date ? ` • ${formatDate(lecture.date)}` : ''}
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
                                                <div className="flex flex-wrap gap-2">{speedButtons}</div>
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

                                        <div className="flex flex-wrap gap-2">{sleepButtons}</div>

                                        <p className="mt-3 text-xs text-foreground-muted">{sleepTimerMessage}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// Draggable seek bar. While the thumb is being dragged it follows the finger, and the audio only
// seeks on release, so a streaming lecture isn't re-buffered for every pixel of movement.
function SeekBar({ currentTime, duration, onSeek }: { currentTime: number; duration: number; onSeek: (time: number) => void }) {
    const [dragValue, setDragValue] = useState<number | null>(null);
    // Pointer and touch release can both fire; the ref makes sure we seek once.
    const dragValueRef = useRef<number | null>(null);

    const max = Number.isFinite(duration) && duration > 0 ? duration : 0;
    const value = Math.min(dragValue ?? currentTime, max);

    const commit = () => {
        const target = dragValueRef.current;
        if (target === null) return;
        dragValueRef.current = null;
        setDragValue(null);
        onSeek(target);
    };

    return (
        <input
            type="range"
            min={0}
            max={max}
            step={1}
            value={value}
            disabled={!max}
            onChange={(e) => {
                dragValueRef.current = Number(e.target.value);
                setDragValue(dragValueRef.current);
            }}
            onPointerUp={commit}
            onTouchEnd={commit}
            onKeyUp={commit}
            onBlur={commit}
            aria-label="Seek"
            aria-valuetext={`${formatTime(value)} of ${formatTime(max)}`}
            className="seek-slider"
            style={{ '--progress': `${max ? (value / max) * 100 : 0}%` } as React.CSSProperties}
        />
    );
}
