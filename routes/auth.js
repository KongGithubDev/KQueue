const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Simple in-memory rate limit: max 5 attempts per IP per 15 min
const attempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(ip) {
    const now = Date.now();
    const entry = attempts.get(ip) || { count: 0, first: now };
    if (now - entry.first > WINDOW_MS) {
        attempts.set(ip, { count: 1, first: now });
        return false; // not limited
    }
    if (entry.count >= MAX_ATTEMPTS) return true; // limited
    entry.count++;
    attempts.set(ip, entry);
    return false;
}

function clearAttempts(ip) {
    attempts.delete(ip);
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const ip = req.ip || req.connection.remoteAddress;
        if (checkRateLimit(ip)) {
            return res.status(429).json({ message: 'ลองผิดหลายครั้งเกินไป รอ 15 นาทีแล้วลองใหม่' });
        }

        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: 'Password is required.' });
        }

        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const isValid = password.trim() === adminPassword;

        if (!isValid) {
            return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
        }

        clearAttempts(ip);
        const token = jwt.sign(
            { role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, message: 'Login successful.' });
    } catch (err) {
        console.error('Auth error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
