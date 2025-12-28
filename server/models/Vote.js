const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    electionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Candidate',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate votes by same user in same election
voteSchema.index({ electionId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
