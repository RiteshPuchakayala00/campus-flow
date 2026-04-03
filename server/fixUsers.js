const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const admins = [
    { username: 'cse_admin', password: 'password123', role: 'classroom_admin', branch: 'CSE' },
    { username: 'ece_admin', password: 'password123', role: 'classroom_admin', branch: 'ECE' },
    { username: 'aids_admin', password: 'password123', role: 'classroom_admin', branch: 'AIDS' }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campus-flow');
        console.log('Connected to DB...');
        
        for (let a of admins) {
            const existing = await User.findOne({ username: a.username });
            if (existing) {
                console.log(`User ${a.username} already exists with role: ${existing.role}. Updating role and branch.`);
                existing.role = a.role;
                existing.branch = a.branch;
                await existing.save();
                continue;
            }
            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(a.password, salt);
            
            const newUser = new User({
                username: a.username,
                password: hashedPassword,
                role: a.role,
                branch: a.branch
            });
            await newUser.save();
            console.log(`Created ${a.username} (${a.role} for ${a.branch})`);
        }
        
        const allUsers = await User.find({}, 'username role branch');
        console.log("All users in DB:", allUsers);
        
        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
