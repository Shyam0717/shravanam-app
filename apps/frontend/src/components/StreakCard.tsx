'use client';

import { Flame, Trophy, Target, Zap, Crown, Gem } from 'lucide-react';
import { useUserStorage } from '@/lib/useUserStorage';

const ACHIEVEMENT_INFO: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
    'fire-starter': { icon: Flame, label: '3-Day Streak', color: 'text-orange-500' },
    'week-warrior': { icon: Zap, label: '7-Day Streak', color: 'text-yellow-500' },
    'diamond-devotee': { icon: Gem, label: '30-Day Streak', color: 'text-sky-400' },
    'century-chanter': { icon: Trophy, label: '100-Day Streak', color: 'text-purple-500' },
    'yearly-yogi': { icon: Crown, label: '365-Day Streak', color: 'text-amber-400' },
};

export function StreakCard() {
    const { data } = useUserStorage();
    const streak = data.streak;
    const achievements = data.achievements;

    const goalProgress = (streak.todayMinutes / data.dailyGoal) * 100;
    const isGoalMet = goalProgress >= 100;

    return (
        <div className="glass-card p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
                        <Flame className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Current Streak</h3>
                        <p className="text-xs text-foreground-muted">Keep the fire burning!</p>
                    </div>
                </div>
            </div>

            {/* Streak Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                        {streak.current}
                    </div>
                    <div className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                        Day{streak.current !== 1 ? 's' : ''} Streak
                    </div>
                </div>

                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
                    <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                        {streak.longest}
                    </div>
                    <div className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                        Best Streak
                    </div>
                </div>
            </div>

            {/* Daily Goal */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-foreground-muted" />
                        <span className="text-sm font-medium text-foreground">Today&apos;s Goal</span>
                    </div>
                    <span className="text-sm text-foreground-muted">
                        {Math.round(streak.todayMinutes)} / {data.dailyGoal} min
                    </span>
                </div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${isGoalMet
                            ? 'bg-gradient-to-r from-green-400 to-green-500'
                            : 'bg-gradient-to-r from-sage-400 to-sage-500'
                            }`}
                        style={{ width: `${Math.min(goalProgress, 100)}%` }}
                    />
                </div>
                {isGoalMet && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                        ✨ Goal completed! Great job!
                    </p>
                )}
            </div>

            {/* Achievements */}
            {achievements.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Trophy className="w-4 h-4 text-foreground-muted" />
                        <span className="text-sm font-medium text-foreground">Achievements</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {achievements.map(achievement => {
                            const info = ACHIEVEMENT_INFO[achievement];
                            if (!info) return null;
                            const Icon = info.icon;

                            return (
                                <div
                                    key={achievement}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800"
                                    title={info.label}
                                >
                                    <Icon className={`w-4 h-4 ${info.color}`} />
                                    <span className="text-xs font-medium text-foreground">{info.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {achievements.length === 0 && (
                <div className="text-center py-4 text-sm text-foreground-muted">
                    <p>🎯 Start your journey today!</p>
                    <p className="text-xs mt-1">Listen daily to unlock achievements</p>
                </div>
            )}
        </div>
    );
}
