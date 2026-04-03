const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const Notification = require('../models/Notification');
const User = require('../models/User');

// ... [createBooking & getBookings omitted for brevity] ...
// We will replace the whole file to ensure clean imports & functions

// @desc    Create a new booking request
// @route   POST /api/bookings
// @access  Private (Faculty, CR, Event Organizer)
exports.createBooking = async (req, res) => {
    // ... [createBooking omitted for brevity] ...
    // I need to properly include it, let me just add the function at the bottom instead of replacing.
    try {
        const { venue_id, date, start_time, end_time, purpose } = req.body;

        // 1. Basic Validation
        if (!venue_id || !date || !start_time || !end_time || !purpose) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // 2. Check if Venue exists
        const venue = await Venue.findById(venue_id);
        if (!venue) {
            return res.status(404).json({ message: 'Venue not found' });
        }

        // 3. Prevent Double Booking
        // Find any overlapping bookings for the same venue and date that are either approved or pending
        const overlappingBookings = await Booking.find({
            venue_id,
            date: new Date(date),
            status: { $in: ['approved', 'pending'] },
            $or: [
                // New booking starts during an existing booking
                { start_time: { $lt: end_time }, end_time: { $gt: start_time } }
            ]
        });

        if (overlappingBookings.length > 0) {
            if (req.body.isWaitlist) {
                const waitlistedBooking = new Booking({
                    user_id: req.user.id,
                    venue_id,
                    date,
                    start_time,
                    end_time,
                    purpose,
                    status: 'waitlisted'
                });
                await waitlistedBooking.save();
                return res.status(201).json(waitlistedBooking);
            }
            return res.status(409).json({
                message: 'Venue is already booked or pending for this time slot. Would you like to join the waitlist?',
                canWaitlist: true
            });
        }

        // 4. Create Booking
        const newBooking = new Booking({
            user: req.user.id,
            venue_id,
            date,
            start_time,
            end_time,
            purpose,
            status: 'pending' // Always starts as pending
        });

        await newBooking.save();

        // REQ_05: Notify the relevant admin about the new booking request
        const venueDoc = await Venue.findById(venue_id);
        const adminRole = venueDoc && venueDoc.type === 'seminar_hall' ? 'seminar_admin' : 'classroom_admin';
        const admins = await User.find({ role: { $in: [adminRole, 'sysadmin'] } });
        const notifPromises = admins.map(admin =>
            new Notification({
                user: admin._id,
                title: '📋 New Booking Request',
                message: `A new booking request has been submitted for ${venueDoc ? venueDoc.name : 'a venue'} on ${new Date(date).toLocaleDateString()} from ${start_time} to ${end_time}. Please review it.`,
                type: 'info'
            }).save()
        );
        await Promise.all(notifPromises);

        res.status(201).json(newBooking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all bookings (Admin view) or User's bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
    try {
        let bookings;

        // Admins see all bookings
        if (['classroom_admin', 'seminar_admin', 'sysadmin'].includes(req.user.role)) {
            bookings = await Booking.find()
                .populate('user', ['username', 'role'])
                .populate('user_id', ['username', 'role']) // Backward compat for old bookings
                .populate('venue_id', ['name', 'type']);
        } else {
            // Regular users only see their own bookings
            bookings = await Booking.find({
                $or: [{ user: req.user.id }, { user_id: req.user.id }]
            }).populate('venue_id', ['name', 'type']);
        }

        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Approve or Reject a booking
// @route   PUT /api/bookings/:id/status
// @access  Private (Admins only)
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status, rejection_reason } = req.body;

        // Check role
        if (!['classroom_admin', 'seminar_admin', 'sysadmin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // REQ_09: Require a rejection reason when rejecting
        if (status === 'rejected' && !rejection_reason) {
            return res.status(400).json({ message: 'Please provide a reason for rejection.' });
        }

        const booking = await Booking.findById(req.params.id).populate('venue_id');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = status;
        if (status === 'rejected') {
            booking.rejection_reason = rejection_reason;
        }
        await booking.save();

        // GENERATE NOTIFICATION FOR THE USER
        const venueName = booking.venue_id ? booking.venue_id.name : 'a venue';
        const formattedDate = new Date(booking.date).toLocaleDateString();

        // Fallbacks for backward compatibility
        const startTime = booking.start_time || booking.startTime || 'TBD';
        const endTime = booking.end_time || booking.endTime || 'TBD';
        const targetUserId = booking.user || booking.user_id;

        const notifMessage = status === 'approved'
            ? `Your request for ${venueName} on ${formattedDate} from ${startTime} to ${endTime} was approved.`
            : `Your request for ${venueName} on ${formattedDate} was rejected. Reason: ${rejection_reason}`;

        const newNotification = new Notification({
            user: targetUserId,
            title: `Booking ${status === 'approved' ? 'Approved ✅' : 'Rejected ❌'}`,
            message: notifMessage,
            type: status === 'approved' ? 'success' : 'error'
        });
        await newNotification.save();

        res.json(booking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all approved bookings (for Calendar view)
// @route   GET /api/bookings/approved
// @access  Private
exports.getApprovedBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ status: 'approved' }).populate('venue_id', ['name', 'type']);
        res.json(bookings);
    } catch (err) {
        console.error('SERVER ERROR:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};
