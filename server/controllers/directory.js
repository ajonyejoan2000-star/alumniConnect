const User = require('../models/users');

// GET ALUMNI DIRECTORY WITH SEARCH
const getDirectory = async (req, res) => {
  try {
    const { name, skill, location, cohort, role, page = 1, limit = 20 } = req.query;
    
    let filter = { isVerified: true };
    
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    if (skill) {
      filter.skills = { $in: [skill] };
    }
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (cohort) {
      filter.cohort = cohort;
    }
    if (role) {
      filter.role = role;
    }

    const skip = (page - 1) * limit;
    const alumni = await User.find(filter)
      .select('-password')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      message: 'Alumni directory fetched',
      alumni,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE ALUMNI PROFILE
const getAlumniProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .select('-password')
      .populate('achievements')
      .populate('connections', 'name profilePicture role')
      .populate('followers', 'name profilePicture');

    if (!user) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    res.status(200).json({ message: 'Profile fetched', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CONNECT / FOLLOW USER
const connectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId === userId) {
      return res.status(400).json({ message: 'Cannot connect with yourself' });
    }

    const user = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!user || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already connected
    if (currentUser.connections.includes(userId)) {
      return res.status(400).json({ message: 'Already connected' });
    }

    currentUser.connections.push(userId);
    user.connections.push(currentUserId);

    await currentUser.save();
    await user.save();

    res.status(200).json({ message: 'Connection request accepted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FOLLOW USER
const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const user = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!user || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ message: 'Already following' });
    }

    currentUser.following.push(userId);
    user.followers.push(currentUserId);

    await currentUser.save();
    await user.save();

    res.status(200).json({ message: 'Now following' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UNFOLLOW USER
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const user = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!user || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!currentUser.following.includes(userId)) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
    user.followers = user.followers.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await user.save();

    res.status(200).json({ message: 'Unfollowed user' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDirectory,
  getAlumniProfile,
  connectionRequest,
  followUser,
  unfollowUser
};
