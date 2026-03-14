import { CollectionKey, LibraryLecture, SpeakerKey } from '@/types/Lecture';

import bgLecturesRaw from '@/data/bg_lectures.json';
import sbLecturesRaw from '@/data/sb_lectures.json';
import nodLecturesRaw from '@/data/nod_lectures.json';
import jpsBgLecturesRaw from '@/data/jps_bg_lectures.json';
import jpsSbLecturesRaw from '@/data/jps_sb_lectures.json';
import jpsQaLecturesRaw from '@/data/jps_qa_lectures.json';
import bcsBgLecturesRaw from '@/data/bcs_bg_lectures.json';
import bcsSbLecturesRaw from '@/data/bcs_sb_lectures.json';
import bcsBrahmachariLecturesRaw from '@/data/bcs_brahmachari_lectures.json';
import bcsYouthLecturesRaw from '@/data/bcs_youth_lectures.json';
import bcsPastimesLecturesRaw from '@/data/bcs_pastimes_lectures.json';
import gkgBgLecturesRaw from '@/data/gkg_bg_lectures.json';
import gkgSbLecturesRaw from '@/data/gkg_sb_lectures.json';
import rgsCantoKathaLecturesRaw from '@/data/rgs_canto_katha_lectures.json';
import rgsSbLecturesRaw from '@/data/rgs_sb_lectures.json';
import rgsRamayanaLecturesRaw from '@/data/rgs_ramayana_lectures.json';
import rspBgLecturesRaw from '@/data/rsp_bg_lectures.json';
import rspSbLecturesRaw from '@/data/rsp_sb_lectures.json';
import rspIyfLecturesRaw from '@/data/rsp_iyf_lectures.json';
import rspQaLecturesRaw from '@/data/rsp_qa_lectures.json';
import rspNoiLecturesRaw from '@/data/rsp_noi_lectures.json';
import rspVariousLecturesRaw from '@/data/rsp_various_lectures.json';

export interface SpeakerDefinition {
  slug: SpeakerKey;
  name: string;
  shortName: string;
  description: string;
  collectionOrder: CollectionKey[];
}

export interface CollectionDefinition {
  key: CollectionKey;
  label: string;
  shortLabel: string;
  description: string;
}

export const speakerDefinitions: SpeakerDefinition[] = [
  {
    slug: 'prabhupada',
    name: 'Srila Prabhupada',
    shortName: 'Prabhupada',
    description: 'Foundational lectures across Bhagavad Gita, Srimad Bhagavatam, and Nectar of Devotion.',
    collectionOrder: ['bg', 'sb', 'nod'],
  },
  {
    slug: 'jayapataka-swami',
    name: 'HH Jayapataka Swami Maharaj',
    shortName: 'Jayapataka Swami',
    description: 'Bhagavad Gita, Srimad Bhagavatam, and Q and A recordings from ISKCON Desire Tree.',
    collectionOrder: ['bg', 'sb', 'qa'],
  },
  {
    slug: 'bhakti-charu-swami',
    name: 'HH Bhakti Charu Swami Maharaj',
    shortName: 'Bhakti Charu Swami',
    description: 'Bhagavad Gita and Srimad Bhagavatam lectures from ISKCON Desire Tree.',
    collectionOrder: ['bg', 'sb', 'brahmachari', 'youth', 'pastimes'],
  },
  {
    slug: 'gopal-krishna-goswami',
    name: 'HH Gopal Krishna Goswami Maharaj',
    shortName: 'Gopal Krishna Goswami',
    description: 'Bhagavad Gita and Srimad Bhagavatam lectures from ISKCON Desire Tree.',
    collectionOrder: ['bg', 'sb'],
  },
  {
    slug: 'radha-govinda-swami',
    name: 'HH Radha Govinda Maharaj',
    shortName: 'Radha Govinda Maharaj',
    description: 'Canto-wise katha, Srimad Bhagavatam, and Ramayana collections.',
    collectionOrder: ['cantoKatha', 'sb', 'ramayana'],
  },
  {
    slug: 'radheshyam-prabhu',
    name: 'HG Radheshyam Prabhu',
    shortName: 'Radheshyam Prabhu',
    description: 'Bhagavad Gita, Srimad Bhagavatam, IYF, Q and A, NOI, and various sessions.',
    collectionOrder: ['bg', 'sb', 'iyf', 'qa', 'noi', 'various'],
  },
];

