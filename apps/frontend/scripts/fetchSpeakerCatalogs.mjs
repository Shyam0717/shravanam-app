import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const SITE_ROOT = 'https://audio.iskcondesiretree.com';

const SPEAKERS = [
  {
    key: 'jps',
    root: '/02_-_ISKCON_Swamis/ISKCON_Swamis_-_D_to_P/His_Holiness_Jayapataka_Swami/English_Lectures',
    collections: [
      { slug: 'bg', folder: 'Bhagavad_Gita', output: 'jps_bg_lectures.json', parser: parseBgLecture },
      { slug: 'sb', folder: 'Srimad_Bhagavatam', output: 'jps_sb_lectures.json', parser: parseSbLecture },
      { slug: 'qa', folder: 'Q_and_A', output: 'jps_qa_lectures.json', parser: parseQaLecture },
    ],
  },
  {
    key: 'bcs',
    root: '/02_-_ISKCON_Swamis/ISKCON_Swamis_-_A_to_C/His_Holiness_Bhakti_Charu_Swami/English_Lectures',
    collections: [
      { slug: 'bg', folder: 'Bhagavad_Gita', output: 'bcs_bg_lectures.json', parser: parseBgLecture },
      { slug: 'sb', folder: 'Srimad_Bhagavatam', output: 'bcs_sb_lectures.json', parser: parseSbLecture },
      { slug: 'brahmachari', folder: 'Brahmachari_Class', output: 'bcs_brahmachari_lectures.json', parser: parseGeneralLecture },
      { slug: 'youth', folder: 'Youth_Conference', output: 'bcs_youth_lectures.json', parser: parseGeneralLecture },
      { slug: 'pastimes', folder: 'Srila_Prabhupada_Pastimes', output: 'bcs_pastimes_lectures.json', parser: parseGeneralLecture },
    ],
  },
  {
    key: 'gkg',
    root: '/02_-_ISKCON_Swamis/ISKCON_Swamis_-_D_to_P/His_Holiness_Gopal_Krishna_Goswami/English_Lectures',
    collections: [
      { slug: 'bg', folder: 'Bhagavad_Gita', output: 'gkg_bg_lectures.json', parser: parseBgLecture },
      { slug: 'sb', folder: 'Srimad_Bhagavatam', output: 'gkg_sb_lectures.json', parser: parseSbLecture },
    ],
  },
  {
    key: 'rgs',
    root: '/02_-_ISKCON_Swamis/ISKCON_Swamis_-_R_to_Y/His_Holiness_Radha_Govinda_Swami',
    collections: [
      { slug: 'cantoKatha', folder: '00_-_Canto-Wise_Katha', output: 'rgs_canto_katha_lectures.json', parser: parseGeneralLecture },
      { slug: 'sb', folder: 'Srimad_Bhagavatam', output: 'rgs_sb_lectures.json', parser: parseSbLecture },
      { slug: 'ramayana', folder: 'Ramayan', output: 'rgs_ramayana_lectures.json', parser: parseGeneralLecture },
    ],
  },
  {
    key: 'rsp',
    root: '/03_-_ISKCON_Prabhujis/ISKCON_Prabhujis_-_K_to_R/His_Grace_Radhe_Shyam_Prabhu/English_Lectures',
    collections: [
      { slug: 'bg', folder: 'Bhagavad_Gita', output: 'rsp_bg_lectures.json', parser: parseBgLecture },
      { slug: 'sb', folder: 'Srimad_Bhagavatam', output: 'rsp_sb_lectures.json', parser: parseSbLecture },
      { slug: 'iyf', folder: 'ISKCON_Youth_Forum', output: 'rsp_iyf_lectures.json', parser: parseGeneralLecture },
      { slug: 'qa', folder: 'Q&A', output: 'rsp_qa_lectures.json', parser: parseGeneralLecture },
      { slug: 'noi', folder: 'Nectar_of_Instruction', output: 'rsp_noi_lectures.json', parser: parseGeneralLecture },
      { slug: 'various', folder: 'Various', output: 'rsp_various_lectures.json', parser: parseGeneralLecture },
    ],
  },
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../src/data');

function listingUrl(folder) {
  return `${SITE_ROOT}/index.php?q=f&f=${encodeURIComponent(folder)}`;
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

async function fetchListing(folder) {
  const response = await fetch(listingUrl(folder));
  if (!response.ok) {
    throw new Error(`Failed to fetch ${folder}: ${response.status}`);
  }

  const html = await response.text();
  const entries = [];
  const rowRegex = /name="f\[\]" value="([oi])([^"]+)".*?<font size="2">([^<]+)<\/font>/gms;
  let match;

  while ((match = rowRegex.exec(html)) !== null) {
    const [, kind, rawPath, rawLabel] = match;
    entries.push({
      kind,
      path: decodeURIComponent(rawPath),
      label: decodeEntities(rawLabel).trim(),
    });
  }

  return entries;
}

