const Achievement = require('../models/achievement');
const User = require('../models/users');
const Notification = require('../models/notification');

// AWARD ACHIEVEMENT
const awardAchievement = async (req, res) => {
  try {
    const { userId } = req.params;
    const { badge, category, title, description } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const achievement = new Achievement({
      user: userId,
      badge,
      category,
      title,
      description
    });

    await achievement.save();

    // Add to user's achievements
    user.achievements.push(achievement._id);
    await user.save();

    // Create notification
    const notification = new Notification({
      user: userId,
      type: 'achievement_earned',
      title: `Achievement Unlocked: ${badge}`,
      message: `Congratulations! You've earned the "${title}" achievement!`,
      relatedId: achievement._id
    });
    await notification.save();

    res.status(201).json({ message: 'Achievement awarded', data: achievement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET USER ACHIEVEMENTS
const getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;

    const achievements = await Achievement.find({
      user: userId,
      public: true
    }).sort({ earnedAt: -1 });

    res.status(200).json({
      message: 'Achievements fetched',
      achievements
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET LEADERBOARD
const getLeaderboard = async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;

    let match = { public: true };
    if (category) {
      match.category = category;
    }

    const leaderboard = await Achievement.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 },
          achievements: { $push: '$$ROOT' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      }
    ]);

    res.status(200).json({
      message: 'Leaderboard fetched',
      leaderboard
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  awardAchievement,
  getUserAchievements,
  getLeaderboard
};