export const collectionDefinitions: Record<CollectionKey, CollectionDefinition> = {
  bg: {
    key: 'bg',
    label: 'Bhagavad Gita',
    shortLabel: 'BG',
    description: 'Verse-based Bhagavad Gita lectures.',
  },
  sb: {
    key: 'sb',
    label: 'Srimad Bhagavatam',
    shortLabel: 'SB',
    description: 'Canto-wise Srimad Bhagavatam lectures.',
  },
  nod: {
    key: 'nod',
    label: 'Nectar of Devotion',
    shortLabel: 'NOD',
    description: 'Bhakti yoga lectures from Nectar of Devotion.',
  },
  qa: {
    key: 'qa',
    label: 'Q and A',
    shortLabel: 'Q&A',
    description: 'Question and answer sessions.',
  },
  brahmachari: {
    key: 'brahmachari',
    label: 'Brahmachari Class',
    shortLabel: 'Brahm.',
    description: 'Focused brahmachari training classes.',
  },
  youth: {
    key: 'youth',
    label: 'Youth Conference',
    shortLabel: 'Youth',
    description: 'Youth conference talks and guidance sessions.',
  },
  pastimes: {
    key: 'pastimes',
    label: 'Srila Prabhupada Pastimes',
    shortLabel: 'Pastimes',
    description: 'Bhakti Charu Swami Maharaj sharing Srila Prabhupada pastimes.',
  },
  cantoKatha: {
    key: 'cantoKatha',
    label: 'Canto Wise Katha',
    shortLabel: 'Katha',
    description: 'Thematic canto-wise katha series.',
  },
  ramayana: {
    key: 'ramayana',
    label: 'Ramayana',
    shortLabel: 'Ram',
    description: 'Ramayana katha and year-wise series.',
  },
  iyf: {
    key: 'iyf',
    label: 'ISKCON Youth Forum',
    shortLabel: 'IYF',
    description: 'ISKCON Youth Forum sessions.',
  },
  noi: {
    key: 'noi',
    label: 'Nectar of Instruction',
    shortLabel: 'NOI',
    description: 'Nectar of Instruction lecture series.',
  },
  various: {
    key: 'various',
    label: 'Various',
    shortLabel: 'Var',
    description: 'General lectures and assorted sessions.',
  },
};

function withDefaults(
  lectures: Array<Record<string, unknown>>,
  base: {
    startId: number;
    speakerSlug: SpeakerKey;
    speakerName: string;
    collection: CollectionKey;
  }
): LibraryLecture[] {
  return lectures.map((lecture, index) => ({
    id: base.startId + index + 1,
    speakerSlug: base.speakerSlug,
    speakerName: base.speakerName,
    collection: base.collection,
    collectionName: collectionDefinitions[base.collection].label,
    location: String(lecture.location || ''),
    date: String(lecture.date || ''),
    title: String(lecture.title || lecture.filename || 'Untitled lecture'),
    filename: String(lecture.filename || ''),
    audioUrl: String(lecture.audioUrl || ''),
    listened: Boolean(lecture.listened),
    bookmarked: Boolean(lecture.bookmarked),
    notes: String(lecture.notes || ''),
    summary: String(lecture.summary || ''),
    chapter: lecture.chapter === null || lecture.chapter === undefined ? null : Number(lecture.chapter),
    verseRange: lecture.verseRange ? String(lecture.verseRange) : '',
    canto: lecture.canto === null || lecture.canto === undefined ? null : Number(lecture.canto),
    verse: lecture.verse ? String(lecture.verse) : '',
    section: lecture.section ? String(lecture.section) : null,
    sourcePath: lecture.sourcePath ? String(lecture.sourcePath) : undefined,
  }));
}

const prabhupadaBg = withDefaults(bgLecturesRaw as Array<Record<string, unknown>>, {
  startId: 10000,
  speakerSlug: 'prabhupada',
  speakerName: 'Srila Prabhupada',
  collection: 'bg',
});

const prabhupadaSb = withDefaults(sbLecturesRaw as Array<Record<string, unknown>>, {
  startId: 20000,
  speakerSlug: 'prabhupada',
  speakerName: 'Srila Prabhupada',
  collection: 'sb',
});

const prabhupadaNod = withDefaults(nodLecturesRaw as Array<Record<string, unknown>>, {
  startId: 30000,
  speakerSlug: 'prabhupada',
  speakerName: 'Srila Prabhupada',
  collection: 'nod',
});

const jpsBg = withDefaults(jpsBgLecturesRaw as Array<Record<string, unknown>>, {
  startId: 40000,
  speakerSlug: 'jayapataka-swami',
  speakerName: 'HH Jayapataka Swami Maharaj',
  collection: 'bg',
});

