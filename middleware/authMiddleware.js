const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// Middleware to verify token and set req.user
exports.authenticate = async (req, res, next) => {
  const token = req.headers["authorization"]

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id); // Attach user info to request
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }
    next();
  } catch (err) {
    console.error("Error: ", err)
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
