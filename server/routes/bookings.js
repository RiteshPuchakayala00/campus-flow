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
router.patch('/:id/cancel', auth, async (req, res) => {
    const Booking = require('../models/Booking');
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.user_id.toString() !== req.user.id)
            return res.status(403).json({ message: 'Not authorized' });
        if (booking.status !== 'pending')
            return res.status(400).json({ message: 'Only pending bookings can be cancelled' });
        booking.status = 'cancelled';
        await booking.save();
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
