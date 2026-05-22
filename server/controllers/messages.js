const Message = require('../models/message');
const User = require('../models/users');

// SEND MESSAGE
const sendMessage = async (req, res) => {
  try {
    const { recipientId, content, attachments } = req.body;
    const senderId = req.user.id;

    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Recipient and content required' });
    }

    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);

    if (!sender || !recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    const conversationId = [senderId, recipientId].sort().join('-');

    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      content,
      attachments: attachments || [],
      conversationId
    });

    await message.save();
    await message.populate('sender', 'name profilePicture');

    res.status(201).json({ message: 'Message sent', data: message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET CONVERSATION
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const page = req.query.page || 1;
    const limit = 50;

    const conversationId = [currentUserId, userId].sort().join('-');
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId }
      ]
    })
      .populate('sender', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    // Mark messages as read
    await Message.updateMany(
      { sender: userId, recipient: currentUserId, read: false },
      { read: true, readAt: new Date() }
    );

    res.status(200).json({
      message: 'Conversation fetched',
      messages: messages.reverse()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL CONVERSATIONS
const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: currentUserId },
            { recipient: currentUserId }
          ]
        }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $last: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$recipient', currentUserId] },
                  { $eq: ['$read', false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);

    res.status(200).json({
      message: 'Conversations fetched',
      conversations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET UNREAD COUNT
const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const unreadCount = await Message.countDocuments({
      recipient: currentUserId,
      read: false
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getConversations,
  getUnreadCount
};
