const express = require("express");
const { body, param, query } = require("express-validator");
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");

const router = express.Router();

// User registration and login routes
router.post(
  "/register",
  body("firstName").isString().notEmpty().withMessage("firstName is required"),
  body("email").isEmail().withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  userController.register
);

router.post(
  "/login",
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").isLength({ min: 6 }).withMessage("Password is required"),
  userController.login
);

// Password reset routes
router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("Invalid email address"),
  userController.forgotPassword
);

router.post(
  "/reset-password", authenticate,
  query("resetToken")
    .isString()
    .notEmpty()
    .withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  userController.resetPassword
);

//Admin-Routes

router.post(
  "/admin-login",
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").isLength({ min: 6 }).withMessage("Password is required"),
  userController.adminLogin
);

router.post(
  "/superadmin-login",
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").isLength({ min: 6 }).withMessage("Password is required"),
  userController.superadminLogin
);



module.exports = router;
