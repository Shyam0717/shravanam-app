'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, Library, BarChart3, Info, BookOpen } from 'lucide-react';
import { GlobalAudioPlayer } from './GlobalAudioPlayer';

interface LayoutProps {
    children: ReactNode;
}

const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/lectures', label: 'Library', icon: Library },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/about', label: 'About', icon: Info },
];

export function Layout({ children }: LayoutProps) {
    const router = useRouter();

    const isActive = (href: string) => {
        if (href === '/') return router.pathname === '/';
        return router.pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen pb-24">
            <header className="sticky top-0 z-40 border-b border-[color:var(--card-border)] bg-[color:var(--card-bg)]/95 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between md:py-4">
                        <Link href="/" className="flex items-center gap-3 group shrink-0">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-600 via-sage-500 to-lotus-500 flex items-center justify-center text-white shadow-lg transition-all group-hover:scale-105">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="font-semibold text-foreground tracking-[0.08em] uppercase text-sm">Shravanam</h1>
                                <p className="hidden sm:block text-xs text-foreground-muted">Spiritual audio library</p>
                            </div>
                        </Link>

                        <nav className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center md:justify-end">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        aria-current={active ? 'page' : undefined}
                                        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors sm:justify-start sm:px-4 sm:text-sm ${active
                                            ? 'bg-sky-100 text-foreground dark:bg-sky-900/30'
                                            : 'text-foreground-muted hover:bg-white/60 hover:text-foreground dark:hover:bg-neutral-800/60'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="mt-16 pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto rounded-[32px] border border-[color:var(--card-border)] bg-[color:var(--card-bg)] px-6 py-8 shadow-[var(--card-shadow)]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-foreground-muted max-w-xl">
                            📿 A spiritual audio library centered on Srila Prabhupada and Vaishnava acharyas
                        </p>
                        <p className="text-xs text-foreground-muted">
                            Audio source: <a href="https://iskcondesiretree.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">ISKCON Desire Tree</a>
                        </p>
                    </div>
                </div>
            </footer>

            {/* Global Audio Player */}
            <GlobalAudioPlayer />
        </div>
    );
}
