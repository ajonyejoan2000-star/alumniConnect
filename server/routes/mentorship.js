const express = require('express');
const protect = require('../middleware/protect');
const {
  requestMentorship,
  getMentorshipMatches,
  getMyMentorships,
  logSession,
  completeMentorship
} = require('../controllers/mentorship');

const router = express.Router();

router.post('/request', protect, requestMentorship);
router.get('/matches', protect, getMentorshipMatches);
router.get('/my-mentorships', protect, getMyMentorships);
router.post('/:mentorshipId/log-session', protect, logSession);
router.post('/:mentorshipId/complete', protect, completeMentorship);

module.exports = router;
