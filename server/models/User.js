const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['faculty', 'cr', 'event_organizer', 'classroom_admin', 'seminar_admin', 'sysadmin'],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
