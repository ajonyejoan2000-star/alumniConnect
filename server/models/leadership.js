const mongoose = require('mongoose');

const leadershipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['ambassador', 'coordinator', 'moderator', 'organizer', 'fundraiser', 'board_member'],
    required: true
  },
  title: String,
  department: {
    type: String,
    enum: ['Community', 'Events', 'Mentorship', 'Careers', 'Initiatives', 'Communications']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  responsibilities: [String],
  initiatives: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Initiative'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Leadership', leadershipSchema);
