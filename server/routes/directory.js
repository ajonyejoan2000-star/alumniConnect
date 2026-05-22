const express = require('express');
const protect = require('../middleware/protect');
const {
  getDirectory,
  getAlumniProfile,
  connectionRequest,
  followUser,
  unfollowUser
} = require('../controllers/directory');

const router = express.Router();

router.get('/search', getDirectory);
router.get('/:id', getAlumniProfile);
router.post('/:userId/connect', protect, connectionRequest);
router.post('/:userId/follow', protect, followUser);
router.delete('/:userId/unfollow', protect, unfollowUser);

module.exports = router;