async function walk(folder) {
  const entries = await fetchListing(folder);
  const files = entries
    .filter((entry) => entry.kind === 'i')
    .map((entry) => ({
      path: entry.path,
      label: entry.label,
      folder,
    }));

  const directories = entries.filter((entry) => entry.kind === 'o');
  for (const directory of directories) {
    files.push(...(await walk(directory.path)));
  }

  return files;
}

function filenameFromPath(filePath) {
  return decodeURIComponent(filePath.split('/').pop() || '');
}

function normalizeDate(raw) {
  if (!raw) return '';

  const iso = raw.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (iso) return iso[1];

  const short = raw.match(/\b(\d{2})-(\d{2})-(\d{2})\b/);
  if (short) {
    const year = Number(short[1]);
    const fullYear = year > 30 ? 1900 + year : 2000 + year;
    return `${fullYear}-${short[2]}-${short[3]}`;
  }

  const named = raw.match(/\b(\d{1,2} [A-Za-z]{3} \d{4})\b/);
  if (named) {
    const parsed = new Date(named[1]);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }

  return '';
}

function splitParts(value) {
  return value
    .split(' - ')
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseBgLecture(file) {
  const clean = file.label.replace(/^.*?\bBG\s+/, '');
  const parts = splitParts(clean);
  const verseRange = parts.shift() || '';
  const dateIndex = parts.findIndex((part) => normalizeDate(part));
  const date = dateIndex >= 0 ? normalizeDate(parts[dateIndex]) : '';
  const title = dateIndex >= 0 ? parts.slice(0, dateIndex).join(' - ') : parts.join(' - ');
  const location = dateIndex >= 0 ? parts.slice(dateIndex + 1).join(' ') : '';
  const chapter = /^\d{2}/.test(verseRange) ? Number(verseRange.slice(0, 2)) : null;
  const sectionTail = file.folder.split('/').pop() || '';

  return {
    chapter,
    verseRange,
    location,
    date,
    title: title || `BG ${verseRange || sectionTail}`,
    filename: filenameFromPath(file.path),
    audioUrl: `${SITE_ROOT}${file.path}`,
    section: sectionTail.replace(/_/g, ' '),
    sourcePath: file.path,
  };
}

function parseSbLecture(file) {
  const clean = file.label.replace(/^.*?\bSB\s+/, '');
  const parts = splitParts(clean);
  const reference = parts.shift() || '';

  let refParts = reference.split('-').filter(Boolean);
  if (refParts.length === 1 && reference.includes('_')) {
    refParts = reference.split('_').filter(Boolean);
  }

  const dateIndex = parts.findIndex((part) => normalizeDate(part));
  const date = dateIndex >= 0 ? normalizeDate(parts[dateIndex]) : '';
  const title = dateIndex >= 0 ? parts.slice(0, dateIndex).join(' - ') : parts.join(' - ');
  const location = dateIndex >= 0 ? parts.slice(dateIndex + 1).join(' ') : '';

  return {
    canto: refParts[0] ? Number(refParts[0]) : null,
    chapter: refParts[1] ? Number(refParts[1]) : null,
    verse: refParts.slice(2).join('-'),
    location,
    date,
    title: title || `SB ${reference}`,
    filename: filenameFromPath(file.path),
    audioUrl: `${SITE_ROOT}${file.path}`,
    section: (file.folder.split('/').pop() || '').replace(/_/g, ' '),
    sourcePath: file.path,
  };
}

function parseQaLecture(file) {
  const clean = file.label.replace(/^JPS Q&A\s*-\s*/, '');
  const parts = splitParts(clean);
  let date = '';
  let title = clean;
  let location = '';

  const dateIndex = parts.findIndex((part) => normalizeDate(part));
  if (dateIndex >= 0) {
    date = normalizeDate(parts[dateIndex]);
    title = parts.slice(0, dateIndex).join(' - ') || 'Q and A';
    location = parts.slice(dateIndex + 1).join(' - ');
  } else {
    const inlineDate = clean.match(/\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{2}|\d{1,2} [A-Za-z]{3} \d{4}/);
    if (inlineDate) {
      date = normalizeDate(inlineDate[0]);
      const [before, after = ''] = clean.split(inlineDate[0]);
      title = before.replace(/\s*-\s*$/, '').trim() || 'Q and A';
      location = after.replace(/^\s*-\s*/, '').trim();
    }
  }

  return {
    section: date ? date.slice(0, 4) : 'Unknown Year',
    location,
    date,
    title,
    filename: filenameFromPath(file.path),
    audioUrl: `${SITE_ROOT}${file.path}`,
    sourcePath: file.path,
  };
}

function parseGeneralLecture(file) {
  const clean = file.label
    .replace(/^(BCS|GKG|RGS)\s*-\s*/i, '')
    .replace(/^(BCS|GKG|RGS)\s+/i, '')
    .replace(/^Radhe Shyam Pr\s+/i, '')
    .replace(/^Radheshyam Prabhu\s+/i, '')
    .trim();

  const dateMatch = clean.match(/\d{4}-\d{2}-\d{2}|\d{4}-\d{2}|\d{2}-\d{2}-\d{2}|\d{1,2} [A-Za-z]{3} \d{4}/);
  const date = dateMatch ? normalizeDate(dateMatch[0]) : '';
  const [beforeDate, afterDateRaw = ''] = dateMatch ? clean.split(dateMatch[0]) : [clean, ''];
  const title = beforeDate.replace(/\s*-\s*$/, '').trim() || clean;
  const location = afterDateRaw.replace(/^\s*-\s*/, '').trim();

  return {
    section: (file.folder.split('/').pop() || '').replace(/_/g, ' '),
    location,
    date,
    title,
    filename: filenameFromPath(file.path),
    audioUrl: `${SITE_ROOT}${file.path}`,
    sourcePath: file.path,
  };
}

function compareStrings(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function sortLectures(slug, lectures) {
  return lectures.sort((a, b) => {
    if (slug === 'bg') {
      return (a.chapter || 999) - (b.chapter || 999)
        || compareStrings(a.verseRange || '', b.verseRange || '')
        || compareStrings(a.date || '', b.date || '')
        || compareStrings(a.title, b.title);
    }

    if (slug === 'sb') {
      return (a.canto || 999) - (b.canto || 999)
        || (a.chapter || 999) - (b.chapter || 999)
        || compareStrings(a.verse || '', b.verse || '')
        || compareStrings(a.date || '', b.date || '')
        || compareStrings(a.title, b.title);
    }

    return compareStrings(a.date || '', b.date || '') || compareStrings(a.title, b.title);
  });
}

const arg = process.argv[2] || 'all';
const targets = arg === 'all' ? SPEAKERS : SPEAKERS.filter((speaker) => speaker.key === arg);

if (targets.length === 0) {
  console.error(`Unknown speaker key: ${arg}`);
  process.exit(1);
}

for (const speaker of targets) {
  for (const collection of speaker.collections) {
    const folder = `${speaker.root}/${collection.folder}`;
    const files = await walk(folder);
    const lectures = sortLectures(
      collection.slug,
      files.map((file) => collection.parser(file))
    );
    const outputPath = path.join(DATA_DIR, collection.output);
    await fs.writeFile(outputPath, `${JSON.stringify(lectures, null, 2)}\n`);
    console.log(`Wrote ${lectures.length} lectures to ${collection.output}`);
  }
}
