const express = require('express');
const protect = require('../middleware/protect');
const {
  sendMessage,
  getConversation,
  getConversations,
  getUnreadCount
} = require('../controllers/messages');

const router = express.Router();

router.post('/send', protect, sendMessage);
router.get('/conversation/:userId', protect, getConversation);
router.get('/', protect, getConversations);
router.get('/unread/count', protect, getUnreadCount);

module.exports = router;
