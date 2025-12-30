const mongoose = require('mongoose');
const Election = require('./models/Election');
const Vote = require('./models/Vote');
const User = require('./models/User'); // Assuming User model path
require('dotenv').config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clean up previous test data
        const testUserEmail = 'testverify@example.com';
        await User.deleteOne({ email: testUserEmail });
        await Election.deleteMany({ title: 'Verify Election' });
        await Vote.deleteMany({}); // Be careful, but for verify script on local... wait, this is live.
        // DO NOT DELETE ALL VOTES. Only delete votes for test user.

        // 1. Create Test User
        const user = await User.create({
            name: 'Verify User',
            email: testUserEmail,
            password: 'Password123!',
            role: 'voter'
        });
        console.log('User created:', user._id);

        // 2. Create Election 1 (Eligible)
        const electionEligible = await Election.create({
            title: 'Verify Election - Eligible',
            description: 'User is eligible but has not voted',
            status: 'ended', // Completed to test history
            eligibleVoters: [user._id],
            createdBy: user._id // Hack: assuming user creation allowed or using admin.
            // Wait, createdBy needs to be admin. We need an admin ID. 
            // We'll skip createdBy constraint validation validation if possible or mock it.
            // But validation is "required: true". Check User model.
        });
        // We need a valid Admin ID. Let's find one.
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) throw new Error('No admin found to create election');

        electionEligible.createdBy = admin._id;
        await electionEligible.save();
        console.log('Election Eligible created:', electionEligible._id);

        // 3. Create Election 2 (Not Eligible, but Voted)
        const electionVoted = await Election.create({
            title: 'Verify Election - Voted',
            description: 'User voted but is NOT in eligible list (simulating)',
            status: 'ended',
            eligibleVoters: [],
            createdBy: admin._id
        });
        console.log('Election Voted created:', electionVoted._id);

        // Create Vote
        await Vote.create({
            electionId: electionVoted._id,
            candidateId: new mongoose.Types.ObjectId(), // Fake candidate
            userId: user._id
        });
        console.log('Vote cast for Election Voted');

        // 4. Create Election 3 (Neither)
        const electionNeither = await Election.create({
            title: 'Verify Election - Neither',
            description: 'Should NOT see this',
            status: 'ended',
            eligibleVoters: [],
            createdBy: admin._id
        });
        console.log('Election Neither created:', electionNeither._id);

        // 5. Run Query Logic (Simulate Controller)
        const userVotes = await Vote.find({ userId: user._id }).select('electionId');
        const votedElectionIds = userVotes.map(vote => vote.electionId);

        const query = {
            $or: [
                { eligibleVoters: user._id },
                { _id: { $in: votedElectionIds } }
            ]
        };

        const results = await Election.find(query);
        const resultIds = results.map(e => e._id.toString());

        console.log('--- Results ---');
        console.log('Found Elections:', results.length);
        console.log('Contains Eligible?', resultIds.includes(electionEligible._id.toString()));
        console.log('Contains Voted?', resultIds.includes(electionVoted._id.toString()));
        console.log('Contains Neither?', resultIds.includes(electionNeither._id.toString()));

        if (resultIds.includes(electionEligible._id.toString()) &&
            resultIds.includes(electionVoted._id.toString()) &&
            !resultIds.includes(electionNeither._id.toString())) {
            console.log('✅ VERIFICATION SUCCESS');
        } else {
            console.log('❌ VERIFICATION FAILED');
        }

        // Cleanup
        await User.deleteOne({ _id: user._id });
        await Election.deleteOne({ _id: electionEligible._id });
        await Election.deleteOne({ _id: electionVoted._id });
        await Election.deleteOne({ _id: electionNeither._id });
        await Vote.deleteMany({ userId: user._id });

        process.exit();

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

run();
