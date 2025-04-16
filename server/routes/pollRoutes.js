const express = require('express');
const {
  createPoll,
  getPolls,
  getPoll,
  updatePoll,
  deletePoll,
  getUserPolls,
  getPollByLink
} = require('../controllers/pollController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getPolls);
router.get('/share/:link', getPollByLink);
router.get('/:id', optionalAuth, getPoll);

// Protected routes
router.post('/', protect, createPoll);
router.get('/user/me', protect, getUserPolls);
router.put('/:id', protect, updatePoll);
router.delete('/:id', protect, deletePoll);

module.exports = router; 