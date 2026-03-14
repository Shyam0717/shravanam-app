import https from 'https';
import { getDb } from '../../db/db';
import { URL } from 'url';

type Collection = 'SB' | 'NOD';

type RawItem = {
  filename: string;
  audioUrl: string;
  collection: Collection;
  section?: string;
};

function fetchHtml(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(new URL(url), (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Request failed: ${res.statusCode}`));
          return;
        }
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

function parseMp3Links(html: string): string[] {
  const hrefs: string[] = [];
  const regex = /href="([^"]+\.mp3)"/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html))) {
    hrefs.push(match[1]);
  }
  return hrefs;
}

function toAbsolute(base: string, href: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return `${base.replace(/\/$/, '')}/${href.replace(/^\//, '')}`;
  }
}

async function fetchSrimadBhagavatam(): Promise<RawItem[]> {
  const base =
    'https://audio.iskcondesiretree.com/01_-_Srila_Prabhupada/01_-_Lectures/01_-_English/01_-_Topic_wise/Srimad_Bhagavatam/';
  const items: RawItem[] = [];
  for (let canto = 1; canto <= 12; canto++) {
    const cantoDir = `Canto-${String(canto).padStart(2, '0')}/`;
    const indexUrl = `${base}${cantoDir}`;
    try {
      const html = await fetchHtml(indexUrl);
      const links = parseMp3Links(html);
      for (const href of links) {
        const audioUrl = toAbsolute(indexUrl, href);
        const filename = decodeURIComponent(href.replace(/^.*\//, '').replace(/_/g, ' ').replace(/\.mp3$/i, ''));
        items.push({
          filename,
          audioUrl,
          collection: 'SB',
          section: `Canto-${String(canto).padStart(2, '0')}`,
        });
      }
    } catch (e) {
      // Skip unavailable canto folders
    }
  }
  return items;
}

async function fetchNectarOfDevotion(): Promise<RawItem[]> {
  const base =
    'https://audio.iskcondesiretree.com/01_-_Srila_Prabhupada/01_-_Lectures/01_-_English/01_-_Topic_wise/Nectar_Of_Devotion/';
  const html = await fetchHtml(base);
  const links = parseMp3Links(html);
  return links.map((href) => {
    const audioUrl = toAbsolute(base, href);
    const filename = decodeURIComponent(href.replace(/^.*\//, '').replace(/_/g, ' ').replace(/\.mp3$/i, ''));
    return { filename, audioUrl, collection: 'NOD' };
  });
}

function parseMetadata(item: RawItem) {
  const tokens = item.filename.split(' ').filter(Boolean);
  const dateToken = tokens.find((t) => /^\d{4}-\d{2}-\d{2}$/.test(t));
  const date = dateToken || '';
  const location = dateToken ? tokens[Math.max(tokens.indexOf(dateToken) - 1, 0)] : '';
  const titleStart = dateToken ? tokens.indexOf(dateToken) + 1 : 0;
  const title = tokens.slice(titleStart).join(' ');
  const verseToken = tokens.find((t) => /^\d{2}(-\d{2}){1,3}$/.test(t)) || '';
  const chapterGuess = (() => {
    const match = tokens.find((t) => /^\d{2}$/.test(t));
    return match ? parseInt(match, 10) : 0;
  })();
  return {
    chapter: item.collection === 'SB' ? Number(item.section?.split('-')[1]) || chapterGuess : chapterGuess,
    verseRange: verseToken,
    location,
    date,
    title,
  };
}

export async function run() {
  const [sb, nod] = await Promise.all([fetchSrimadBhagavatam(), fetchNectarOfDevotion()]);
  const db = await getDb();
  const startId = (db.data!.lectures?.length || 0) + 1;

  const toLecture = (raw: RawItem, idx: number) => {
    const meta = parseMetadata(raw);
    return {
      id: startId + idx,
      chapter: meta.chapter || 0,
      verseRange: meta.verseRange || '',
      location: meta.location || '',
      date: meta.date || '',
      title: meta.title || raw.filename,
      filename: raw.filename,
      audioUrl: raw.audioUrl,
      listened: false,
      bookmarked: false,
      notes: '',
      summary: '',
      collection: raw.collection,
      section: raw.section,
    };
  };

  const newLectures = [...sb, ...nod].map(toLecture);
  db.data!.lectures = [...(db.data!.lectures || []), ...newLectures];
  await db.write();
  // eslint-disable-next-line no-console
  console.log(`✅ Added ${newLectures.length} lectures from IDT (SB + NOD)`);
}

if (require.main === module) {
  run().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}
