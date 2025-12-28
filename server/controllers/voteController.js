const Vote = require('../models/Vote');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const User = require('../models/User');

// @desc    Cast a vote
// @route   POST /api/votes
// @access  Private/Voter
const castVote = async (req, res) => {
    const { electionId, candidateId } = req.body;
    const userId = req.user.id;

    // 1. Check if election exists and is active
    const election = await Election.findById(electionId);
    if (!election) {
        res.status(404);
        throw new Error('Election not found');
    }

    if (election.status !== 'active') {
        res.status(400);
        throw new Error('Election is not active');
    }

    // Eligibility Check
    // If eligibleVoters has users, we MUST check. If empty, it might be interpreted as public? 
    // BUT the requirement says "Verify user ID exists in election.eligibleVoters". 
    // Strict mode: If user is not in list, deny.
    // Assuming empty list means NO ONE can vote (private by default as per recent changes) or logic strictly requires presence.
    // Based on "Do NOT return elections where the voter is not eligible" logic, if list is empty, voter can't see it, so they can't vote.
    // If they hacked the ID, this check MUST fail. 

    // Strict Check: User ID MUST be in eligibleVoters
    const isEligible = election.eligibleVoters.some(
        (voterId) => voterId.toString() === userId.toString()
    );

    if (!isEligible) {
        res.status(403);
        throw new Error('You are not eligible to vote in this election');
    }

    // 2. Check if user has already voted (Double check via DB query + Unique Index catch)
    const existingVote = await Vote.findOne({ electionId, userId });
    if (existingVote) {
        res.status(400);
        throw new Error('You have already voted in this election');
    }

    try {
        // 3. Create Vote
        const vote = await Vote.create({
            electionId,
            candidateId,
            userId
        });

        // 4. Update Candidate Vote Count (Atomic increment)
        await Candidate.findByIdAndUpdate(candidateId, { $inc: { voteCount: 1 } });

        // 5. Update User's history
        // 5. Update User's history
        await User.findByIdAndUpdate(userId, { $push: { hasVotedIn: electionId } });

        // 6. Real-time Update
        const io = req.app.get('io');
        if (io) {
            // Get updated vote count (optimistic or fetched)
            // Ideally fetch, but increment + 1 is safe enough for display if we are consistent
            // Let's refetch specific candidate to be sure
            const updatedCandidate = await Candidate.findById(candidateId);

            io.to(electionId).emit('voteUpdate', {
                electionId,
                candidateId,
                newVoteCount: updatedCandidate.voteCount
            });
        }

        res.status(201).json(vote);
    } catch (error) {
        // Handle race condition where unique index might throw
        if (error.code === 11000) {
            res.status(400);
            throw new Error('You have already voted in this election');
        }
        throw error;
    }
};

// @desc    Get results for an election
// @route   GET /api/votes/results/:electionId
// @access  Public (or protected)
const getElectionResults = async (req, res) => {
    const election = await Election.findById(req.params.electionId).populate('candidates');

    if (!election) {
        res.status(404);
        throw new Error('Election not found');
    }

    // If needed, we can re-aggregate from Vote collection to verify consistency,
    // but using the cached voteCount in Candidate is faster for read.
    // For critical systems, we might do both. For this, cached is fine.

    // If user is a voter, they can only see results if election is ended
    if (req.user.role === 'voter' && election.status !== 'ended') {
        res.status(403);
        throw new Error('Results are not available until the election ends');
    }

    // Sort candidates by vote count
    const results = election.candidates.sort((a, b) => b.voteCount - a.voteCount);

    res.status(200).json(results);
};

// @desc    Get dashboard stats
// @route   GET /api/votes/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    // Strict isolation: Admins only see their own stats
    const adminId = req.user.id;

    // 1. Elections created by this admin
    const query = { createdBy: adminId };
    const totalElections = await Election.countDocuments(query);
    const activeElections = await Election.countDocuments({ ...query, status: 'active' });

    // 2. Votes for elections created by this admin
    // Find all election IDs owned by admin
    const myElections = await Election.find(query).select('_id');
    const myElectionIds = myElections.map(e => e._id);

    // Count votes where electionId is in the owned list
    const totalVotes = await Vote.countDocuments({ electionId: { $in: myElectionIds } });

    // Prevent caching of sensitive admin stats
    res.set('Cache-Control', 'no-store');

    res.status(200).json({
        totalElections,
        activeElections,
        totalVotes
    });
};

module.exports = {
    castVote,
    getElectionResults,
    getDashboardStats
};
