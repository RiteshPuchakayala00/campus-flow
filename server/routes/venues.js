const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');
const auth = require('../middleware/auth');

// @route   POST api/venues
// @desc    Add a new venue
// @access  Private (Sysadmin only)
router.post('/', auth, venueController.addVenue);

// @route   GET api/venues
// @desc    Get all venues
// @access  Public
router.get('/', venueController.getVenues);

module.exports = router;
