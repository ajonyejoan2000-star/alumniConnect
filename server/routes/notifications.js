const express = require('express');
const protect = require('../middleware/protect');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notifications');

const router = express.Router();

router.get('/', protect, getNotifications);
router.post('/:notificationId/read', protect, markAsRead);
router.post('/read-all', protect, markAllAsRead);
router.delete('/:notificationId', protect, deleteNotification);

module.exports = router;
