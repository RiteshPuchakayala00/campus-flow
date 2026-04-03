const mongoose = require('mongoose');
const User = require('./server/models/User');
require('dotenv').config();

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campus-flow');
        const users = await User.find({}, 'username role branch');
        console.log('--- USER LIST ---');
        users.forEach(u => {
            console.log(`Username: ${u.username} | Role: ${u.role} | Branch: ${u.branch}`);
        });
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkUsers();
