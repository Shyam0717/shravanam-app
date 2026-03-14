import Link from 'next/link';
import { ArrowRight, Headphones, BookOpen, BarChart3, Heart, Library, Disc3 } from 'lucide-react';
import { collectionDefinitions, lectureCatalog, speakerDefinitions } from '@/lib/library';

export default function Home() {
  const lectureCount = lectureCatalog.length;
  const speakerCount = speakerDefinitions.length;
  const collectionCount = Object.keys(collectionDefinitions).length;
  const spotlightSpeakers = speakerDefinitions.slice(0, 2);

  return (
    <div className="py-3 md:py-8">
      <section className="temple-shell relative overflow-hidden rounded-[28px] md:rounded-[36px] border border-[color:var(--card-border)] bg-[color:var(--card-bg)] px-5 py-6 shadow-[var(--card-shadow)] md:px-10 md:py-12">
        <div className="hero-orb left-[-3rem] top-[-2rem] h-40 w-40 bg-sand-300" />
        <div className="hero-orb right-[8%] top-[12%] h-32 w-32 bg-sky-300" />
        <div className="hero-orb bottom-[-2rem] right-[-2rem] h-44 w-44 bg-lotus-300" />

        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--card-border)] bg-white/60 px-4 py-2 text-sm font-medium text-foreground shadow-sm dark:bg-neutral-900/40">
              <Heart className="w-4 h-4 text-lotus-600" />
              Hare Krishna
            </div>

            <h1 className="heading-1 mt-5 max-w-4xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
              A more
              {' '}
              <span className="text-gradient">living way</span>
              <br />
              to hear guru, sadhu and sastra
            </h1>

            <p className="mt-4 max-w-2xl text-base sm:text-lg text-foreground-muted">
              Choose a speaker, move through scripture collections, and keep your listening journey organized without turning the experience into a cluttered file browser.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/lectures" className="inline-flex items-center justify-center gap-2 btn-primary text-base px-6 py-3">
                Enter Library
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 btn-secondary text-base px-6 py-3">
                View Progress
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatPill icon={<Headphones className="w-4 h-4" />} label="Lectures" value={`${lectureCount}+`} />
              <StatPill icon={<MicTile />} label="Speakers" value={`${speakerCount}`} />
              <StatPill icon={<Library className="w-4 h-4" />} label="Collections" value={`${collectionCount}`} />
              <StatPill icon={<Disc3 className="w-4 h-4" />} label="Streaming" value="Direct" />
            </div>
          </div>

          <div className="grid gap-4">
            {spotlightSpeakers.map((speaker, index) => (
              <div
                key={speaker.slug}
                className={`rounded-[24px] md:rounded-[28px] border border-[color:var(--card-border)] bg-white/65 p-4 md:p-5 shadow-sm dark:bg-neutral-900/35 ${index === 0 ? 'lg:translate-x-6' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-foreground-muted">Featured Speaker</p>
                    <h2 className="heading-3 mt-2 text-xl">{speaker.name}</h2>
                    <p className="mt-2 text-sm text-foreground-muted">{speaker.description}</p>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-lotus-500 to-sand-500 p-3 text-white shadow-md">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {speaker.collectionOrder.map((key) => (
                    <span key={key} className="badge">{collectionDefinitions[key].label}</span>
                  ))}
                </div>

                <Link
                  href={`/lectures?speaker=${speaker.slug}&collection=${speaker.collectionOrder[0]}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-lotus-700 hover:underline dark:text-sand-300"
                >
                  Open this speaker
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 md:mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-card p-5 md:p-7">
          <p className="text-xs uppercase tracking-[0.18em] text-foreground-muted">What Changed</p>
          <h2 className="heading-2 mt-3 text-3xl">From one archive to a listening room</h2>
          <p className="mt-4 text-foreground-muted">
            The library is now organized around the natural way people listen: first by speaker, then by scripture or session type, then by section.
          </p>
          <div className="mt-6 space-y-3">
            <FeatureRow icon={<MicTile />} title="Speaker-first" description="Begin with the teacher you want to hear." />
            <FeatureRow icon={<Library className="w-5 h-5" />} title="Collection-aware" description="Move between BG, SB, Nectar of Devotion, and Q&A without changing mental context." />
            <FeatureRow icon={<BarChart3 className="w-5 h-5" />} title="Progress intact" description="Bookmarks, notes, and listened state remain part of the flow." />
          </div>
        </div>

        <div className="glass-card p-5 md:p-9">
          <blockquote className="heading-2 text-2xl md:text-4xl italic text-foreground">
            &ldquo;The chanting of the Hare Krishna mantra is the most sublime method for reviving our transcendental consciousness.&rdquo;
          </blockquote>
          <p className="mt-5 text-sm font-medium uppercase tracking-[0.18em] text-foreground-muted">
            His Divine Grace A.C. Bhaktivedanta Swami Prabhupada
          </p>
        </div>
      </section>
    </div>
  );
}

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--card-border)] bg-white/55 px-4 py-3 dark:bg-neutral-900/30">
      <div className="mb-2 flex items-center gap-2 text-foreground-muted">
        {icon}
        <span className="text-xs uppercase tracking-[0.14em]">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-foreground">{value}</div>
    </div>
  );
}

function FeatureRow({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[color:var(--card-border)] bg-white/45 p-4 dark:bg-neutral-900/25">
      <div className="mt-0.5 rounded-xl bg-sand-100 p-2 text-lotus-700 dark:bg-sand-900/40 dark:text-sand-300">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-foreground-muted">{description}</p>
      </div>
    </div>
  );
}

function MicTile() {
  return (
    <div className="relative flex h-4 w-4 items-center justify-center">
      <span className="absolute h-4 w-2 rounded-full border border-current" />
      <span className="absolute bottom-0 h-1.5 w-3 rounded-b-full border-b border-current" />
    </div>
  );
}
