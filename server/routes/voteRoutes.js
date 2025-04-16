const express = require('express');
const {
  submitVote,
  getPollVotes,
  getPollStats,
  checkUserVoted
} = require('../controllers/voteController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes with optional authentication
router.post('/', optionalAuth, submitVote);
router.get('/poll/:pollId', optionalAuth, getPollVotes);
router.get('/stats/:pollId', optionalAuth, getPollStats);
router.get('/check/:pollId', optionalAuth, checkUserVoted);

module.exports = router; 