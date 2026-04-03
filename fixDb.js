const mongoose = require('mongoose');
const User = require('./server/models/User');

async function fix() {
    try {
        await mongoose.connect('mongodb://localhost:27017/campus-flow');
        console.log('Connected to DB...');
        
        await User.updateOne({username: 'cse_admin'}, {role: 'classroom_admin', branch: 'CSE'});
        await User.updateOne({username: 'ece_admin'}, {role: 'classroom_admin', branch: 'ECE'});
        await User.updateOne({username: 'aids_admin'}, {role: 'classroom_admin', branch: 'AIDS'});
        
        console.log('Fixed users.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fix();
