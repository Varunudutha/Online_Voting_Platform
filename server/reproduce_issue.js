require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const testEmail = 'TestCase@Example.com';
        // Clean up previous test
        await User.deleteOne({ email: testEmail });
        await User.deleteOne({ email: testEmail.toLowerCase() });

        // Create user with mixed case
        await User.create({
            name: 'Test Setup',
            email: testEmail,
            password: 'Password123!',
            role: 'voter'
        });
        console.log(`Created user with email: ${testEmail}`);

        // Try to find with normalized email
        const normalized = testEmail.toLowerCase();
        const found = await User.findOne({ email: normalized });

        console.log(`Searching for: ${normalized}`);
        if (found) {
            console.log('Found user with normalized email!');
        } else {
            console.log('FAILED to find user with normalized email (Case Sensitivity Issue Confirmed)');
        }

        // Cleanup
        await User.deleteOne({ email: testEmail });

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
