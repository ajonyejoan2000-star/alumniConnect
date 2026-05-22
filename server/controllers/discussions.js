const Discussion = require('../models/discussion');
const Comment = require('../models/comment');
const User = require('../models/users');
const Notification = require('../models/notification');

// CREATE DISCUSSION
const createDiscussion = async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    const userId = req.user.id;

    const discussion = new Discussion({
      title,
      description,
      category: category || 'General',
      createdBy: userId,
      tags: tags || []
    });

    await discussion.save();
    await discussion.populate('createdBy', 'name profilePicture');

    res.status(201).json({ message: 'Discussion created', data: discussion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL DISCUSSIONS
const getDiscussions = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    let filter = { isClosed: false };

    if (category) {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const discussions = await Discussion.find(filter)
      .populate('createdBy', 'name profilePicture role')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Discussion.countDocuments(filter);

    res.status(200).json({
      message: 'Discussions fetched',
      discussions,
      pagination: { total, pages: Math.ceil(total / limit), currentPage: page }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE DISCUSSION
const getDiscussion = async (req, res) => {
  try {
    const { id } = req.params;

    const discussion = await Discussion.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('createdBy', 'name profilePicture role')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name profilePicture role' }
      })
      .populate('likes', 'name');

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    res.status(200).json({ message: 'Discussion fetched', data: discussion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LIKE DISCUSSION
const likeDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const discussion = await Discussion.findById(id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    if (discussion.likes.includes(userId)) {
      discussion.likes = discussion.likes.filter(id => id.toString() !== userId);
    } else {
      discussion.likes.push(userId);
    }

    await discussion.save();
    res.status(200).json({ message: 'Like toggled', data: discussion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PIN/UNPIN DISCUSSION (Admin only)
const pinDiscussion = async (req, res) => {
  try {
    const { id } = req.params;

    const discussion = await Discussion.findById(id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    discussion.isPinned = !discussion.isPinned;
    await discussion.save();

    res.status(200).json({ message: 'Pin status updated', data: discussion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CLOSE DISCUSSION
const closeDiscussion = async (req, res) => {
  try {
    const { id } = req.params;

    const discussion = await Discussion.findById(id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    if (discussion.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    discussion.isClosed = true;
    await discussion.save();

    res.status(200).json({ message: 'Discussion closed', data: discussion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDiscussion,
  getDiscussions,
  getDiscussion,
  likeDiscussion,
  pinDiscussion,
  closeDiscussion
};
