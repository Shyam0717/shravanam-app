/**
 * Scraper for Srimad Bhagavatam lectures from ISKCON Desire Tree
 * Run: npx ts-node src/scripts/scrapeSBLectures.ts
 */

import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://audio.iskcondesiretree.com/01_-_Srila_Prabhupada/01_-_Lectures/01_-_English/01_-_Topic_wise/Srimad_Bhagavatam';

// Cantos available on ISKCON Desire Tree
const CANTOS = ['Canto-01', 'Canto-02', 'Canto-03', 'Canto-05', 'Canto-06', 'Canto-07', 'Canto-11'];

interface SBLecture {
    id: number;
    canto: number;
    chapter: number;
    verse: string;
    location: string;
    date: string;
    title: string;
    filename: string;
    audioUrl: string;
    listened: boolean;
    bookmarked: boolean;
    notes: string;
    summary: string;
}

/**
 * Parse filename like: SP_SB_1-02-06_Calcutta_1974-02-27_Krishna_Takes_Only_the--etc.mp3
 * or: SP_SB_01-02-10_Hyderabad_1974-04-24.mp3
 */
function parseFilename(filename: string, cantoNum: number): Partial<SBLecture> | null {
    try {
        // Remove .mp3 extension
        const name = filename.replace('.mp3', '');

        // Pattern: SP_SB_X-YY-ZZ_Location_YYYY-MM-DD_Title or SP_SB_X-YY-ZZ_Location_YYYY-MM-DD
        const match = name.match(/SP_SB_(\d+)-(\d+)-(\d+)_([A-Za-z_]+)_(\d{4}-\d{2}-\d{2})(?:_(.*))?/);

        if (!match) {
            // Try alternate pattern without underscore Title
            const altMatch = name.match(/SP_SB_(\d+-\d+-\d+)_([A-Za-z_]+)_(\d{4}-\d{2}-\d{2})/);
            if (altMatch) {
                const [, verseRef, location, date] = altMatch;
                const parts = verseRef.split('-');
                return {
                    canto: parseInt(parts[0]),
                    chapter: parseInt(parts[1]),
                    verse: parts[2],
                    location: location.replace(/_/g, ' '),
                    date,
                    title: `SB ${verseRef}`,
                    filename,
                };
            }
            return null;
        }

        const [, , chapter, verse, location, date, titlePart] = match;

        // Clean up title
        let title = titlePart
            ? titlePart.replace(/_/g, ' ').replace(/--etc$/, '...').replace(/--etc\.?$/, '...')
            : `SB ${cantoNum}.${chapter}.${verse}`;

        return {
            canto: cantoNum,
            chapter: parseInt(chapter),
            verse,
            location: location.replace(/_/g, ' '),
            date,
            title,
            filename,
        };
    } catch {
        return null;
    }
}

async function fetchDirectoryListing(url: string): Promise<string[]> {
    try {
        const response = await fetch(url);
        const html = await response.text();

        // Extract MP3 links from Apache directory listing
        const mp3Regex = /href="([^"]+\.mp3)"/gi;
        const matches = [...html.matchAll(mp3Regex)];

        return matches.map(m => decodeURIComponent(m[1]));
    } catch (error) {
        console.error(`Failed to fetch ${url}:`, error);
        return [];
    }
}

async function scrapeSBLectures(): Promise<SBLecture[]> {
    const lectures: SBLecture[] = [];
    let id = 1;

    for (const cantoDir of CANTOS) {
        const cantoNum = parseInt(cantoDir.replace('Canto-', ''));
        const url = `${BASE_URL}/${cantoDir}/`;

        console.log(`Fetching ${cantoDir}...`);
        const files = await fetchDirectoryListing(url);

        for (const filename of files) {
            const parsed = parseFilename(filename, cantoNum);

            if (parsed) {
                lectures.push({
                    id: id++,
                    canto: parsed.canto!,
                    chapter: parsed.chapter!,
                    verse: parsed.verse!,
                    location: parsed.location!,
                    date: parsed.date!,
                    title: parsed.title!,
                    filename: parsed.filename!,
                    audioUrl: `${url}${encodeURIComponent(filename)}`,
                    listened: false,
                    bookmarked: false,
                    notes: '',
                    summary: '',
                });
            }
        }

        console.log(`  Found ${files.length} files in ${cantoDir}`);
    }

    return lectures;
}

// Main
(async () => {
    console.log('Starting Srimad Bhagavatam lecture scraper...\n');

    const lectures = await scrapeSBLectures();

    const outputPath = path.join(__dirname, '../data/sb_lectures.json');
    fs.writeFileSync(outputPath, JSON.stringify(lectures, null, 2));

    console.log(`\n✅ Scraped ${lectures.length} SB lectures → sb_lectures.json`);
})();
