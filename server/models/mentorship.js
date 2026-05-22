const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expertise: [String],
  goals: [String],
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  sessions: [{
    date: Date,
    topic: String,
    notes: String,
    duration: Number,
    completed: Boolean
  }],
  progress: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String,
  frequency: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly', 'as-needed'],
    default: 'weekly'
  }
}, { timestamps: true });

module.exports = mongoose.model('Mentorship', mentorshipSchema);
