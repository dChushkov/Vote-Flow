const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema(
  {
    poll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Poll',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Not required because anonymous voting is allowed
    },
    ipAddress: {
      type: String,
      // For anonymous votes tracking
    },
    selectedOptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        // This will reference the _id of an option in the Poll.options array
      },
    ],
    textResponse: {
      type: String,
      // For open text responses
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting more than one vote per poll if poll settings don't allow it
VoteSchema.index({ poll: 1, user: 1 }, { unique: true, partialFilterExpression: { user: { $exists: true } } });
VoteSchema.index({ poll: 1, ipAddress: 1 }, { unique: true, partialFilterExpression: { ipAddress: { $exists: true }, user: { $exists: false } } });

// This middleware will run after a vote is saved
VoteSchema.post('save', async function() {
  try {
    // Update poll's totalVotes count
    const Poll = mongoose.model('Poll');
    await Poll.findByIdAndUpdate(this.poll, { $inc: { totalVotes: 1 } });
    
    // Update vote counts for each selected option
    if (this.selectedOptions && this.selectedOptions.length > 0) {
      for (const optionId of this.selectedOptions) {
        await Poll.updateOne(
          { _id: this.poll, "options._id": optionId },
          { $inc: { "options.$.voteCount": 1 } }
        );
      }
    }
  } catch (error) {
    console.error('Error updating poll vote counts:', error);
  }
});

module.exports = mongoose.model('Vote', VoteSchema); 