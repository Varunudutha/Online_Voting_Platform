const Election = require('../models/Election');
const Candidate = require('../models/Candidate'); // Ensure this model exists

// @desc    Get all elections (for Admin/Voter)
// @route   GET /api/elections
// @access  Public (or Protected depending on requirements)
// @desc    Get all elections (for Admin/Voter)
// @route   GET /api/elections
// @access  Public (or Protected depending on requirements)
const getElections = async (req, res) => {
    let query = {};

    if (req.user.role === 'admin') {
        // Admin: Only see elections created by them
        query = { createdBy: req.user.id };
    } else if (req.user.role === 'voter') {
        // Voter: Only see elections where they are explicitly allowed
        query = { eligibleVoters: req.user.id };
    }

    const elections = await Election.find(query).populate('candidates');
    res.status(200).json(elections);
};

// @desc    Get single election
// @route   GET /api/elections/:id
// @access  Public
const getElection = async (req, res) => {
    const election = await Election.findById(req.params.id)
        .populate('candidates')
        .populate('eligibleVoters', 'name email'); // Populate for Admin view

    if (!election) {
        res.status(404);
        throw new Error('Election not found');
    }

    // Security check for single election view if voter
    // Security check
    if (req.user.role === 'admin') {
        // Admin must own the election
        if (election.createdBy.toString() !== req.user.id) {
            res.status(403);
            throw new Error('Not authorized to view this election');
        }
    } else {
        // Voter must be eligible
        const isEligible = election.eligibleVoters.some(v => v._id.toString() === req.user.id);
        if (!isEligible) {
            res.status(403);
            throw new Error('Not authorized to view this election');
        }
    }

    res.status(200).json(election);
};

// @desc    Create new election
// @route   POST /api/elections
// @access  Private/Admin
const createElection = async (req, res) => {
    const { title, description, eligibleVoters } = req.body;

    const election = await Election.create({
        title,
        description,
        status: 'upcoming',
        eligibleVoters: eligibleVoters || [],
        createdBy: req.user.id
    });

    res.status(201).json(election);
};

// @desc    Update election (status, etc)
// @route   PUT /api/elections/:id
// @access  Private/Admin
const updateElection = async (req, res) => {
    const election = await Election.findById(req.params.id);

    if (!election) {
        res.status(404);
        throw new Error('Election not found');
    }

    // Ownership Check
    if (election.createdBy.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to update this election');
    }

    if (election.status !== 'upcoming') {
        res.status(400);
        throw new Error('Cannot update an election that has started or ended');
    }

    const updatedElection = await Election.findByIdAndUpdate(
        req.params.id,
        req.body, // Now includes allowedVoters
        { new: true, runValidators: true }
    );

    res.status(200).json(updatedElection);
};

// @desc    Delete election
// @route   DELETE /api/elections/:id
// @access  Private/Admin
const deleteElection = async (req, res) => {
    const election = await Election.findById(req.params.id);

    if (!election) {
        res.status(404);
        throw new Error('Election not found');
    }

    // Ownership Check
    if (election.createdBy.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to delete this election');
    }

    await election.deleteOne();

    res.status(200).json({ id: req.params.id });
};

// @desc    Start election manually
// @route   PUT /api/elections/:id/start
// @access  Private/Admin
const startElection = async (req, res) => {
    const election = await Election.findById(req.params.id);
    if (!election) {
        res.status(404);
        throw new Error('Election not found');
    }

    // Ownership Check
    if (election.createdBy.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to start this election');
    }

    election.status = 'active';
    await election.save();

    res.status(200).json(election);
};

// @desc    End election manually
// @route   PUT /api/elections/:id/end
// @access  Private/Admin
const endElection = async (req, res) => {
    const election = await Election.findById(req.params.id);
    if (!election) {
        res.status(404);
        throw new Error('Election not found');
    }

    // Ownership Check
    if (election.createdBy.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to end this election');
    }

    election.status = 'ended';
    await election.save();

    res.status(200).json(election);
};

// @desc    Add candidate to election
// @route   POST /api/elections/:id/candidates
// @access  Private/Admin
const addCandidate = async (req, res) => {
    const { name, party, photoUrl } = req.body;
    const electionId = req.params.id;

    const election = await Election.findById(electionId);
    if (!election) {
        res.status(404);
        throw new Error('Election not found');
    }

    // Ownership Check
    if (election.createdBy.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to add candidates to this election');
    }

    if (election.status !== 'upcoming') {
        res.status(400);
        throw new Error('Cannot add candidates to an election that has started or ended');
    }

    const candidate = await Candidate.create({
        name,
        party,
        photoUrl,
        electionId
    });

    // Add candidate to election array
    election.candidates.push(candidate._id);
    await election.save();

    res.status(201).json(candidate);
};

// @desc    Delete candidate
// @route   DELETE /api/elections/candidates/:id
// @access  Private/Admin
const deleteCandidate = async (req, res) => {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
        res.status(404);
        throw new Error('Candidate not found');
    }

    // Remove from election
    const election = await Election.findById(candidate.electionId);
    if (election) {
        // Ownership Check
        if (election.createdBy.toString() !== req.user.id) {
            res.status(403);
            throw new Error('Not authorized to delete candidates from this election');
        }

        if (election.status !== 'upcoming') {
            res.status(400);
            throw new Error('Cannot remove candidates from an election that has started or ended');
        }
        election.candidates = election.candidates.filter(
            (id) => id.toString() !== candidate._id.toString()
        );
        await election.save();
    }

    await candidate.deleteOne();

    res.status(200).json({ id: req.params.id });
};

module.exports = {
    getElections,
    getElection,
    createElection,
    updateElection,
    deleteElection,
    startElection,
    endElection,
    addCandidate,
    deleteCandidate
};
