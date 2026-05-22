const Leadership = require('../models/leadership');
const Initiative = require('../models/initiative');
const User = require('../models/users');

// ASSIGN LEADERSHIP ROLE
const assignLeadershipRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, title, department, responsibilities } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const leadership = new Leadership({
      user: userId,
      role,
      title,
      department,
      responsibilities
    });

    await leadership.save();

    // Update user role to admin if leadership
    if (role === 'board_member' || role === 'coordinator') {
      user.role = 'admin';
      await user.save();
    }

    res.status(201).json({ message: 'Leadership role assigned', data: leadership });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET LEADERSHIP TEAM
const getLeadershipTeam = async (req, res) => {
  try {
    const team = await Leadership.find({ isActive: true })
      .populate('user', 'name profilePicture email email role')
      .sort({ role: 1 });

    res.status(200).json({
      message: 'Leadership team fetched',
      team
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE INITIATIVE
const createInitiative = async (req, res) => {
  try {
    const { title, description, goal, category, startDate, endDate } = req.body;
    const userId = req.user.id;

    const initiative = new Initiative({
      title,
      description,
      createdBy: userId,
      goal,
      category,
      startDate,
      endDate,
      leaders: [userId],
      status: 'idea'
    });

    await initiative.save();
    await initiative.populate('createdBy', 'name profilePicture');

    res.status(201).json({ message: 'Initiative created', data: initiative });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL INITIATIVES
const getInitiatives = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (page - 1) * limit;
    const initiatives = await Initiative.find(filter)
      .populate('createdBy', 'name profilePicture')
      .populate('leaders', 'name profilePicture')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Initiative.countDocuments(filter);

    res.status(200).json({
      message: 'Initiatives fetched',
      initiatives,
      pagination: { total, pages: Math.ceil(total / limit), currentPage: page }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// JOIN INITIATIVE
const joinInitiative = async (req, res) => {
  try {
    const { initiativeId } = req.params;
    const userId = req.user.id;

    const initiative = await Initiative.findById(initiativeId);

    if (!initiative) {
      return res.status(404).json({ message: 'Initiative not found' });
    }

    if (initiative.members.includes(userId)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    initiative.members.push(userId);
    await initiative.save();

    res.status(200).json({ message: 'Joined initiative', data: initiative });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VOTE ON INITIATIVE
const voteInitiative = async (req, res) => {
  try {
    const { initiativeId } = req.params;
    const { voteType } = req.body;
    const userId = req.user.id;

    const initiative = await Initiative.findById(initiativeId);

    if (!initiative) {
      return res.status(404).json({ message: 'Initiative not found' });
    }

    // Remove existing vote
    initiative.votes = initiative.votes.filter(v => v.user.toString() !== userId);

    // Add new vote
    if (voteType) {
      initiative.votes.push({ user: userId, type: voteType });
    }

    await initiative.save();

    res.status(200).json({ message: 'Vote recorded', data: initiative });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  assignLeadershipRole,
  getLeadershipTeam,
  createInitiative,
  getInitiatives,
  joinInitiative,
  voteInitiative
};
