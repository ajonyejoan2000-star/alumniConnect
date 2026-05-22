const User = require('../models/users');

//FETCHING USER PROFILE
const getProfile = async (req, res) => {
    const id = req.user.id;
    try {
        const user = await User.findById(id)
            .select("-password")
            .populate('achievements')
            .populate('connections', 'name profilePicture role')
            .populate('followers', 'name profilePicture');

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        res.status(200).json({ message: "Profile Fetched successfully", user })
    } catch (error) {
        res.status(500).json({ message: "Error while fetching User Profile", error: error.message })
    }
}

//UPDATING USER PROFILE
const updateProfile = async (req, res) => {
    const id = req.user.id;
    try {
        const {
            bio,
            course,
            cohort,
            graduationYear,
            skills,
            location,
            linkedinUrl,
            websiteUrl,
            interests,
            mentorshipPreference,
            careerHistory
        } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.bio = bio || user.bio;
        user.course = course || user.course;
        user.cohort = cohort || user.cohort;
        user.graduationYear = graduationYear || user.graduationYear;
        user.skills = skills || user.skills;
        user.location = location || user.location;
        user.linkedinUrl = linkedinUrl || user.linkedinUrl;
        user.websiteUrl = websiteUrl || user.websiteUrl;
        user.interests = interests || user.interests;
        user.mentorshipPreference = mentorshipPreference || user.mentorshipPreference;
        
        if (careerHistory) {
            user.careerHistory = careerHistory;
        }

        await user.save();
        res.status(200).json({ message: "Profile updated successfully", user })

    } catch (error) {
        res.status(500).json({
            message: "Error while updating User Profile", error: error.message
        })
    }
}

// REQUEST PROFILE VERIFICATION
const requestVerification = async (req, res) => {
    try {
        const id = req.user.id;
        const { cohort } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.cohort = cohort;
        user.verificationStatus = 'pending';

        await user.save();

        res.status(200).json({
            message: "Verification requested",
            verificationStatus: user.verificationStatus
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProfile, updateProfile, requestVerification };