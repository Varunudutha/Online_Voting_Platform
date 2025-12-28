const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    party: {
        type: String,
        required: [true, 'Please add a party name']
    },
    photoUrl: {
        type: String,
        default: 'https://via.placeholder.com/150' // Placeholder for now
    },
    electionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true
    },
    voteCount: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Candidate', candidateSchema);
