const User = require("../models/users");

const adminOnly = async (req, res, next) => {
  
  console.log("looking for user with ID:", req.userId);
  const user = await User.findOne({ _id: req.user.id });
  console.log("User found:", user);

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  //const user = await User.findOne({ _id: req.userId });
  if (user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }

  next();
};

module.exports = adminOnly;