const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  badge: {
    type: String,
    enum: ['mentor_hero', 'networking_star', 'event_organizer', 'job_board_success', 'leadership_award', 'community_champion', 'innovator', 'global_connector'],
    required: true
  },
  category: {
    type: String,
    enum: ['Mentorship', 'Networking', 'Leadership', 'Community', 'Career', 'Innovation'],
    required: true
  },
  criteria: String,
  earnedAt: {
    type: Date,
    default: Date.now
  },
  public: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);
