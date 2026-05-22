const Mentorship = require('../models/mentorship');
const User = require('../models/users');
const Notification = require('../models/notification');

// REQUEST MENTORSHIP
const requestMentorship = async (req, res) => {
  try {
    const { mentorId, goals, expertise } = req.body;
    const menteeId = req.user.id;

    if (mentorId === menteeId) {
      return res.status(400).json({ message: 'Cannot mentor yourself' });
    }

    const mentor = await User.findById(mentorId);
    const mentee = await User.findById(menteeId);

    if (!mentor || !mentee) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already mentored
    const existing = await Mentorship.findOne({
      mentor: mentorId,
      mentee: menteeId,
      status: { $in: ['active', 'paused'] }
    });

    if (existing) {
      return res.status(400).json({ message: 'Mentorship already exists' });
    }

    const mentorship = new Mentorship({
      mentor: mentorId,
      mentee: menteeId,
      goals: goals || [],
      expertise: expertise || []
    });

    await mentorship.save();

    // Create notification
    const notification = new Notification({
      user: mentorId,
      type: 'mentorship_request',
      title: `${mentee.name} wants mentorship`,
      message: `${mentee.name} requested mentorship from you`,
      relatedUser: menteeId
    });
    await notification.save();

    res.status(201).json({ message: 'Mentorship request sent', data: mentorship });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MENTORSHIP MATCHES
const getMentorshipMatches = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUser = await User.findById(currentUserId);

    const mentorMatches = await User.find({
      role: { $in: ['mentor', 'alumni'] },
      skills: { $in: currentUser.interests || [] },
      _id: { $ne: currentUserId }
    })
      .select('-password')
      .limit(10);

    res.status(200).json({
      message: 'Mentorship matches found',
      matches: mentorMatches
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY MENTORSHIPS
const getMyMentorships = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const asMentor = await Mentorship.find({ mentor: currentUserId })
      .populate('mentee', 'name profilePicture email');
    const asMentee = await Mentorship.find({ mentee: currentUserId })
      .populate('mentor', 'name profilePicture email');

    res.status(200).json({
      message: 'Mentorships fetched',
      asMentor,
      asMentee
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOG SESSION
const logSession = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    const { topic, notes, duration } = req.body;

    const mentorship = await Mentorship.findById(mentorshipId);

    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }

    if (mentorship.mentor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only mentor can log sessions' });
    }

    mentorship.sessions.push({
      date: new Date(),
      topic,
      notes,
      duration,
      completed: true
    });

    await mentorship.save();

    res.status(200).json({ message: 'Session logged', data: mentorship });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// COMPLETE MENTORSHIP
const completeMentorship = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    const { rating, feedback } = req.body;

    const mentorship = await Mentorship.findById(mentorshipId);

    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }

    mentorship.status = 'completed';
    mentorship.rating = rating;
    mentorship.feedback = feedback;
    mentorship.endDate = new Date();

    await mentorship.save();

    res.status(200).json({ message: 'Mentorship completed', data: mentorship });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  requestMentorship,
  getMentorshipMatches,
  getMyMentorships,
  logSession,
  completeMentorship
};
