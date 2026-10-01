'use client';

import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';

// Chrome/Android fires this before showing its own install UI; not yet in the TS DOM lib.
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'shravanam_install_dismissed';

function isRunningAsApp() {
    return window.matchMedia('(display-mode: standalone)').matches
        || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIos() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent)
        // iPadOS reports itself as a Mac.
        || (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1);
}

export function InstallPrompt() {
    const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
    const [showIosHint, setShowIosHint] = useState(false);
    const [dismissed, setDismissed] = useState(true);

    useEffect(() => {
        if (isRunningAsApp()) return;
        try {
            if (window.localStorage.getItem(DISMISSED_KEY)) return;
        } catch {
            // Storage unavailable — still offer the prompt.
        }
        setDismissed(false);
        setShowIosHint(isIos());

        const handleBeforeInstall = (event: Event) => {
            event.preventDefault();
            setInstallEvent(event as BeforeInstallPromptEvent);
        };
        const handleInstalled = () => setInstallEvent(null);

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        window.addEventListener('appinstalled', handleInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled', handleInstalled);
        };
    }, []);

    const dismiss = () => {
        setDismissed(true);
        try {
            window.localStorage.setItem(DISMISSED_KEY, '1');
        } catch {
            // Ignore — it will just show again next visit.
        }
    };

    const install = async () => {
        if (!installEvent) return;
        await installEvent.prompt();
        const { outcome } = await installEvent.userChoice;
        setInstallEvent(null);
        if (outcome === 'accepted') dismiss();
    };

    if (dismissed || (!installEvent && !showIosHint)) return null;

    return (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card-bg)] p-4 shadow-[var(--card-shadow)]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 via-sage-500 to-lotus-500 text-white">
                <Download className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">Install Shravanam on your phone</p>
                {installEvent ? (
                    <p className="mt-0.5 text-xs text-foreground-muted">Open it from your home screen like any other app, with lock-screen playback controls.</p>
                ) : (
                    <p className="mt-0.5 text-xs text-foreground-muted">
                        Tap <Share className="inline h-3.5 w-3.5 -mt-0.5" aria-label="Share" /> in Safari, then <span className="font-medium text-foreground">Add to Home Screen</span>.
                    </p>
                )}
                {installEvent && (
                    <button
                        onClick={install}
                        className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-sky-700"
                    >
                        <Download className="h-4 w-4" />
                        Install app
                    </button>
                )}
            </div>
            <button
                onClick={dismiss}
                aria-label="Dismiss install suggestion"
                className="-m-1 rounded-lg p-1 text-foreground-muted hover:text-foreground"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
