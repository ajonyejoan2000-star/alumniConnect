const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Job', 'Internship', 'Scholarship', 'Hackathon', 'Event', 'Mentorship', 'Project', 'Other'],
    required: true
  },
  company: String,
  location: String,
  remote: {
    type: Boolean,
    default: false
  },
  salary: String,
  deadline: Date,
  skills: [String],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicants: [{
    user: mongoose.Schema.Types.ObjectId,
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }],
  saved: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  link: String,
  category: String
}, { timestamps: true });

module.exports = mongoose.model('Opportunity', opportunitySchema);
