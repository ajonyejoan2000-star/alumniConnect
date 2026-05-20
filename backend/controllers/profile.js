const User = require('../models/users');

//FETCHING USER PROFILE
const getProfile =async (req, res) => {
    const id = req.params.id
    try {
        const user = await User.findOne(id).select("-password");

        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        res.status(200).json({message:"Profile Fetched successfully", user})
    } catch (error) {
        res.status(500).json({message:"Error while fetching User Profile", error:error.message})
    }
}

//UPDATING USER PROFILE
const updateProfile = async (req, res) => {
    const id = req.params.id;
    try {
        const {bio,course,graduationYear} = req.body;
         const user = await User.findOne(id);
         if(!user){
            return res.status(404).json({message:"User not found"});
         }

            user.bio = bio || user.bio;
            user.course = course || user.course;
            user.graduationYear = graduationYear || user.graduationYear;
            await user.save();
            res.status(200).json({message:"Profile updated successfully", user})
         

    } catch (error) {
        res.status(500).json({
            message:"Error while updating User Profile", error:error.message
        })
    }
}
module.exports = {getProfile, updateProfile};