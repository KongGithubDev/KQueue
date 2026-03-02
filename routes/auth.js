const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: 'Password is required.' });
        }

        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const isValid = password === adminPassword;

        if (!isValid) {
            return res.status(401).json({ message: 'Invalid password.' });
        }

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
