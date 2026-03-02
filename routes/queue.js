const express = require('express');
const router = express.Router();
const QueueItem = require('../models/QueueItem');
const authMiddleware = require('../middleware/auth');

// ─── PUBLIC ROUTES ──────────────────────────────────────────────────────────

// GET /api/queue/public — public queue view (approved/in_progress items only)
router.get('/public', async (req, res) => {
    try {
        const items = await QueueItem.find({
            status: { $in: ['approved', 'in_progress', 'done'] }
        })
            .sort({ position: 1, createdAt: 1 })
            .select('projectName boardType status position createdAt');
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST /api/queue — client submits a new request
router.post('/', async (req, res) => {
    try {
        const { projectName, nickname, classroom, boardType, features, contact, contactType, budget, deadline, notes } = req.body;

        if (!projectName || !features || !contact) {
            return res.status(400).json({ message: 'projectName, features, and contact are required.' });
        }

        const item = new QueueItem({
            projectName,
            nickname: nickname || '',
            classroom: classroom || '',
            boardType: boardType || 'ESP32',
            features,
            contact,
            contactType: contactType || 'Instagram',
            budget: budget || '',
            deadline: deadline || '',
            notes: notes || '',
            status: 'pending',
            submittedBy: 'client'
        });

        await item.save();
        res.status(201).json({ message: 'Queue request submitted successfully!', id: item._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// ─── ADMIN ROUTES (require JWT) ──────────────────────────────────────────────

// GET /api/queue — all items (admin)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const items = await QueueItem.find({
            status: { $in: ['approved', 'in_progress', 'done'] }
        }).sort({ position: 1, createdAt: 1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/queue/pending — pending submissions
router.get('/pending', authMiddleware, async (req, res) => {
    try {
        const items = await QueueItem.find({ status: 'pending' }).sort({ createdAt: 1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/queue/stats — summary counts
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const [pending, approved, inProgress, done] = await Promise.all([
            QueueItem.countDocuments({ status: 'pending' }),
            QueueItem.countDocuments({ status: 'approved' }),
            QueueItem.countDocuments({ status: 'in_progress' }),
            QueueItem.countDocuments({ status: 'done' }),
        ]);
        res.json({ pending, approved, inProgress, done });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST /api/queue/admin — admin adds directly (approved)
router.post('/admin', authMiddleware, async (req, res) => {
    try {
        const { projectName, nickname, classroom, boardType, features, contact, contactType, budget, deadline, notes } = req.body;

        if (!projectName || !features || !contact) {
            return res.status(400).json({ message: 'projectName, features, and contact are required.' });
        }

        const lastItem = await QueueItem.findOne({ status: { $in: ['approved', 'in_progress'] } })
            .sort({ position: -1 });
        const nextPosition = lastItem ? lastItem.position + 1 : 1;

        const item = new QueueItem({
            projectName,
            nickname: nickname || '',
            classroom: classroom || '',
            boardType: boardType || 'ESP32',
            features,
            contact,
            contactType: contactType || 'Instagram',
            budget: budget || '',
            deadline: deadline || '',
            notes: notes || '',
            status: 'approved',
            position: nextPosition,
            submittedBy: 'admin'
        });

        await item.save();
        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// PATCH /api/queue/reorder — bulk reorder positions
router.patch('/reorder', authMiddleware, async (req, res) => {
    try {
        const { order } = req.body; // array of { id, position }
        if (!Array.isArray(order)) {
            return res.status(400).json({ message: 'order must be an array.' });
        }

        const updates = order.map(({ id, position }) =>
            QueueItem.findByIdAndUpdate(id, { position })
        );
        await Promise.all(updates);
        res.json({ message: 'Reordered successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// PATCH /api/queue/:id/approve — approve a pending item
router.patch('/:id/approve', authMiddleware, async (req, res) => {
    try {
        const lastItem = await QueueItem.findOne({ status: { $in: ['approved', 'in_progress'] } })
            .sort({ position: -1 });
        const nextPosition = lastItem ? lastItem.position + 1 : 1;

        const item = await QueueItem.findByIdAndUpdate(
            req.params.id,
            { status: 'approved', position: nextPosition },
            { new: true }
        );
        if (!item) return res.status(404).json({ message: 'Item not found.' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// PATCH /api/queue/:id/reject — reject a pending item
router.patch('/:id/reject', authMiddleware, async (req, res) => {
    try {
        const item = await QueueItem.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        );
        if (!item) return res.status(404).json({ message: 'Item not found.' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// PATCH /api/queue/:id/status — update status (in_progress / done)
router.patch('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['approved', 'waiting_parts', 'in_progress', 'done'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status.' });
        }

        const item = await QueueItem.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!item) return res.status(404).json({ message: 'Item not found.' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// DELETE /api/queue/:id — delete item
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const item = await QueueItem.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found.' });
        res.json({ message: 'Deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
