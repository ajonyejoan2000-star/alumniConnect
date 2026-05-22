const User = require('../models/users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')

//REGISTRATION
const registerMember = async (req, res) => {
    const {email, name, password, confirmPassword} = req.body;

    try {
        console.log(req.body)
        const existingMember = await User.findOne({email});
        if(existingMember){
            return res.status(409).json({message:"Email already registered. Please login instead."})
        }
        if(password !== confirmPassword){
            return res.status(400).json({message:"Passwords do not match"});
        }
        if(password.length < 8){
            return res.status(400).json({message:"Password must be at least 8 characters"});
        }

        const hashedPassword = await bcrypt.hash(password,12);
        const newMember = new User({
            email,
            name: name,
            password: hashedPassword
        })
        await newMember.save();

        const token = jwt.sign({id: newMember._id, email: newMember.email}, process.env.JWT_SECRET,{expiresIn:"1h"})
        res.status(201).json({message:"Member created successfully", result: newMember, token})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Error while creating account", error:error.message})
    }
}

//LOGIN
const loginMember = async (req,res) => {
    const {email, password} = req.body;

    try {
        console.log(req.body)
        const existingMember = await User.findOne({email});

        if(!existingMember){
            return res.status(404).json({message:"Account does not exist. Please register first."})
        }
        const isPasswordCorrect = await bcrypt.compare(password, existingMember.password);
        
        if(!isPasswordCorrect){
            return res.status(401).json({message:"Password is incorrect"})
        }

        const token = jwt.sign({id: existingMember._id, email: existingMember.email}, process.env.JWT_SECRET,{expiresIn:"1d"})
        res.status(200).json({message:"Login Successful",result:existingMember, token})
    } catch (error) {
        res.status(500).json({message:"Error while signing in the User", error:error.message})
    }
}


module.exports = {registerMember, loginMember}