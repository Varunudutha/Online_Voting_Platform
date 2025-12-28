const express = require('express');
const router = express.Router();
const { castVote, getElectionResults, getDashboardStats } = require('../controllers/voteController');
const { protect, authorize, checkElectionOwnership } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('voter', 'admin'), castVote); // Admin can vote too as a person? usually yes.
router.get('/results/:electionId', protect, checkElectionOwnership, getElectionResults);
router.get('/stats', protect, authorize('admin'), getDashboardStats);

module.exports = router;
