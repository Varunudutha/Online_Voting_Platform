const express = require('express');
const router = express.Router();
const {
    getElections,
    getElection,
    createElection,
    updateElection,
    deleteElection,
    addCandidate,
    deleteCandidate,
    startElection,
    endElection
} = require('../controllers/electionController');
const { protect, authorize, checkElectionOwnership } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getElections) // Anyone can view elections
    .post(protect, authorize('admin'), createElection);

// Specific routes must come BEFORE generic /:id routes
router.route('/candidates/:id')
    .delete(protect, authorize('admin'), deleteCandidate);

router.route('/:id/candidates')
    .post(protect, authorize('admin'), checkElectionOwnership, addCandidate);

router.route('/:id')
    .get(protect, checkElectionOwnership, getElection)
    .put(protect, authorize('admin'), checkElectionOwnership, updateElection)
    .delete(protect, authorize('admin'), checkElectionOwnership, deleteElection);

router.route('/:id/start')
    .put(protect, authorize('admin'), checkElectionOwnership, startElection);

router.route('/:id/end')
    .put(protect, authorize('admin'), checkElectionOwnership, endElection);

module.exports = router;
