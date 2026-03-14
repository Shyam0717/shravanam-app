'use client';

import { BookOpen, Heart, Shield, Info } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto py-8 lg:py-12">
            <div className="text-center mb-12">
                <h1 className="heading-1 text-3xl mb-4">About Shravanam</h1>
                <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
                    A dedicated space for spiritual growth through the transcendental teachings of His Divine Grace A.C. Bhaktivedanta Swami Prabhupada.
                </p>
            </div>

            <div className="grid gap-8">
                {/* Mission Section */}
                <div className="glass-card p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-lotus-100 dark:bg-lotus-900 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-lotus-600 dark:text-lotus-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-foreground">Our Mission</h2>
                    </div>
                    <p className="text-foreground-muted leading-relaxed">
                        To provide an accessible, distraction-free environment for devotees and seekers to immerse themselves in hearing (shravanam) the eternal wisdom of the Vedas. This application allows you to track your daily sadhana, maintain streaks, and take notes, fostering a consistent spiritual practice.
                    </p>
                </div>

                {/* Acknowledgments Section */}
                <div className="glass-card p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-sage-100 dark:bg-sage-900 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-sage-600 dark:text-sage-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-foreground">Acknowledgments & Sources</h2>
                    </div>
                    <div className="space-y-4 text-foreground-muted leading-relaxed">
                        <p>
                            We offer our humble obeisances to <strong>His Divine Grace A.C. Bhaktivedanta Swami Prabhupada</strong>, Founder-Acharya of the International Society for Krishna Consciousness, whose lectures are the heart of this application.
                        </p>
                        <p>
                            The audio content provided in this application is sourced from <strong>ISKCON Desire Tree</strong>. We are grateful for their service in preserving and distributing these transcendental vibrations.
                        </p>
                        <div className="mt-4 p-4 bg-sage-50 dark:bg-sage-900/30 rounded-xl border border-sage-100 dark:border-sage-800">
                            <p className="text-sm font-medium text-foreground mb-1">Source Link:</p>
                            <a
                                href="https://audio.iskcondesiretree.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sage-700 dark:text-sage-400 underline hover:no-underline"
                            >
                                audio.iskcondesiretree.com
                            </a>
                        </div>
                    </div>
                </div>

                {/* Disclaimer Section */}
                <div className="glass-card p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-foreground">Disclaimer</h2>
                    </div>
                    <div className="space-y-4 text-foreground-muted text-sm leading-relaxed">
                        <p>
                            This is an independent educational application created for personal sadhana (spiritual practice). It is not an official application of ISKCON or ISKCON Desire Tree, though it faithfully presents their content.
                        </p>
                        <p>
                            All copyrights for the lectures and audio content belong to the Bhaktivedanta Book Trust (BBT) and ISKCON Desire Tree respectively. This app does not host content derived from unauthorized sources.
                        </p>
                    </div>
                </div>

                {/* Developer Note (Optional, can be removed if preferred) */}
                <div className="text-center pt-4">
                    <p className="text-xs text-foreground-muted flex items-center justify-center gap-1">
                        <Info className="w-3 h-3" />
                        Built with devotion for the pleasure of the Vaisnavas.
                    </p>
                </div>
            </div>
        </div>
    );
}
