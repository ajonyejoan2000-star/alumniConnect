const Opportunity = require('../models/opportunity');
const Notification = require('../models/notification');

// CREATE OPPORTUNITY
const createOpportunity = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      company,
      location,
      remote,
      salary,
      deadline,
      skills,
      link,
      category
    } = req.body;

    const opportunity = new Opportunity({
      title,
      description,
      type,
      company,
      location,
      remote,
      salary,
      deadline,
      skills: skills || [],
      postedBy: req.user.id,
      link,
      category
    });

    await opportunity.save();
    await opportunity.populate('postedBy', 'name profilePicture');

    res.status(201).json({ message: 'Opportunity created', data: opportunity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL OPPORTUNITIES
const getOpportunities = async (req, res) => {
  try {
    const { type, location, skill, remote, page = 1, limit = 20, search } = req.query;

    let filter = { isActive: true };

    if (type) filter.type = type;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (skill) filter.skills = { $in: [skill] };
    if (remote === 'true') filter.remote = true;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const opportunities = await Opportunity.find(filter)
      .populate('postedBy', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Opportunity.countDocuments(filter);

    res.status(200).json({
      message: 'Opportunities fetched',
      opportunities,
      pagination: { total, pages: Math.ceil(total / limit), currentPage: page }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE OPPORTUNITY
const getOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    const opportunity = await Opportunity.findById(id)
      .populate('postedBy', 'name profilePicture email')
      .populate('applicants.user', 'name profilePicture email');

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    res.status(200).json({ message: 'Opportunity fetched', data: opportunity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// APPLY TO OPPORTUNITY
const applyOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    // Check if already applied
    const alreadyApplied = opportunity.applicants.find(a => a.user.toString() === userId);

    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied' });
    }

    opportunity.applicants.push({ user: userId });
    await opportunity.save();

    // Create notification for poster
    const notification = new Notification({
      user: opportunity.postedBy,
      type: 'opportunity_match',
      title: 'New application',
      message: `Someone applied to "${opportunity.title}"`,
      relatedId: id,
      link: `/opportunities/${id}`
    });
    await notification.save();

    res.status(200).json({ message: 'Application submitted', data: opportunity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SAVE OPPORTUNITY
const saveOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    if (opportunity.saved.includes(userId)) {
      opportunity.saved = opportunity.saved.filter(uid => uid.toString() !== userId);
    } else {
      opportunity.saved.push(userId);
    }

    await opportunity.save();
    res.status(200).json({ message: 'Saved status updated', data: opportunity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SAVED OPPORTUNITIES
const getSavedOpportunities = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const opportunities = await Opportunity.find({ saved: userId })
      .populate('postedBy', 'name profilePicture')
      .limit(limit)
      .skip(skip);

    const total = await Opportunity.countDocuments({ saved: userId });

    res.status(200).json({
      message: 'Saved opportunities fetched',
      opportunities,
      pagination: { total, pages: Math.ceil(total / limit), currentPage: page }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE OPPORTUNITY STATUS (for recruiters)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id, applicantId } = req.params;
    const { status } = req.body;

    const opportunity = await Opportunity.findById(id);

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }

    if (opportunity.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applicant = opportunity.applicants.find(a => a.user.toString() === applicantId);

    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    applicant.status = status;
    await opportunity.save();

    res.status(200).json({ message: 'Status updated', data: opportunity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOpportunity,
  getOpportunities,
  getOpportunity,
  applyOpportunity,
  saveOpportunity,
  getSavedOpportunities,
  updateApplicationStatus
};
