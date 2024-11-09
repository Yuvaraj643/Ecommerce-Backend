const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail"); // Utility to send email
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
// Create a new user (Admin only)
exports.createUser = async (req, res) => {
  const {
    firstName,
    lastName,
    userName,
    email,
    password,
  } = req.body;

  // Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({success : false, message: "Error Creating User" });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success : false, message: "User already exists" });
    }

    user = new User({
      firstName,
      lastName,
      userName,
      email,
      password,
      role : "admin",
    });

    await user.save();
    res.status(200).json({
      success : true,
      message: "User created successfully",
      userId: user.userId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success : false, message: "Server error" });
  }
};

// Register new user
exports.register = async (req, res) => {
  const userCount = await mongoose.model('User').countDocuments();
  const userId = `SKLS${String(userCount + 1).padStart(2, '0')}`;
  const {
    firstName,
    lastName,
    email,
    password,
  } = req.body;

  // Validation 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({success : false, message: "Error Registering User" });
  }


  try {
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success : false, message: "User already exists" });
    }else{
      user = new User({
        userId,
        firstName,
        lastName,
        email,
        password,
        role: "user",
      });
    }

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, { httpOnly: true });
    res.status(200).json({
      success : true,
      message: "User registered successfully",
      userId: user.userId,
      token,
    });
  } catch (err) {
    console.log(err)
    res.status(500).json({ success : false, message: "Server error" });
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success : false, message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success : false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, { httpOnly: true });
    res.status(200).json({
      success : true,
      message: "User logged in successfully",
      userId: user.userId,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success : false, message: "Server error" });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success : false, message: "User not found" });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/reset-password/?resetToken=${resetToken}`;

    const message = `You are receiving this email because you have requested the reset of a password. Click on the below link to reset your password: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password reset token",
        message,
      });

      res.status(200).json({ success : true, message: "Email sent" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      res
        .status(500)
        .json({ success : false, message: "Email could not be sent" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success : false, message: "Server error" });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.query.resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success : false, message: "Invalid or expired token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, { httpOnly: true });
    res
      .status(200)
      .json({ success : true, message: "Password reset successfully", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success : false, message: "Server error" });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success : false, message: "User not found" });
    }

    // Optionally, you might want to check if the user is an admin and prevent deletion
    // if (user.role === 'admin') {
    //     return res.status(403).json({ status: 1002, message: 'Cannot delete admin user' });
    // }

    await user.remove();
    res
      .status(200)
      .json({ success : true, message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success : false, message: "Server error" });
  }
};

// Activate a user
exports.activateUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success : false, message: "User not found" });
    }

    user.status = "active";
    await user.save();
    res
      .status(200)
      .json({ success : true, message: "User activated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success : false, message: "Server error" });
  }
};

// Deactivate a user
exports.deactivateUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success : false, message: "User not found" });
    }

    user.status = "inactive";
    await user.save();
    res
      .status(200)
      .json({ success : true, message: "User deactivated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success : false, message: "Server error" });
  }
};


//Admin-Routes
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success : false,error: 'User not found' });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ success : false,error: 'Invalid credentials' });
    }
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      console.log('Access denied: Admin or Superadmin role required');
      return res.status(403).json({ error: 'Access denied: Admin role required' });
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role }, // Payload
      process.env.JWT_SECRET, // Secret key from env variables
      { expiresIn: '1h' } // Token expiration time
    );
    res.status(200).json({
      message: 'Login successfull',
      success : true,
      token: token, 
      user: {
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error in adminLogin:', error);
    res.status(500).json({ success : false,error: 'Internal Server Error' });
  }
};

exports.superadminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success : false,error: 'User not found' });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ success : false,error: 'Invalid credentials' });
    }
    if (user.role !== 'superadmin') {
      return res.status(403).json({ success : false,error: 'Access denied: Admin role required' });
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role }, // Payload
      process.env.JWT_SECRET, // Secret key from env variables
      { expiresIn: '1h' } // Token expiration time
    );
    res.status(200).json({
      message: 'Login successfull',
      success : true,
      token: token, 
      user: {
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error in adminLogin:', error);
    res.status(500).json({ success : false,error: 'Internal Server Error' });
  }
};


