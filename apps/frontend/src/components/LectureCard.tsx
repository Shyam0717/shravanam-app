'use client';

import { useState } from 'react';
import { Play, Pause, CheckCircle2, Bookmark, ExternalLink, FileText, ChevronDown, ChevronUp, Brain, BookOpen } from 'lucide-react';
import { AnyLecture } from '@/types/Lecture';
import { useAudio } from '@/contexts/AudioContext';
import { NotesModal } from './NotesModal';
import { collectionDefinitions } from '@/lib/library';

interface LectureCardProps {
    lecture: AnyLecture;
    listened: boolean;
    bookmarked: boolean;
    notes: string;
    onToggleListened: () => void;
    onToggleBookmarked: () => void;
    onNotesSave: (notes: string) => void;
}

export function LectureCard({
    lecture,
    listened,
    bookmarked,
    notes,
    onToggleListened,
    onToggleBookmarked,
    onNotesSave
}: LectureCardProps) {
    const { play, pause, currentLecture, isPlaying: audioIsPlaying } = useAudio();
    const [isExpanded, setIsExpanded] = useState(false);
    const [notesModalOpen, setNotesModalOpen] = useState(false);

    const isPlaying = currentLecture?.id === lecture.id && audioIsPlaying;

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'Date unknown';
        try {
            const parsed = new Date(dateStr);
            if (Number.isNaN(parsed.getTime())) {
                return dateStr;
            }
            return parsed.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const getPrimaryBadge = () => {
        if (lecture.collection === 'sb' && lecture.canto) return `Canto ${lecture.canto}`;
        if (lecture.collection === 'qa') return collectionDefinitions.qa.shortLabel;
        if (lecture.chapter) return `Ch. ${lecture.chapter}`;
        return collectionDefinitions[lecture.collection].shortLabel;
    };

    const getSecondaryBadge = () => {
        if (lecture.collection === 'sb' && lecture.verse) return lecture.verse;
        if (lecture.collection === 'bg' && lecture.verseRange) return lecture.verseRange;
        if (lecture.section && lecture.collection !== 'qa') return lecture.section;
        return '';
    };

    const getReferenceLink = () => {
        if (lecture.collection === 'bg' && lecture.chapter) {
            return {
                href: `https://vedabase.io/en/library/bg/${lecture.chapter}/`,
                label: 'Vedabase',
            };
        }

        if (lecture.collection === 'sb' && lecture.canto && lecture.chapter) {
            return {
                href: `https://vedabase.io/en/library/sb/${lecture.canto}/${lecture.chapter}/`,
                label: 'Vedabase',
            };
        }

        return null;
    };

    const getSecondaryLink = () => {
        if (lecture.collection === 'bg' && lecture.chapter) {
            return {
                href: `https://www.bhagavadgita.com/chapter-${lecture.chapter}/`,
                label: 'BhagavadGita.com',
            };
        }

        return null;
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            pause();
        } else {
            play(lecture);
        }
    };

    return (
        <>
            <div
                className={`glass-card overflow-hidden group transition-all duration-300 ${listened
                    ? 'ring-2 ring-sage-200 dark:ring-sage-800'
                    : ''
                    } ${isPlaying ? 'ring-2 ring-sage-400 shadow-lg' : ''}`}
            >
                <div className="p-5">
                    {/* Card Header - Clickable for expand */}
                    <div
                        className="cursor-pointer"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {/* Top row: Chapter badge and actions */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="badge">
                                    {getPrimaryBadge()}
                                </span>
                                {getSecondaryBadge() && (
                                    <span className="badge badge-accent">
                                        {getSecondaryBadge()}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-1">
                                {/* Bookmark button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleBookmarked();
                                    }}
                                    className={`btn-icon ${bookmarked ? 'active text-sand-600' : ''}`}
                                >
                                    <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                                </button>

                                {/* Expand button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsExpanded(!isExpanded);
                                    }}
                                    className="btn-icon"
                                >
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-sage-700 dark:group-hover:text-sage-300 transition-colors">
                            {lecture.title}
                        </h3>

                        {/* Location & Date */}
                        <div className="flex items-center gap-3 text-sm text-foreground-muted mb-4">
                            <span>{lecture.speakerName}</span>
                            {lecture.location && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        📍 {lecture.location}
                                    </span>
                                </>
                            )}
                            {lecture.date && (
                                <>
                                    <span>•</span>
                                    <span>{formatDate(lecture.date)}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Simple Play Button - Triggers Global Player */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePlayPause();
                            }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${isPlaying
                                ? 'bg-gradient-to-br from-sage-600 to-sage-700 text-white shadow-lg'
                                : 'bg-gradient-to-br from-sage-500 to-sage-600 hover:from-sage-600 hover:to-sage-700 text-white shadow-md hover:shadow-lg hover:scale-105'
                                }`}
                        >
                            {isPlaying ? (
                                <Pause className="w-5 h-5 fill-current" />
                            ) : (
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                            )}
                        </button>

                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-foreground">
                                    {isPlaying ? 'Playing now' : 'Listen'}
                                </span>
                            </div>
                        </div>

                        {/* Status Indicators */}
                        <div className="flex items-center gap-2">
                            {listened && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleListened();
                                    }}
                                    className="text-sage-600 dark:text-sage-400"
                                    title="Marked as listened"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                </button>
                            )}
                            {!listened && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleListened();
                                    }}
                                    className="text-foreground-muted hover:text-sage-600 dark:hover:text-sage-400"
                                    title="Mark as listened"
                                >
                                    <CheckCircle2 className="w-5 h-5 opacity-50 hover:opacity-100" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800 p-5 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid gap-4">
                            {/* Summary Section - Placeholder if summary existed */}
                            {lecture.summary && (
                                <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-xl border border-sky-100 dark:border-sky-800/50">
                                    <div className="flex items-center gap-2 mb-2 text-sky-700 dark:text-sky-300 font-medium">
                                        <Brain className="w-4 h-4" />
                                        AI Summary
                                    </div>
                                    <p className="text-sm text-foreground-muted leading-relaxed">
                                        {lecture.summary}
                                    </p>
                                </div>
                            )}

                            {/* Actions Row */}
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    onClick={() => setNotesModalOpen(true)}
                                    className="btn-secondary text-sm py-1.5 h-auto"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    {notes ? 'Edit Notes' : 'Add Notes'}
                                </button>

                                {getReferenceLink() && (
                                    <a
                                        href={getReferenceLink()!.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-ghost text-sm py-1.5 h-auto"
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        {getReferenceLink()!.label}
                                    </a>
                                )}

                                {getSecondaryLink() && (
                                    <a
                                        href={getSecondaryLink()!.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-ghost text-sm py-1.5 h-auto"
                                    >
                                        <BookOpen className="w-4 h-4 mr-2" />
                                        {getSecondaryLink()!.label}
                                    </a>
                                )}
                            </div>

                            {/* Notes Preview */}
                            {notes && (
                                <div className="p-3 rounded-lg bg-sand-50 dark:bg-sand-900/30 text-sm text-foreground-muted italic border border-sand-200/50 dark:border-sand-800/50">
                                    &quot;{notes}&quot;
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <NotesModal
                isOpen={notesModalOpen}
                onClose={() => setNotesModalOpen(false)}
                onSave={onNotesSave}
                notes={notes}
                lectureTitle={`Notes: ${lecture.title}`}
            />
        </>
    );
}
