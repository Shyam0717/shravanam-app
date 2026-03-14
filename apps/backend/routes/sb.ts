import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Load SB lectures from JSON file
const sbDataPath = path.join(__dirname, '../src/data/sb_lectures.json');
let sbLectures: any[] = [];

try {
    sbLectures = JSON.parse(fs.readFileSync(sbDataPath, 'utf-8'));
} catch (error) {
    console.error('Failed to load SB lectures:', error);
}

// GET /sb - get all SB lectures
router.get('/', (req, res) => {
    res.json(sbLectures);
});

// GET /sb/:id - get one lecture
router.get('/:id', (req, res) => {
    const lecture = sbLectures.find(l => l.id === parseInt(req.params.id));
    if (!lecture) return res.status(404).json({ error: 'Lecture not found' });
    res.json(lecture);
});

// PATCH /sb/:id - update a lecture
router.patch('/:id', (req, res) => {
    const lecture = sbLectures.find(l => l.id === parseInt(req.params.id));
    if (!lecture) return res.status(404).json({ error: 'Lecture not found' });

    const { listened, bookmarked, notes, summary } = req.body;

    if (typeof listened === 'boolean') lecture.listened = listened;
    if (typeof bookmarked === 'boolean') lecture.bookmarked = bookmarked;
    if (typeof notes === 'string') lecture.notes = notes;
    if (typeof summary === 'string') lecture.summary = summary;

    // Save to file
    fs.writeFileSync(sbDataPath, JSON.stringify(sbLectures, null, 2));
    res.json({ message: 'Updated successfully', lecture });
});

export default router;
