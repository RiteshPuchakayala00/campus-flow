const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');

// @route   POST api/bookings
// @desc    Create a new booking request
// @access  Private
router.post('/', auth, bookingController.createBooking);

// @route   GET api/bookings/approved
// @desc    Get all approved bookings for the calendar
// @access  Private
router.get('/approved', auth, bookingController.getApprovedBookings);

// @route   GET api/bookings
// @desc    Get bookings
// @access  Private
router.get('/', auth, bookingController.getBookings);

// @route   PUT api/bookings/:id/status
// @desc    Update a booking status (Approve/Reject)
// @access  Private (Admins)
router.put('/:id/status', auth, bookingController.updateBookingStatus);

// @route   PATCH api/bookings/:id/cancel
// @desc    Cancel a pending booking (by the booking owner)
// @access  Private
router.patch('/:id/cancel', auth, bookingController.cancelBooking);

// @route   PUT api/bookings/:id
// @desc    Update/Edit a pending booking by user
// @access  Private
router.put('/:id', auth, bookingController.updateBooking);

module.exports = router;
