require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Election = require('./models/Election');
const Vote = require('./models/Vote');
const Candidate = require('./models/Candidate');
const { getDashboardStats } = require('./controllers/voteController');

const mockReq = (user) => ({
    user
});

const mockRes = () => {
    const res = {};
    res.statusCode = 200;
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.body = data; return res; };
    return res;
};

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to: ${mongoose.connection.name}`);

        // Cleanup
        await User.deleteMany({ email: { $regex: 'stat_test_' } });
        await Election.deleteMany({ title: { $regex: 'Stat Test' } });
        await Vote.deleteMany({});
        await Candidate.deleteMany({ name: { $regex: 'Stat Cand' } });

        // Setup Users
        const adminA = await User.create({ name: 'Stat Admin A', email: 'stat_test_a@example.com', password: 'Password123!', role: 'admin' });
        const adminB = await User.create({ name: 'Stat Admin B', email: 'stat_test_b@example.com', password: 'Password123!', role: 'admin' });
        const voter = await User.create({ name: 'Stat Voter', email: 'stat_test_v@example.com', password: 'Password123!', role: 'voter' });

        // Setup Elections
        const electionA = await Election.create({
            title: 'Stat Test Election A',
            description: 'Owned by A',
            status: 'active',
            createdBy: adminA._id,
            eligibleVoters: [voter._id]
        });

        const electionB = await Election.create({
            title: 'Stat Test Election B',
            description: 'Owned by B',
            status: 'active',
            createdBy: adminB._id,
            eligibleVoters: []
        });

        // Setup Vote in Election A
        const candidateA = await Candidate.create({ name: 'Stat Cand A', party: 'Stat Party', electionId: electionA._id });
        await Vote.create({ electionId: electionA._id, candidateId: candidateA._id, userId: voter._id });

        console.log('--- STATS ISOLATION TEST ---');

        // Test Admin A Stats
        console.log('Checking Admin A Stats (Should see 1 election, 1 vote)...');
        const resA = mockRes();
        await getDashboardStats(mockReq(adminA), resA);
        const statsA = resA.body;
        console.log('Admin A Stats:', statsA);

        if (statsA.totalElections === 1 && statsA.totalVotes === 1) {
            console.log('SUCCESS: Admin A sees correct isolated stats.');
        } else {
            console.error('FAILURE: Admin A stats are wrong (likely global).');
        }

        // Test Admin B Stats
        console.log('Checking Admin B Stats (Should see 1 election, 0 votes)...');
        const resB = mockRes();
        await getDashboardStats(mockReq(adminB), resB);
        const statsB = resB.body;
        console.log('Admin B Stats:', statsB);

        // Before fix: Admin B sees 2 elections, 1 vote
        // After fix: Admin B sees 1 election, 0 votes
        if (statsB.totalElections === 1 && statsB.totalVotes === 0) {
            console.log('SUCCESS: Admin B sees correct isolated stats.');
        } else {
            console.error('FAILURE: Admin B stats are wrong (likely global).');
        }

        // Cleanup
        await User.deleteMany({ email: { $regex: 'stat_test_' } });
        await Election.deleteMany({ title: { $regex: 'Stat Test' } });
        await Vote.deleteMany({});
        await Candidate.deleteMany({ name: { $regex: 'Stat Cand' } });

        process.exit(0);
    } catch (e) {
        console.error('Script Error:', e);
        process.exit(1);
    }
};

run();
