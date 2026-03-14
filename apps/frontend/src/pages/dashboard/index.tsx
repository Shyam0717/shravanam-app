'use client';


import Link from 'next/link';
import { BookOpen, Headphones, Bookmark, FileText, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { LibraryLecture } from '@/types/Lecture';
import { StreakCard } from '@/components/StreakCard';
import { useUserStorage } from '@/lib/useUserStorage';
import { collectionDefinitions, lectureCatalog } from '@/lib/library';

// Progress Ring Component
function ProgressRing({ progress, size = 120, strokeWidth = 8 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="progress-ring" width={size} height={size}>
        <circle
          className="progress-ring-bg"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="progress-ring-circle"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gradient-primary">{Math.round(progress)}%</span>
        <span className="text-xs text-foreground-muted">Complete</span>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, color = 'sage' }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: 'sage' | 'sand' | 'lotus' | 'sky';
}) {
  const colors = {
    sage: 'bg-sage-100 text-sage-600 dark:bg-sage-900 dark:text-sage-400',
    sand: 'bg-sand-100 text-sand-600 dark:bg-sand-900 dark:text-sand-400',
    lotus: 'bg-lotus-100 text-lotus-600 dark:bg-lotus-900 dark:text-lotus-400',
    sky: 'bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-400',
  };

  return (
    <div className="glass-card p-4 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform duration-200">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${colors[color]}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-foreground mb-0.5">{value}</div>
      <div className="text-xs text-foreground-muted font-medium uppercase tracking-wide">{label}</div>
    </div>
  );
}

// Recent Lecture Card
function RecentLectureCard({ lecture }: { lecture: LibraryLecture }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-sage-100 dark:bg-sage-900 flex items-center justify-center text-sage-600 dark:text-sage-400 font-bold">
        {collectionDefinitions[lecture.collection].shortLabel}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{lecture.title}</p>
        <p className="text-sm text-foreground-muted">
          {lecture.speakerName} • {collectionDefinitions[lecture.collection].label}
        </p>
      </div>
      {lecture.bookmarked && (
        <Bookmark className="w-4 h-4 text-sand-500 fill-current flex-shrink-0" />
      )}
    </div>
  );
}

export default function Dashboard() {
  const { data } = useUserStorage();

  // Calculate stats from JSON data + local storage
  const allLectures = lectureCatalog;
  const total = allLectures.length;
  const listened = data.listenedLectures.length;
  const bookmarked = data.bookmarkedLectures.length;
  const noted = Object.keys(data.notes).length;

  const percent = total > 0 ? (listened / total) * 100 : 0;

  // Get recent bookmarked lectures
  const recentBookmarked = allLectures
    .filter(l => data.bookmarkedLectures.includes(l.id))
    .slice(0, 3);

  // Get recently listened (those marked as listened)
  const recentListened = allLectures
    .filter(l => data.listenedLectures.includes(l.id))
    .sort((a, b) => {
      const indexA = data.listenedLectures.indexOf(a.id);
      const indexB = data.listenedLectures.indexOf(b.id);
      return indexA - indexB;
    })
    .slice(-3)
    .reverse();

  return (
    <div className="py-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="heading-1 text-3xl mb-2">Your Sadhana Dashboard</h1>
        <p className="text-foreground-muted">
          Track your listening across speakers and scriptures
        </p>
      </div>

      {/* Streak Card */}
      <div className="mb-8">
        <StreakCard />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Progress Card */}
        <div className="glass-card p-6 lg:col-span-1 flex flex-col items-center justify-center">
          <ProgressRing progress={percent} size={140} strokeWidth={10} />
          <p className="text-foreground-muted mt-4 text-center">
            {listened} of {total} lectures completed
          </p>
          <Link
            href="/lectures?filter=unlistened"
            className="mt-4 text-sm text-sage-600 dark:text-sage-400 font-medium hover:underline flex items-center gap-1"
          >
            Continue listening
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Headphones className="w-5 h-5" />}
            label="Total Lectures"
            value={total}
            color="sage"
          />
          <StatCard
            icon={<Target className="w-5 h-5" />}
            label="Listened"
            value={listened}
            color="sky"
          />
          <StatCard
            icon={<Bookmark className="w-5 h-5" />}
            label="Bookmarked"
            value={bookmarked}
            color="sand"
          />
          <StatCard
            icon={<FileText className="w-5 h-5" />}
            label="With Notes"
            value={noted}
            color="lotus"
          />
        </div>
      </div>

      {/* Quick Access Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Bookmarked */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading-3 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-sand-500" />
              Bookmarked
            </h2>
            <Link
              href="/lectures?filter=bookmarked"
              className="text-sm text-foreground-muted hover:text-foreground"
            >
              View all
            </Link>
          </div>

          {recentBookmarked.length > 0 ? (
            <div className="space-y-3">
              {recentBookmarked.map(lecture => (
                <RecentLectureCard key={lecture.id} lecture={lecture} />
              ))}
            </div>
          ) : (
            <p className="text-foreground-muted text-center py-8">
              No bookmarked lectures yet. Start exploring!
            </p>
          )}
        </div>

        {/* Recently Listened */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sage-500" />
              Recently Listened
            </h2>
            <Link
              href="/lectures?filter=listened"
              className="text-sm text-foreground-muted hover:text-foreground"
            >
              View all
            </Link>
          </div>

          {recentListened.length > 0 ? (
            <div className="space-y-3">
              {recentListened.map(lecture => (
                <RecentLectureCard key={lecture.id} lecture={lecture} />
              ))}
            </div>
          ) : (
            <p className="text-foreground-muted text-center py-8">
              Start listening to track your progress!
            </p>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 text-center">
        <Link
          href="/lectures"
          className="inline-flex items-center gap-2 btn-primary text-lg px-8 py-3"
        >
          <BookOpen className="w-5 h-5" />
          Browse All Lectures
        </Link>
      </div>
    </div>
  );
}
