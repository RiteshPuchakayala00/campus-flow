const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    venue_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Venue',
        required: true
    },
    date: {
        type: Date, // Storing just the date part (YYYY-MM-DD)
        required: true
    },
    start_time: {
        type: String, // HH:MM format
        required: true
    },
    end_time: {
        type: String, // HH:MM format
        required: true
    },
    purpose: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'waitlisted', 'cancelled'],
        default: 'pending'
    },
    rejection_reason: {
        type: String,
        default: ''
    },
    event_name: {
        type: String,
        trim: true
    },
    participants_count: {
        type: Number,
        min: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
