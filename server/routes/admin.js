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

// Middleware: any admin (sysadmin or branch admin)
const anyAdmin = (req, res, next) => {
    if (!['sysadmin', 'classroom_admin', 'seminar_admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
};

// GET /api/admin/users  – list all users (filtered by branch for branch admins)
router.get('/users', auth, anyAdmin, async (req, res) => {
    try {
        const query = {};
        if (req.user.role !== 'sysadmin') {
            query.branch = req.user.branch;
        }
        const users = await User.find(query).select('-password'); // don't return passwords
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/admin/users  – add a user
router.post('/users', auth, anyAdmin, async (req, res) => {
    try {
        const { username, password, role, branch } = req.body;
        
        // Security: Branch admins can only create users in their own branch
        let userBranch = branch || 'General';
        if (req.user.role !== 'sysadmin') {
            userBranch = req.user.branch;
            // Also restrict them from creating other admins
            if (['sysadmin', 'classroom_admin', 'seminar_admin'].includes(role)) {
                return res.status(403).json({ message: 'Branch admins cannot create other admins' });
            }
        }

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
            branch: role === 'sysadmin' ? 'Global' : userBranch
        });
        await user.save();

        const userWithoutPassword = await User.findById(user._id).select('-password');
        res.status(201).json(userWithoutPassword);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/admin/users/:id  – remove a user
router.delete('/users/:id', auth, anyAdmin, async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id);
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        // Security: Branch admins can only delete users in their branch
        if (req.user.role !== 'sysadmin' && targetUser.branch !== req.user.branch) {
            return res.status(403).json({ message: 'Cannot delete users from another branch' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/admin/venues  – add a venue
router.post('/venues', auth, anyAdmin, async (req, res) => {
    try {
        const { name, type, capacity, branch } = req.body;
        
        // Security: Branch admins can only add venues to their own branch
        let venueBranch = branch || 'General';
        if (req.user.role !== 'sysadmin') {
            venueBranch = req.user.branch;
        }

        const venue = new Venue({ name, type, capacity, branch: venueBranch });
        await venue.save();
        res.status(201).json(venue);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/admin/venues/:id  – remove a venue
router.delete('/venues/:id', auth, anyAdmin, async (req, res) => {
    try {
        const targetVenue = await Venue.findById(req.params.id);
        if (!targetVenue) return res.status(404).json({ message: 'Venue not found' });

        // Security: Branch admins can only delete venues in their branch
        if (req.user.role !== 'sysadmin' && targetVenue.branch !== req.user.branch) {
            return res.status(403).json({ message: 'Cannot delete venues from another branch' });
        }

        await Venue.findByIdAndDelete(req.params.id);
        res.json({ message: 'Venue deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT api/admin/venues/:id/schedule
// @desc    Update venue's weekly master schedule
// @access  Private (Admins)
router.put('/venues/:id/schedule', auth, anyAdmin, async (req, res) => {
    try {
        const venue = await Venue.findById(req.params.id);
        if (!venue) return res.status(404).json({ message: 'Venue not found' });
        
        // Security: Branch admins can only edit schedules for their own branch
        if (req.user.role !== 'sysadmin' && venue.branch !== req.user.branch) {
            return res.status(403).json({ message: 'Cannot edit schedules for another branch' });
        }

        venue.weekly_schedule = req.body.weekly_schedule;
        await venue.save();
        res.json(venue);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
