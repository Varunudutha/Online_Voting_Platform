const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Election = require('./models/Election');
const Candidate = require('./models/Candidate');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        await User.deleteMany({});
        await Election.deleteMany({});
        await Candidate.deleteMany({});

        // Create Admin
        await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin'
        });

        // Create Voter
        await User.create({
            name: 'John Doe',
            email: 'voter@example.com',
            password: 'password123',
            role: 'voter'
        });

        // Create LIVE Election
        const election = await Election.create({
            title: 'Student Council Election 2024',
            description: 'Vote for your favorite candidate for the student council president.',
            status: 'active'
        });

        // Add Candidates
        await Candidate.create([
            {
                name: 'Alice Johnson',
                party: 'Progressive Party',
                electionId: election._id,
                photoUrl: 'https://randomuser.me/api/portraits/women/44.jpg'
            },
            {
                name: 'Bob Smith',
                party: 'Liberty Alliance',
                electionId: election._id,
                photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg'
            },
            {
                name: 'Charlie Davis',
                party: 'Independent',
                electionId: election._id,
                photoUrl: 'https://randomuser.me/api/portraits/men/86.jpg'
            }
        ]);

        // Add candidates to election array
        const candidates = await Candidate.find({ electionId: election._id });
        election.candidates = candidates.map(c => c._id);
        await election.save();

        console.log('Data Seeded: Users, Live Election, and Candidates created!');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
