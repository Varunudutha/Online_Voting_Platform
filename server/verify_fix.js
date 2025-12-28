require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const rawEmail = 'TestCase@Example.com';
        const normalizedEmail = rawEmail.trim().toLowerCase(); // Simulating controller logic

        // Clean up
        await User.deleteOne({ email: normalizedEmail });

        // Create user (Simulating registerUser with normalization)
        await User.create({
            name: 'Test Setup',
            email: normalizedEmail,
            password: 'Password123!',
            role: 'voter'
        });
        console.log(`Created user with email: ${normalizedEmail}`);

        // Try to find (Simulating loginUser)
        const found = await User.findOne({ email: normalizedEmail }).select('+password');

        console.log(`Searching for: ${normalizedEmail}`);
        if (found) {
            console.log('SUCCESS: Found user with normalized email!');

            // Verify password match
            const isMatch = await found.matchPassword('Password123!');
            console.log('Password Match:', isMatch);
        } else {
            console.log('FAILED to find user');
        }

        // Cleanup
        await User.deleteOne({ email: normalizedEmail });

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
