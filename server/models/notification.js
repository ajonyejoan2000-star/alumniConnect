const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['message', 'event_invitation', 'mentorship_request', 'opportunity_match', 'achievement_earned', 'discussion_reply', 'connection_request', 'event_reminder', 'announcement'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: String,
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedId: mongoose.Schema.Types.ObjectId,
  link: String,
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  emailSent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
