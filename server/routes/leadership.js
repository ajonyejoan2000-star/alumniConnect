const express = require('express');
const protect = require('../middleware/protect');
const adminOnly = require('../middleware/authMiddleware');
const {
  assignLeadershipRole,
  getLeadershipTeam,
  createInitiative,
  getInitiatives,
  joinInitiative,
  voteInitiative
} = require('../controllers/leadership');

const router = express.Router();

router.post('/role', protect, adminOnly, assignLeadershipRole);
router.get('/team', getLeadershipTeam);
router.post('/initiative/create', protect, createInitiative);
router.get('/initiatives', getInitiatives);
router.post('/initiative/:initiativeId/join', protect, joinInitiative);
router.post('/initiative/:initiativeId/vote', protect, voteInitiative);

module.exports = router;
