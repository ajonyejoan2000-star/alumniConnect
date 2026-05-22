const Notification = require('../models/notification');

// GET NOTIFICATIONS
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const notifications = await Notification.find({ user: userId })
      .populate('relatedUser', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const unreadCount = await Notification.countDocuments({
      user: userId,
      read: false
    });

    const total = await Notification.countDocuments({ user: userId });

    res.status(200).json({
      message: 'Notifications fetched',
      notifications,
      unreadCount,
      pagination: { total, pages: Math.ceil(total / limit), currentPage: page }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// MARK AS READ
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Marked as read', data: notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// MARK ALL AS READ
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { user: userId, read: false },
      { read: true, readAt: new Date() }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE NOTIFICATION
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE NOTIFICATION (internal use)
const createNotification = async (userId, type, title, message, relatedUser = null, relatedId = null, link = null) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      relatedUser,
      relatedId,
      link
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
};
