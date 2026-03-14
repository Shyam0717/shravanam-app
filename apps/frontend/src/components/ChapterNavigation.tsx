'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { Lecture } from '@/types/Lecture';

interface ChapterNavigationProps {
    chapters: number[];
    selectedChapter: number | null;
    onChapterSelect: (chapter: number | null) => void;
    lecturesByChapter: Record<number, Lecture[]>;
    listenedIds: number[];
}

export function ChapterNavigation({
    chapters,
    selectedChapter,
    onChapterSelect,
    lecturesByChapter,
    listenedIds
}: ChapterNavigationProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Calculate total stats
    const totalLectures = Object.values(lecturesByChapter).reduce((sum, lectures) => sum + lectures.length, 0);
    const totalListened = Object.values(lecturesByChapter).reduce((sum, lectures) => {
        return sum + lectures.filter(l => listenedIds.includes(l.id)).length;
    }, 0);
    const overallProgress = totalLectures > 0 ? Math.round((totalListened / totalLectures) * 100) : 0;

    return (
        <div className="glass-card p-5 sticky top-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sage-100 dark:bg-sage-900 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-sage-600 dark:text-sage-400" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-foreground">Chapters</h2>
                        <p className="text-xs text-foreground-muted">{overallProgress}% complete</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="btn-icon"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {/* Overall progress bar */}
            <div className="mb-4">
                <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-sage-400 to-sage-500 rounded-full transition-all duration-500"
                        style={{ width: `${overallProgress}%` }}
                    />
                </div>
            </div>

            {!isCollapsed && (
                <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
                    {/* All Chapters option */}
                    <button
                        onClick={() => onChapterSelect(null)}
                        className={`chapter-item ${selectedChapter === null ? 'active' : ''}`}
                    >
                        <span>All Chapters</span>
                        <span className="badge text-xs">
                            {totalLectures}
                        </span>
                    </button>

                    {/* Individual chapters */}
                    {chapters.map(chapter => {
                        const lectures = lecturesByChapter[chapter] || [];
                        const listenedCount = lectures.filter(l => listenedIds.includes(l.id)).length;
                        const total = lectures.length;
                        const chapterProgress = total > 0 ? Math.round((listenedCount / total) * 100) : 0;
                        const isComplete = listenedCount === total && total > 0;

                        return (
                            <button
                                key={chapter}
                                onClick={() => onChapterSelect(chapter)}
                                className={`chapter-item ${selectedChapter === chapter ? 'active' : ''}`}
                            >
                                <div className="flex items-center gap-2">
                                    {isComplete ? (
                                        <div className="w-5 h-5 rounded-full bg-sage-500 text-white flex items-center justify-center">
                                            <Check className="w-3 h-3" />
                                        </div>
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-[10px] font-bold text-foreground-muted">
                                            {chapter}
                                        </div>
                                    )}
                                    <span>Chapter {chapter}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-foreground-muted">
                                        {listenedCount}/{total}
                                    </span>
                                    {chapterProgress > 0 && !isComplete && (
                                        <div className="w-10 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-sage-400 rounded-full"
                                                style={{ width: `${chapterProgress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
