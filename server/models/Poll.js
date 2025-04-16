const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    questionType: {
      type: String,
      enum: ['single', 'multiple', 'text'],
      default: 'single',
      required: true,
    },
    options: [
      {
        text: {
          type: String,
          required: function() {
            return this.questionType !== 'text';
          },
          trim: true,
        },
        voteCount: {
          type: Number,
          default: 0,
        },
      },
    ],
    settings: {
      requireLogin: {
        type: Boolean,
        default: false,
      },
      allowMultipleVotes: {
        type: Boolean,
        default: false,
      },
      endDate: {
        type: Date,
        default: null,
      },
      showResults: {
        type: Boolean,
        default: true,
      },
    },
    shareableLink: {
      type: String,
      unique: true,
    },
    totalVotes: {
      type: Number,
      default: 0,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Cascade delete votes when a poll is deleted - updated for Mongoose 8.x
PollSchema.pre('findOneAndDelete', async function (next) {
  const poll = await this.model.findOne(this.getFilter());
  if (poll) {
    await mongoose.model('Vote').deleteMany({ poll: poll._id });
  }
  next();
});

// Also handle deleteMany
PollSchema.pre('deleteMany', async function (next) {
  const polls = await this.model.find(this.getFilter());
  if (polls.length > 0) {
    const pollIds = polls.map(poll => poll._id);
    await mongoose.model('Vote').deleteMany({ poll: { $in: pollIds } });
  }
  next();
});

// Reverse populate with votes
PollSchema.virtual('votes', {
  ref: 'Vote',
  localField: '_id',
  foreignField: 'poll',
  justOne: false,
});

// Generate shareable link before saving
PollSchema.pre('save', function(next) {
  if (!this.shareableLink) {
    this.shareableLink = Math.random().toString(36).substring(2, 10);
  }
  next();
});

module.exports = mongoose.model('Poll', PollSchema); 