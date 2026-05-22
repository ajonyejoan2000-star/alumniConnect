const Comment = require('../models/comment');
const Discussion = require('../models/discussion');
const Notification = require('../models/notification');

// ADD COMMENT
const addComment = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content, parentCommentId } = req.body;
    const userId = req.user.id;

    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const comment = new Comment({
      content,
      author: userId,
      discussion: discussionId,
      parentComment: parentCommentId || null
    });

    await comment.save();
    await comment.populate('author', 'name profilePicture role');

    discussion.comments.push(comment._id);
    await discussion.save();

    // Create notification for discussion creator
    if (userId !== discussion.createdBy.toString()) {
      const notification = new Notification({
        user: discussion.createdBy,
        type: 'discussion_reply',
        title: 'New comment on your discussion',
        message: `Someone commented on "${discussion.title}"`,
        relatedId: discussionId,
        link: `/discussions/${discussionId}`
      });
      await notification.save();
    }

    res.status(201).json({ message: 'Comment added', data: comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET COMMENTS
const getComments = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const comments = await Comment.find({ discussion: discussionId, parentComment: null })
      .populate('author', 'name profilePicture role')
      .populate({
        path: 'replies',
        populate: { path: 'author', select: 'name profilePicture role' }
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Comment.countDocuments({ discussion: discussionId, parentComment: null });

    res.status(200).json({
      message: 'Comments fetched',
      comments,
      pagination: { total, pages: Math.ceil(total / limit), currentPage: page }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LIKE COMMENT
const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.likes.includes(userId)) {
      comment.likes = comment.likes.filter(id => id.toString() !== userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    res.status(200).json({ message: 'Like toggled', data: comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// EDIT COMMENT
const editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    res.status(200).json({ message: 'Comment updated', data: comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE COMMENT
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Discussion.findByIdAndUpdate(
      comment.discussion,
      { $pull: { comments: commentId } }
    );

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addComment,
  getComments,
  likeComment,
  editComment,
  deleteComment
};
