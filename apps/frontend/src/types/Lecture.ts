export type CollectionKey =
  | 'bg'
  | 'sb'
  | 'nod'
  | 'qa'
  | 'brahmachari'
  | 'youth'
  | 'pastimes'
  | 'cantoKatha'
  | 'ramayana'
  | 'iyf'
  | 'noi'
  | 'various';

export type SpeakerKey =
  | 'prabhupada'
  | 'jayapataka-swami'
  | 'bhakti-charu-swami'
  | 'gopal-krishna-goswami'
  | 'radha-govinda-swami'
  | 'radheshyam-prabhu';

export interface LibraryLecture {
  id: number;
  speakerSlug: SpeakerKey;
  speakerName: string;
  collection: CollectionKey;
  collectionName: string;
  location: string;
  date: string;
  title: string;
  filename: string;
  audioUrl: string;
  listened: boolean;
  bookmarked: boolean;
  notes: string;
  summary: string;
  chapter?: number | null;
  verseRange?: string;
  canto?: number | null;
  verse?: string;
  section?: string | null;
  sourcePath?: string;
}

export interface Lecture extends LibraryLecture {
  chapter: number;
  verseRange: string;
}

export interface SBLecture extends LibraryLecture {
  canto: number;
  chapter: number;
  verse: string;
}

export interface NODLecture extends LibraryLecture {
  chapter: number | null;
}

export interface LectureStats {
  total: number;
  listened: number;
  bookmarked: number;
}

export type FilterType = 'all' | 'listened' | 'unlistened' | 'bookmarked';

// Union type for any lecture
export type AnyLecture = LibraryLecture;
