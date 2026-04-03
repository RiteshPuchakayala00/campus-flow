const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Venue = require('../models/Venue');
const bcrypt = require('bcryptjs');

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

// POST /api/admin/users  – add a user
router.post('/users', auth, sysadminOnly, async (req, res) => {
    try {
        const { username, password, role, branch } = req.body;
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            password: hashedPassword,
            role,
            branch: role === 'sysadmin' ? 'Global' : (branch || 'General')
        });
        await user.save();

        const userWithoutPassword = await User.findById(user._id).select('-password');
        res.status(201).json(userWithoutPassword);
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
        const { name, type, capacity, branch } = req.body;
        const venue = new Venue({ name, type, capacity, branch: branch || 'General' });
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

// @route   PUT api/admin/venues/:id/schedule
// @desc    Update venue's weekly master schedule
// @access  Private (SysAdmin)
router.put('/venues/:id/schedule', auth, async (req, res) => {
    if (req.user.role !== 'sysadmin') return res.status(403).json({ message: 'Sysadmin only' });
    try {
        const venue = await Venue.findById(req.params.id);
        if (!venue) return res.status(404).json({ message: 'Venue not found' });
        
        venue.weekly_schedule = req.body.weekly_schedule;
        await venue.save();
        res.json(venue);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