const jpsSb = withDefaults(jpsSbLecturesRaw as Array<Record<string, unknown>>, {
  startId: 50000,
  speakerSlug: 'jayapataka-swami',
  speakerName: 'HH Jayapataka Swami Maharaj',
  collection: 'sb',
});

const jpsQa = withDefaults(jpsQaLecturesRaw as Array<Record<string, unknown>>, {
  startId: 60000,
  speakerSlug: 'jayapataka-swami',
  speakerName: 'HH Jayapataka Swami Maharaj',
  collection: 'qa',
});

const bcsBg = withDefaults(bcsBgLecturesRaw as Array<Record<string, unknown>>, {
  startId: 70000,
  speakerSlug: 'bhakti-charu-swami',
  speakerName: 'HH Bhakti Charu Swami Maharaj',
  collection: 'bg',
});

const bcsSb = withDefaults(bcsSbLecturesRaw as Array<Record<string, unknown>>, {
  startId: 80000,
  speakerSlug: 'bhakti-charu-swami',
  speakerName: 'HH Bhakti Charu Swami Maharaj',
  collection: 'sb',
});

const bcsBrahmachari = withDefaults(bcsBrahmachariLecturesRaw as Array<Record<string, unknown>>, {
  startId: 90000,
  speakerSlug: 'bhakti-charu-swami',
  speakerName: 'HH Bhakti Charu Swami Maharaj',
  collection: 'brahmachari',
});

const bcsYouth = withDefaults(bcsYouthLecturesRaw as Array<Record<string, unknown>>, {
  startId: 100000,
  speakerSlug: 'bhakti-charu-swami',
  speakerName: 'HH Bhakti Charu Swami Maharaj',
  collection: 'youth',
});

const bcsPastimes = withDefaults(bcsPastimesLecturesRaw as Array<Record<string, unknown>>, {
  startId: 110000,
  speakerSlug: 'bhakti-charu-swami',
  speakerName: 'HH Bhakti Charu Swami Maharaj',
  collection: 'pastimes',
});

const gkgBg = withDefaults(gkgBgLecturesRaw as Array<Record<string, unknown>>, {
  startId: 120000,
  speakerSlug: 'gopal-krishna-goswami',
  speakerName: 'HH Gopal Krishna Goswami Maharaj',
  collection: 'bg',
});

const gkgSb = withDefaults(gkgSbLecturesRaw as Array<Record<string, unknown>>, {
  startId: 130000,
  speakerSlug: 'gopal-krishna-goswami',
  speakerName: 'HH Gopal Krishna Goswami Maharaj',
  collection: 'sb',
});

const rgsCantoKatha = withDefaults(rgsCantoKathaLecturesRaw as Array<Record<string, unknown>>, {
  startId: 140000,
  speakerSlug: 'radha-govinda-swami',
  speakerName: 'HH Radha Govinda Maharaj',
  collection: 'cantoKatha',
});

const rgsSb = withDefaults(rgsSbLecturesRaw as Array<Record<string, unknown>>, {
  startId: 150000,
  speakerSlug: 'radha-govinda-swami',
  speakerName: 'HH Radha Govinda Maharaj',
  collection: 'sb',
});

const rgsRamayana = withDefaults(rgsRamayanaLecturesRaw as Array<Record<string, unknown>>, {
  startId: 160000,
  speakerSlug: 'radha-govinda-swami',
  speakerName: 'HH Radha Govinda Maharaj',
  collection: 'ramayana',
});

const rspBg = withDefaults(rspBgLecturesRaw as Array<Record<string, unknown>>, {
  startId: 170000,
  speakerSlug: 'radheshyam-prabhu',
  speakerName: 'HG Radheshyam Prabhu',
  collection: 'bg',
});

const rspSb = withDefaults(rspSbLecturesRaw as Array<Record<string, unknown>>, {
  startId: 180000,
  speakerSlug: 'radheshyam-prabhu',
  speakerName: 'HG Radheshyam Prabhu',
  collection: 'sb',
});

const rspIyf = withDefaults(rspIyfLecturesRaw as Array<Record<string, unknown>>, {
  startId: 190000,
  speakerSlug: 'radheshyam-prabhu',
  speakerName: 'HG Radheshyam Prabhu',
  collection: 'iyf',
});

const rspQa = withDefaults(rspQaLecturesRaw as Array<Record<string, unknown>>, {
  startId: 200000,
  speakerSlug: 'radheshyam-prabhu',
  speakerName: 'HG Radheshyam Prabhu',
  collection: 'qa',
});

const rspNoi = withDefaults(rspNoiLecturesRaw as Array<Record<string, unknown>>, {
  startId: 210000,
  speakerSlug: 'radheshyam-prabhu',
  speakerName: 'HG Radheshyam Prabhu',
  collection: 'noi',
});

