const Venue = require('../models/Venue');

// @desc    Add a new venue
// @route   POST /api/venues
// @access  Private (System Admin only)
exports.addVenue = async (req, res) => {
    try {
        const { name, type, capacity, admin_id } = req.body;

        // Check if user is sysadmin
        if (req.user.role !== 'sysadmin') {
            return res.status(403).json({ message: 'Access denied. System Admin only.' });
        }

        let venue = await Venue.findOne({ name });
        if (venue) {
            return res.status(400).json({ message: 'Venue already exists' });
        }

        venue = new Venue({
            name,
            type,
            capacity,
            admin_id: admin_id || null
        });

        await venue.save();
        res.json(venue);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all venues
// @route   GET /api/venues
// @access  Public
exports.getVenues = async (req, res) => {
    try {
        const venues = await Venue.find();
        res.json(venues);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
