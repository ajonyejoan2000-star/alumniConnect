const express = require('express');
const protect = require('../middleware/protect');
const adminOnly = require('../middleware/authMiddleware');
const {
  createDiscussion,
  getDiscussions,
  getDiscussion,
  likeDiscussion,
  pinDiscussion,
  closeDiscussion
} = require('../controllers/discussions');

const router = express.Router();

router.post('/create', protect, createDiscussion);
router.get('/', getDiscussions);
router.get('/:id', getDiscussion);
router.post('/:id/like', protect, likeDiscussion);
router.post('/:id/pin', protect, adminOnly, pinDiscussion);
router.post('/:id/close', protect, closeDiscussion);

module.exports = router;