const rspVarious = withDefaults(rspVariousLecturesRaw as Array<Record<string, unknown>>, {
  startId: 220000,
  speakerSlug: 'radheshyam-prabhu',
  speakerName: 'HG Radheshyam Prabhu',
  collection: 'various',
});

export const lectureCatalog: LibraryLecture[] = [
  ...prabhupadaBg,
  ...prabhupadaSb,
  ...prabhupadaNod,
  ...jpsBg,
  ...jpsSb,
  ...jpsQa,
  ...bcsBg,
  ...bcsSb,
  ...bcsBrahmachari,
  ...bcsYouth,
  ...bcsPastimes,
  ...gkgBg,
  ...gkgSb,
  ...rgsCantoKatha,
  ...rgsSb,
  ...rgsRamayana,
  ...rspBg,
  ...rspSb,
  ...rspIyf,
  ...rspQa,
  ...rspNoi,
  ...rspVarious,
];

export function getSpeakerDefinition(slug: SpeakerKey) {
  return speakerDefinitions.find((speaker) => speaker.slug === slug) || speakerDefinitions[0];
}

export function getLecturesBySpeaker(slug: SpeakerKey) {
  return lectureCatalog.filter((lecture) => lecture.speakerSlug === slug);
}

export function getSpeakerCollections(slug: SpeakerKey) {
  const available = new Set(
    lectureCatalog
      .filter((lecture) => lecture.speakerSlug === slug)
      .map((lecture) => lecture.collection)
  );

  return getSpeakerDefinition(slug).collectionOrder
    .filter((collection) => available.has(collection))
    .map((collection) => collectionDefinitions[collection]);
}

export function getDefaultCollection(slug: SpeakerKey): CollectionKey {
  return getSpeakerCollections(slug)[0]?.key || getSpeakerDefinition(slug).collectionOrder[0] || 'bg';
}

export function getSectionMeta(lecture: LibraryLecture) {
  if (lecture.collection === 'bg') {
    if (lecture.chapter) {
      return {
        key: `chapter-${lecture.chapter}`,
        label: `Chapter ${lecture.chapter}`,
        order: lecture.chapter,
      };
    }
    if (lecture.section) {
      return {
        key: `section-${lecture.section}`,
        label: lecture.section,
        order: 999,
      };
    }
  }

  if (lecture.collection === 'sb') {
    if (lecture.canto) {
      return {
        key: `canto-${lecture.canto}`,
        label: `Canto ${lecture.canto}`,
        order: lecture.canto,
      };
    }
    if (lecture.section) {
      return {
        key: `section-${lecture.section}`,
        label: lecture.section,
        order: 999,
      };
    }
  }

  if (lecture.collection === 'nod') {
    if (lecture.chapter) {
      return {
        key: `chapter-${lecture.chapter}`,
        label: `Chapter ${lecture.chapter}`,
        order: lecture.chapter,
      };
    }
    return {
      key: 'section-misc',
      label: 'Other Lectures',
      order: 999,
    };
  }

  if (lecture.collection === 'qa') {
    const year = lecture.date ? Number(lecture.date.slice(0, 4)) : NaN;
    if (!Number.isNaN(year)) {
      return {
        key: `year-${year}`,
        label: `${year}`,
        order: year,
      };
    }
    return {
      key: 'year-unknown',
      label: 'Unknown Year',
      order: 0,
    };
  }

  if (
    lecture.collection === 'brahmachari'
    || lecture.collection === 'youth'
    || lecture.collection === 'pastimes'
    || lecture.collection === 'cantoKatha'
    || lecture.collection === 'ramayana'
    || lecture.collection === 'iyf'
    || lecture.collection === 'noi'
    || lecture.collection === 'various'
  ) {
    if (lecture.section && /^\d{4}$/.test(lecture.section)) {
      return {
        key: `year-${lecture.section}`,
        label: lecture.section,
        order: Number(lecture.section),
      };
    }

    const year = lecture.date ? Number(lecture.date.slice(0, 4)) : NaN;
    if (!Number.isNaN(year)) {
      return {
        key: `year-${year}`,
        label: `${year}`,
        order: year,
      };
    }

    if (lecture.section) {
      return {
        key: `section-${lecture.section}`,
        label: lecture.section,
        order: 500,
      };
    }

    return {
      key: 'year-unknown',
      label: 'Unknown Year',
      order: 0,
    };
  }

  return {
    key: 'all',
    label: 'All Lectures',
    order: 0,
  };
}
