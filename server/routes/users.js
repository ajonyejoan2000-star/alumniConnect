const express = require('express')
const protect = require('../middleware/protect');
const {getProfile, updateProfile, requestVerification} = require('../controllers/profile');
const {registerMember, loginMember} = require("../controllers/users")
const router = express.Router();

router.post('/register', registerMember);
router.post('/login', loginMember);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/verify-request', protect, requestVerification);

module.exports = router;