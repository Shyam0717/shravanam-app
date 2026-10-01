'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Filter, Library, Mic2, Search } from 'lucide-react';
import { CollectionKey, FilterType, LibraryLecture, SpeakerKey } from '@/types/Lecture';
import { LectureCard } from '@/components/LectureCard';
import { useUserStorage } from '@/lib/useUserStorage';
import {
  collectionDefinitions,
  getDefaultCollection,
  getSectionMeta,
  getSpeakerCollections,
  getSpeakerDefinition,
  lectureCatalog,
  speakerDefinitions,
} from '@/lib/library';

// Long collections (one has 1,400+ lectures) are rendered in pages as you scroll.
const LECTURES_PER_PAGE = 40;

// Centre the selected chip in a horizontally scrolling row (e.g. after opening a deep link).
function scrollSelectedChipIntoView(row: HTMLDivElement | null) {
  const chip = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
  if (!row || !chip) return;
  row.scrollTo({ left: chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' });
}

export default function LectureListPage() {
  const router = useRouter();
  const { data, update } = useUserStorage();
  const [selectedSpeaker, setSelectedSpeaker] = useState<SpeakerKey>('prabhupada');
  const [selectedCollection, setSelectedCollection] = useState<CollectionKey>('bg');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [visibleCount, setVisibleCount] = useState(LECTURES_PER_PAGE);
  const speakerRowRef = useRef<HTMLDivElement>(null);
  const collectionRowRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const speaker = router.query.speaker;
    const collection = router.query.collection;
    const filter = router.query.filter;

    if (typeof speaker === 'string' && speakerDefinitions.some((entry) => entry.slug === speaker)) {
      setSelectedSpeaker(speaker as SpeakerKey);
    }

    if (typeof collection === 'string' && Object.prototype.hasOwnProperty.call(collectionDefinitions, collection)) {
      setSelectedCollection(collection as CollectionKey);
    }

    if (typeof filter === 'string' && ['all', 'listened', 'unlistened', 'bookmarked'].includes(filter)) {
      setFilterType(filter as FilterType);
    }
  }, [router.isReady, router.query.collection, router.query.filter, router.query.speaker]);

  const availableCollections = getSpeakerCollections(selectedSpeaker);
  const validCollectionKeys = availableCollections.map((collection) => collection.key);

  useEffect(() => {
    if (!validCollectionKeys.includes(selectedCollection)) {
      setSelectedCollection(getDefaultCollection(selectedSpeaker));
      setSelectedSection(null);
    }
  }, [selectedCollection, selectedSpeaker, validCollectionKeys]);

  useEffect(() => {
    if (!router.isReady) return;

    const nextQuery: Record<string, string> = {
      speaker: selectedSpeaker,
      collection: selectedCollection,
    };

    if (filterType !== 'all') {
      nextQuery.filter = filterType;
    }

    router.replace({ pathname: '/lectures', query: nextQuery }, undefined, { shallow: true });
  }, [filterType, router, router.isReady, selectedCollection, selectedSpeaker]);

  useEffect(() => {
    setSelectedSection(null);
  }, [selectedCollection, selectedSpeaker]);

  const speakerLectures = useMemo(
    () => lectureCatalog.filter((lecture) => lecture.speakerSlug === selectedSpeaker),
    [selectedSpeaker]
  );

  const collectionLectures = useMemo(
    () => speakerLectures.filter((lecture) => lecture.collection === selectedCollection),
    [selectedCollection, speakerLectures]
  );

  const sections = useMemo(() => {
    const sectionMap = collectionLectures.reduce((acc: Record<string, { label: string; order: number; lectures: LibraryLecture[] }>, lecture) => {
      const meta = getSectionMeta(lecture);
      if (!acc[meta.key]) {
        acc[meta.key] = { label: meta.label, order: meta.order, lectures: [] };
      }
      acc[meta.key].lectures.push(lecture);
      return acc;
    }, {});

    return Object.entries(sectionMap)
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
  }, [collectionLectures]);

  const filteredLectures = useMemo(() => {
    return collectionLectures.filter((lecture) => {
      if (selectedSection && getSectionMeta(lecture).key !== selectedSection) return false;

      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = lecture.title.toLowerCase().includes(query);
        const matchesReference = lecture.verseRange?.toLowerCase().includes(query) || lecture.verse?.toLowerCase().includes(query);
        const matchesLocation = lecture.location.toLowerCase().includes(query);
        if (!matchesTitle && !matchesReference && !matchesLocation) return false;
      }

      if (filterType === 'listened' && !data.listenedLectures.includes(lecture.id)) return false;
      if (filterType === 'unlistened' && data.listenedLectures.includes(lecture.id)) return false;
      if (filterType === 'bookmarked' && !data.bookmarkedLectures.includes(lecture.id)) return false;

      return true;
    });
  }, [collectionLectures, data.bookmarkedLectures, data.listenedLectures, filterType, searchTerm, selectedSection]);

  // Start from the top of the list whenever the filters change.
  useEffect(() => {
    setVisibleCount(LECTURES_PER_PAGE);
  }, [selectedSpeaker, selectedCollection, selectedSection, searchTerm, filterType]);

  const hasMoreLectures = visibleCount < filteredLectures.length;

  // Render the next page before the reader reaches the end of the current one.
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!hasMoreLectures || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisibleCount((count) => count + LECTURES_PER_PAGE);
      },
      { rootMargin: '1200px 0px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMoreLectures, visibleCount]);

  useEffect(() => {
    scrollSelectedChipIntoView(speakerRowRef.current);
  }, [selectedSpeaker]);

  useEffect(() => {
    scrollSelectedChipIntoView(collectionRowRef.current);
  }, [selectedCollection, selectedSpeaker]);

  const toggleListened = (id: number) => {
    update((prev) => {
      const listenedLectures = prev.listenedLectures.includes(id)
        ? prev.listenedLectures.filter((lectureId) => lectureId !== id)
        : [...prev.listenedLectures, id];
      return { ...prev, listenedLectures };
    });
  };

  const toggleBookmarked = (id: number) => {
    update((prev) => {
      const bookmarkedLectures = prev.bookmarkedLectures.includes(id)
        ? prev.bookmarkedLectures.filter((lectureId) => lectureId !== id)
        : [...prev.bookmarkedLectures, id];
      return { ...prev, bookmarkedLectures };
    });
  };

  const saveNotes = (id: number, content: string) => {
    update((prev) => ({
      ...prev,
      notes: { ...prev.notes, [id]: content },
    }));
  };

  const selectedSpeakerMeta = getSpeakerDefinition(selectedSpeaker);
  const selectedCollectionMeta = collectionDefinitions[selectedCollection];

  return (
    <div className="space-y-6">
      <section className="glass-card hidden p-5 sm:block md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-sand-100 px-3 py-1 text-xs font-medium text-sand-700 dark:bg-sand-900/30 dark:text-sand-300">
              <Library className="w-3.5 h-3.5" />
              Library
            </div>
            <h1 className="heading-1 mt-4 text-3xl sm:text-4xl md:text-5xl">Browse by speaker and collection</h1>
            <p className="mt-3 text-foreground-muted">
              Choose a speaker, then one collection, then narrow by section only if needed.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
            <SimpleStat label="Speaker" value={selectedSpeakerMeta.shortName} />
            <SimpleStat label="Collection" value={selectedCollectionMeta.shortLabel} />
            <SimpleStat label="Lectures" value={`${filteredLectures.length}`} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden space-y-4 xl:block">
          <div className="glass-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Mic2 className="w-4 h-4 text-lotus-700 dark:text-sand-300" />
              <h2 className="font-semibold text-foreground">Speakers</h2>
            </div>
            <div className="space-y-2">
              {speakerDefinitions.map((speaker) => (
                <button
                  key={speaker.slug}
                  onClick={() => setSelectedSpeaker(speaker.slug)}
                  className={`chapter-item ${selectedSpeaker === speaker.slug ? 'active' : ''}`}
                >
                  <span>{speaker.shortName}</span>
                  <span className="badge text-xs">{getSpeakerCollections(speaker.slug).length}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-5 min-w-0">
          <div className="glass-card p-4 sm:p-5">
            <div className="flex flex-col gap-4">
              {/* Phones: compact title in place of the intro card */}
              <div className="flex items-baseline justify-between gap-3 sm:hidden">
                <h1 className="heading-2 text-2xl">Library</h1>
                <span className="text-sm text-foreground-muted">
                  {filteredLectures.length} {filteredLectures.length === 1 ? 'lecture' : 'lectures'}
                </span>
              </div>

              {/* Speakers as a scrolling row; wide screens use the sidebar list instead */}
              <div
                ref={speakerRowRef}
                className="no-scrollbar relative -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-5 sm:px-5 xl:hidden"
              >
                {speakerDefinitions.map((speaker) => (
                  <button
                    key={speaker.slug}
                    onClick={() => setSelectedSpeaker(speaker.slug)}
                    aria-pressed={selectedSpeaker === speaker.slug}
                    className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${selectedSpeaker === speaker.slug
                      ? 'bg-gradient-to-br from-sky-600 to-sage-600 text-white shadow-sm'
                      : 'border border-neutral-200 bg-white/80 text-foreground-muted dark:border-neutral-700 dark:bg-neutral-800'
                    }`}
                  >
                    {speaker.shortName}
                  </button>
                ))}
              </div>

              <div
                ref={collectionRowRef}
                className="no-scrollbar relative -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
              >
                {availableCollections.map((collection) => (
                  <button
                    key={collection.key}
                    onClick={() => setSelectedCollection(collection.key)}
                    aria-pressed={selectedCollection === collection.key}
                    className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selectedCollection === collection.key
                      ? 'bg-sage-600 text-white shadow-sm hover:bg-sage-700'
                      : 'bg-white/80 text-foreground-muted border border-neutral-200 hover:border-sage-200 hover:text-foreground dark:bg-neutral-800 dark:border-neutral-700'
                    }`}
                  >
                    {collection.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 xl:grid-cols-[minmax(0,1fr)_180px_180px]">
                <div className="relative col-span-2 xl:col-span-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search title, verse, or location"
                    aria-label="Search lectures"
                    className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-4 text-base text-foreground dark:border-neutral-700 dark:bg-neutral-800 sm:text-sm"
                  />
                </div>

                <select
                  value={selectedSection || ''}
                  onChange={(event) => setSelectedSection(event.target.value || null)}
                  aria-label="Section"
                  className="w-full min-w-0 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-base text-foreground dark:border-neutral-700 dark:bg-neutral-800 sm:text-sm"
                >
                  <option value="">All Sections</option>
                  {sections.map((section) => (
                    <option key={section.key} value={section.key}>
                      {section.label}
                    </option>
                  ))}
                </select>

                <div className="relative min-w-0">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <select
                    value={filterType}
                    onChange={(event) => setFilterType(event.target.value as FilterType)}
                    aria-label="Listening status"
                    className="w-full appearance-none rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-4 text-base text-foreground dark:border-neutral-700 dark:bg-neutral-800 sm:text-sm"
                  >
                    <option value="all">All lectures</option>
                    <option value="listened">Listened</option>
                    <option value="unlistened">Unlistened</option>
                    <option value="bookmarked">Bookmarked</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {filteredLectures.length > 0 ? (
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              {filteredLectures.slice(0, visibleCount).map((lecture) => (
                <LectureCard
                  key={lecture.id}
                  lecture={lecture}
                  listened={data.listenedLectures.includes(lecture.id)}
                  bookmarked={data.bookmarkedLectures.includes(lecture.id)}
                  notes={data.notes[lecture.id] || ''}
                  onToggleListened={() => toggleListened(lecture.id)}
                  onToggleBookmarked={() => toggleBookmarked(lecture.id)}
                  onNotesSave={(content) => saveNotes(lecture.id, content)}
                />
              ))}
              {hasMoreLectures && <div ref={loadMoreRef} className="h-px md:col-span-2" aria-hidden="true" />}
            </div>
          ) : (
            <div className="glass-card p-10 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 text-foreground-muted" />
              <h3 className="font-semibold text-foreground">No lectures found</h3>
              <p className="mt-1 text-sm text-foreground-muted">Try a different section, filter, or search term.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SimpleStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--card-border)] bg-white/55 px-4 py-3 dark:bg-neutral-900/30">
      <p className="text-[11px] uppercase tracking-[0.16em] text-foreground-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
