const Poll = require('../models/Poll');
const Vote = require('../models/Vote');

// @desc    Create new poll
// @route   POST /api/polls
// @access  Private
exports.createPoll = async (req, res) => {
  try {
    const { title, description, questionType, options, settings } = req.body;

    console.log('Received poll data:', { title, questionType, options });

    // Create poll with proper options format
    const poll = await Poll.create({
      title,
      description,
      questionType,
      options: Array.isArray(options) 
        ? options.map(option => {
            // Handle if option is already an object with text property
            if (typeof option === 'object' && option.text) {
              return { text: option.text };
            }
            // Handle if option is a string
            return { text: option };
          })
        : [],
      settings,
      creator: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: poll,
    });
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all polls
// @route   GET /api/polls
// @access  Public
exports.getPolls = async (req, res) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Get creator ID if filtering by creator
    const creatorFilter = req.query.creator ? { creator: req.query.creator } : {};
    
    // Find polls
    const polls = await Poll.find(creatorFilter)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('creator', 'name email');
    
    // Get total documents
    const total = await Poll.countDocuments(creatorFilter);
    
    res.json({
      success: true,
      count: polls.length,
      total,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
      },
      data: polls,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single poll
// @route   GET /api/polls/:id
// @access  Public
exports.getPoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate('creator', 'name');

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    res.json({
      success: true,
      data: poll,
    });
  } catch (error) {
    console.error(error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get poll by shareable link
// @route   GET /api/polls/share/:link
// @access  Public
exports.getPollByLink = async (req, res) => {
  try {
    const poll = await Poll.findOne({ shareableLink: req.params.link }).populate('creator', 'name');

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    res.json({
      success: true,
      data: poll,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update poll
// @route   PUT /api/polls/:id
// @access  Private
exports.updatePoll = async (req, res) => {
  try {
    let poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    // Make sure user is poll creator
    if (poll.creator.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this poll' });
    }

    // Don't allow updating options if votes already exist
    if (poll.totalVotes > 0 && req.body.options) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot update poll options after voting has started' 
      });
    }

    poll = await Poll.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: poll,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete poll
// @route   DELETE /api/polls/:id
// @access  Private
exports.deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    // Make sure user is poll creator
    if (poll.creator.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this poll' });
    }

    // Delete the poll (and middleware will handle deleting votes)
    await Poll.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get polls created by logged in user
// @route   GET /api/polls/user
// @access  Private
exports.getUserPolls = async (req, res) => {
  try {
    const polls = await Poll.find({ creator: req.user.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: polls.length,
      data: polls,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}; 