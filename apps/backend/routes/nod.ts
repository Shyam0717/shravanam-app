import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Load NOD lectures from JSON file
const nodDataPath = path.join(__dirname, '../src/data/nod_lectures.json');
let nodLectures: any[] = [];

try {
    nodLectures = JSON.parse(fs.readFileSync(nodDataPath, 'utf-8'));
} catch (error) {
    console.error('Failed to load NOD lectures:', error);
}

// GET /nod - get all NOD lectures
router.get('/', (req, res) => {
    res.json(nodLectures);
});

// GET /nod/:id - get one lecture
router.get('/:id', (req, res) => {
    const lecture = nodLectures.find(l => l.id === parseInt(req.params.id));
    if (!lecture) return res.status(404).json({ error: 'Lecture not found' });
    res.json(lecture);
});

// PATCH /nod/:id - update a lecture
router.patch('/:id', (req, res) => {
    const lecture = nodLectures.find(l => l.id === parseInt(req.params.id));
    if (!lecture) return res.status(404).json({ error: 'Lecture not found' });

    const { listened, bookmarked, notes, summary } = req.body;

    if (typeof listened === 'boolean') lecture.listened = listened;
    if (typeof bookmarked === 'boolean') lecture.bookmarked = bookmarked;
    if (typeof notes === 'string') lecture.notes = notes;
    if (typeof summary === 'string') lecture.summary = summary;

    // Save to file
    fs.writeFileSync(nodDataPath, JSON.stringify(nodLectures, null, 2));
    res.json({ message: 'Updated successfully', lecture });
});

export default router;
