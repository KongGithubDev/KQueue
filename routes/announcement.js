const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const authMiddleware = require('../middleware/auth');

// GET /api/announcement — public
router.get('/', async (req, res) => {
    try {
        const a = await Announcement.findOne().sort({ createdAt: -1 });
        res.json(a || null);
    } catch { res.status(500).json({ message: 'Server error.' }); }
});

// POST /api/announcement — admin sets announcement
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text?.trim()) return res.status(400).json({ message: 'text is required.' });
        await Announcement.deleteMany({}); // keep only one
        const a = await Announcement.create({ text: text.trim() });
        res.status(201).json(a);
    } catch { res.status(500).json({ message: 'Server error.' }); }
});

// DELETE /api/announcement — admin clears
router.delete('/', authMiddleware, async (req, res) => {
    try {
        await Announcement.deleteMany({});
        res.json({ message: 'Cleared.' });
    } catch { res.status(500).json({ message: 'Server error.' }); }
});

module.exports = router;
