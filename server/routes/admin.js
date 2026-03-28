const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Venue = require('../models/Venue');

// Middleware: sysadmin only
const sysadminOnly = (req, res, next) => {
    if (req.user.role !== 'sysadmin') {
        return res.status(403).json({ message: 'Access denied. Sysadmin only.' });
    }
    next();
};

// GET /api/admin/users  – list all users
router.get('/users', auth, sysadminOnly, async (req, res) => {
    try {
        const users = await User.find().select('-password'); // don't return passwords
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/admin/users/:id  – remove a user
router.delete('/users/:id', auth, sysadminOnly, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/admin/venues  – add a venue
router.post('/venues', auth, sysadminOnly, async (req, res) => {
    try {
        const { name, type, capacity } = req.body;
        const venue = new Venue({ name, type, capacity });
        await venue.save();
        res.status(201).json(venue);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/admin/venues/:id  – remove a venue
router.delete('/venues/:id', auth, sysadminOnly, async (req, res) => {
    try {
        await Venue.findByIdAndDelete(req.params.id);
        res.json({ message: 'Venue deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
