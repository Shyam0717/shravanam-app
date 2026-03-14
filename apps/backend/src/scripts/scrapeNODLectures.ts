/**
 * Scraper for Nectar of Devotion lectures from ISKCON Desire Tree
 * Run: npx ts-node src/scripts/scrapeNODLectures.ts
 */

import fs from 'fs';
import path from 'path';

const NOD_URL = 'https://audio.iskcondesiretree.com/01_-_Srila_Prabhupada/01_-_Lectures/01_-_English/01_-_Topic_wise/Nectar_Of_Devotion/';

interface NODLecture {
    id: number;
    chapter: number | null;
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
 * Parse filename like:
 * - SP_NOD_01_Vrindavan_1972-10-20_-_The_Complete_Science_of_Bhakti_Yoga.mp3
 * - SP_NOD_Bombay_1972-12-28_-_Surrender_to_Krishna_or_Crocodiles.mp3
 */
function parseFilename(filename: string): Partial<NODLecture> | null {
    try {
        const name = filename.replace('.mp3', '');

        // Pattern with chapter number: SP_NOD_01_Location_Date_-_Title
        const withChapter = name.match(/SP_NOD_(\d+)_([A-Za-z_]+)_(\d{4}-\d{2}-\d{2})_-_(.+)/);

        if (withChapter) {
            const [, chapter, location, date, title] = withChapter;
            return {
                chapter: parseInt(chapter),
                location: location.replace(/_/g, ' '),
                date,
                title: title.replace(/_/g, ' ').replace(/--etc$/, '...'),
                filename,
            };
        }

        // Pattern without chapter: SP_NOD_Location_Date_-_Title
        const withoutChapter = name.match(/SP_NOD_([A-Za-z]+)_(\d{4}-\d{2}-\d{2})_-_(.+)/);

        if (withoutChapter) {
            const [, location, date, title] = withoutChapter;
            return {
                chapter: null,
                location: location.replace(/_/g, ' '),
                date,
                title: title.replace(/_/g, ' ').replace(/--etc$/, '...'),
                filename,
            };
        }

        return null;
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

async function scrapeNODLectures(): Promise<NODLecture[]> {
    const lectures: NODLecture[] = [];

    console.log('Fetching Nectar of Devotion lectures...');
    const files = await fetchDirectoryListing(NOD_URL);

    let id = 1;
    for (const filename of files) {
        const parsed = parseFilename(filename);

        if (parsed) {
            lectures.push({
                id: id++,
                chapter: parsed.chapter ?? null,
                location: parsed.location!,
                date: parsed.date!,
                title: parsed.title!,
                filename: parsed.filename!,
                audioUrl: `${NOD_URL}${encodeURIComponent(filename)}`,
                listened: false,
                bookmarked: false,
                notes: '',
                summary: '',
            });
        }
    }

    // Sort by chapter number (nulls at end)
    lectures.sort((a, b) => {
        if (a.chapter === null && b.chapter === null) return 0;
        if (a.chapter === null) return 1;
        if (b.chapter === null) return -1;
        return a.chapter - b.chapter;
    });

    // Re-assign IDs after sorting
    lectures.forEach((l, i) => l.id = i + 1);

    return lectures;
}

// Main
(async () => {
    console.log('Starting Nectar of Devotion lecture scraper...\n');

    const lectures = await scrapeNODLectures();

    const outputPath = path.join(__dirname, '../data/nod_lectures.json');
    fs.writeFileSync(outputPath, JSON.stringify(lectures, null, 2));

    console.log(`\n✅ Scraped ${lectures.length} NOD lectures → nod_lectures.json`);
})();
