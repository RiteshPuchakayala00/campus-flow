const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Venue = require('./models/Venue');

dotenv.config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Venue.deleteMany({});
        console.log('Cleared existing data.');

        // 1. Create Users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const users = await User.insertMany([
            { username: 'admin_sys', password: hashedPassword, role: 'sysadmin' },
            { username: 'admin_classroom', password: hashedPassword, role: 'classroom_admin' },
            { username: 'faculty_john', password: hashedPassword, role: 'faculty' },
            { username: 'cr_mary', password: hashedPassword, role: 'cr' }
        ]);
        console.log('Users seeded successfully! (All passwords are "password123")');

        // 2. Create Venues
        const adminClassroom = users.find(u => u.role === 'classroom_admin')._id;

        await Venue.insertMany([
            { name: 'Room 101', type: 'classroom', capacity: 60, admin_id: adminClassroom },
            { name: 'Room 102', type: 'classroom', capacity: 40, admin_id: adminClassroom },
            { name: 'Main Auditorium', type: 'seminar_hall', capacity: 500, admin_id: adminClassroom },
            { name: 'Seminar Hall A', type: 'seminar_hall', capacity: 150, admin_id: adminClassroom }
        ]);
        console.log('Venues seeded successfully!');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
