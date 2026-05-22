const express = require('express');
const protect = require('../middleware/protect');
const {
  addComment,
  getComments,
  likeComment,
  editComment,
  deleteComment
} = require('../controllers/comments');

const router = express.Router();

router.post('/:discussionId', protect, addComment);
router.get('/:discussionId', getComments);
router.post('/:commentId/like', protect, likeComment);
router.put('/:commentId', protect, editComment);
router.delete('/:commentId', protect, deleteComment);

module.exports = router;
