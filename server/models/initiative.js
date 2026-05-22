const mongoose = require('mongoose');

const initiativeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  leaders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  goal: String,
  status: {
    type: String,
    enum: ['idea', 'planning', 'active', 'completed', 'paused'],
    default: 'idea'
  },
  category: {
    type: String,
    enum: ['Social', 'Professional', 'Educational', 'Fundraising', 'Community Service']
  },
  startDate: Date,
  endDate: Date,
  updates: [String],
  impact: String,
  votes: [{
    user: mongoose.Schema.Types.ObjectId,
    type: { type: String, enum: ['upvote', 'downvote'] }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Initiative', initiativeSchema);
