const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['classroom', 'seminar_hall'],
        required: true
    },
    branch: {
        type: String,
        enum: ['CSE', 'ECE', 'AIDS', 'General'],
        default: 'General'
    },
    capacity: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        default: ''   // optional photo URL for venue card
    },
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional: link venue to specific admin
    },
    weekly_schedule: [{
        day: { type: Number, required: true }, // 0 = Sun, 1 = Mon, ..., 6 = Sat
        start_time: { type: String, required: true },
        end_time: { type: String, required: true },
        label: { type: String, required: true }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Venue', venueSchema);
