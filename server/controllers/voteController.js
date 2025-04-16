const Vote = require('../models/Vote');
const Poll = require('../models/Poll');

// @desc    Submit a vote
// @route   POST /api/votes
// @access  Public/Private (depends on poll settings)
exports.submitVote = async (req, res) => {
  try {
    const { pollId, selectedOptions, textResponse } = req.body;
    
    // Check if poll exists
    const poll = await Poll.findById(pollId);
    
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }
    
    // Check if poll is still active
    if (!poll.isActive) {
      return res.status(400).json({ success: false, message: 'This poll is no longer active' });
    }
    
    // Check if poll has ended
    if (poll.settings.endDate && new Date(poll.settings.endDate) < new Date()) {
      // Update poll to inactive
      await Poll.findByIdAndUpdate(pollId, { isActive: false });
      return res.status(400).json({ success: false, message: 'This poll has ended' });
    }
    
    // Check if login is required
    if (poll.settings.requireLogin && !req.user) {
      return res.status(401).json({ success: false, message: 'Login required to vote on this poll' });
    }
    
    // Check if user has already voted
    let existingVote = null;
    
    if (req.user) {
      existingVote = await Vote.findOne({ poll: pollId, user: req.user.id });
    } else {
      // For anonymous votes, check by IP
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      existingVote = await Vote.findOne({ poll: pollId, ipAddress, user: { $exists: false } });
    }
    
    // If user already voted and multiple votes are not allowed
    if (existingVote && !poll.settings.allowMultipleVotes) {
      return res.status(400).json({ success: false, message: 'You have already voted on this poll' });
    }
    
    // For text response type
    if (poll.questionType === 'text') {
      if (!textResponse) {
        return res.status(400).json({ success: false, message: 'Text response is required' });
      }
    } 
    // For single/multiple choice
    else {
      if (!selectedOptions || (poll.questionType === 'single' && selectedOptions.length !== 1) || 
          (selectedOptions.length === 0)) {
        return res.status(400).json({ 
          success: false, 
          message: poll.questionType === 'single' 
            ? 'Please select exactly one option' 
            : 'Please select at least one option' 
        });
      }
      
      // Validate that all selected options exist in the poll
      const optionIds = poll.options.map(option => option._id.toString());
      const validOptions = selectedOptions.every(option => optionIds.includes(option));
      
      if (!validOptions) {
        return res.status(400).json({ success: false, message: 'Invalid option selected' });
      }
    }
    
    // Create the vote
    const voteData = {
      poll: pollId,
      selectedOptions: poll.questionType !== 'text' ? selectedOptions : [],
      textResponse: poll.questionType === 'text' ? textResponse : '',
    };
    
    // Add user if logged in, otherwise add IP
    if (req.user) {
      voteData.user = req.user.id;
    } else {
      voteData.ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    }
    
    // If user is allowed multiple votes and has voted before, update the vote
    if (existingVote && poll.settings.allowMultipleVotes) {
      Object.assign(existingVote, voteData);
      await existingVote.save();
      
      res.json({
        success: true,
        message: 'Vote updated successfully',
        data: existingVote,
      });
    } else {
      // Create new vote
      const vote = await Vote.create(voteData);
      
      res.status(201).json({
        success: true,
        message: 'Vote submitted successfully',
        data: vote,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get votes for a poll
// @route   GET /api/votes/poll/:pollId
// @access  Public/Private (depends on poll settings)
exports.getPollVotes = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.pollId);
    
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }
    
    // Check if results are hidden
    if (!poll.settings.showResults) {
      // If user is not creator, don't show results
      if (!req.user || poll.creator.toString() !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Results are hidden for this poll' 
        });
      }
    }
    
    // Get votes with pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const startIndex = (page - 1) * limit;
    
    const votes = await Vote.find({ poll: req.params.pollId })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('user', 'name');
    
    const total = await Vote.countDocuments({ poll: req.params.pollId });
    
    res.json({
      success: true,
      count: votes.length,
      total,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
      },
      data: votes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get vote statistics for a poll
// @route   GET /api/votes/stats/:pollId
// @access  Public/Private (depends on poll settings)
exports.getPollStats = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.pollId);
    
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }
    
    // Check if results are hidden
    if (!poll.settings.showResults) {
      // If user is not creator, don't show results
      if (!req.user || poll.creator.toString() !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Results are hidden for this poll' 
        });
      }
    }
    
    // For text responses, return the actual text responses
    if (poll.questionType === 'text') {
      const textResponses = await Vote.find(
        { poll: req.params.pollId, textResponse: { $exists: true, $ne: '' } },
        { textResponse: 1, createdAt: 1, _id: 0 }
      ).sort({ createdAt: -1 });
      
      return res.json({
        success: true,
        pollType: 'text',
        totalVotes: textResponses.length,
        data: textResponses,
      });
    }
    
    // For single/multiple choice, return option statistics
    // Calculate the total number of votes for all options (sum of voteCount)
    // This is important for multiple choice where a user can vote for multiple options
    const totalSelections = poll.options.reduce((sum, option) => sum + option.voteCount, 0);
    
    const stats = poll.options.map(option => ({
      optionId: option._id,
      text: option.text,
      voteCount: option.voteCount,
      percentage: totalSelections > 0 
        ? Math.round((option.voteCount / totalSelections) * 100) 
        : 0,
    }));
    
    res.json({
      success: true,
      pollType: poll.questionType,
      totalVotes: poll.totalVotes,
      totalSelections: totalSelections,
      data: stats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Check if user has voted on a poll
// @route   GET /api/votes/check/:pollId
// @access  Public/Private
exports.checkUserVoted = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.pollId);
    
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }
    
    let hasVoted = false;
    let vote = null;
    
    if (req.user) {
      // If user is logged in, check by user ID
      vote = await Vote.findOne({ poll: req.params.pollId, user: req.user.id });
      hasVoted = !!vote;
    } else {
      // If anonymous, check by IP
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      vote = await Vote.findOne({ 
        poll: req.params.pollId, 
        ipAddress, 
        user: { $exists: false } 
      });
      hasVoted = !!vote;
    }
    
    res.json({
      success: true,
      hasVoted,
      canVoteAgain: hasVoted ? poll.settings.allowMultipleVotes : true,
      vote: hasVoted ? {
        selectedOptions: vote.selectedOptions,
        textResponse: vote.textResponse,
        createdAt: vote.createdAt
      } : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}; 