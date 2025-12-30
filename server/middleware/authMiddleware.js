const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Election = require('../models/Election');
const Vote = require('../models/Vote');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id);
            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            res.status(403);
            throw new Error(`User role ${req.user.role} is not authorized to access this route`);
        }
        next();
    };
};

const checkElectionOwnership = async (req, res, next) => {
    // 1. Identify Election ID (handles :id or :electionId)
    const electionId = req.params.id || req.params.electionId;

    if (!electionId) {
        res.status(400);
        throw new Error('Election ID is missing in request parameters');
    }

    // 2. Fetch Election
    const election = await Election.findById(electionId);

    if (!election) {
        res.status(404);
        throw new Error('Election not found');
    }

    // 3. Admin Ownership Check
    if (req.user.role === 'admin') {
        if (election.createdBy.toString() !== req.user.id) {
            res.status(403);
            throw new Error('Access Denied: You do not own this election');
        }
    } else if (req.user.role === 'voter') {
        const isEligible = election.eligibleVoters.some(v => v.toString() === req.user.id);
        const hasVoted = await Vote.exists({ electionId: election._id, userId: req.user.id });

        if (!isEligible && !hasVoted) {
            res.status(403);
            throw new Error('Access Denied: You are not eligible for this election');
        }
    }

    // Attach election to request object for downstream use (optimization)
    req.election = election;
    next();
};

module.exports = { protect, authorize, checkElectionOwnership };
