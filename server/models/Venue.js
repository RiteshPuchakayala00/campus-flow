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
    }
}, { timestamps: true });

module.exports = mongoose.model('Venue', venueSchema);
