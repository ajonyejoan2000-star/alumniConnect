const express = require('express');
const protect = require('../middleware/protect');
const {
  awardAchievement,
  getUserAchievements,
  getLeaderboard
} = require('../controllers/achievements');

const router = express.Router();

router.post('/:userId/award', protect, awardAchievement);
router.get('/user/:userId', getUserAchievements);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
