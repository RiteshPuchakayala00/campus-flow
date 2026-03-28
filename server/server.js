const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting – max 10 login attempts per 15 minutes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(express.json());

// Main Route
app.get('/', (req, res) => {
    res.send('Smart Class and Halls Vacancy Sharing System API is running');
});

// Import Routes
const authRoutes = require('./routes/auth');
const venueRoutes = require('./routes/venues');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const aiRoutes = require('./routes/ai');
const notificationRoutes = require('./routes/notifications');

app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Apply rate limit specifically to login
app.use('/api/auth/login', authLimiter);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Start the server for Render
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
