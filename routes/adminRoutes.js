const express = require("express");
const { body, param } = require("express-validator");
const cmsController = require("../controllers/cmsController");
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");
const { isSuperAdmin } = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin Routes
router.get("/cms/users", authenticate, isSuperAdmin, cmsController.getAllUsers); // Admin only
router.get("/cms/users/:id", authenticate, isSuperAdmin, cmsController.getUserById); // Admin only
router.post(
  "/cms/users/add",
  authenticate,
  isSuperAdmin,
  body("name").isString().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role").optional().isIn(["user", "admin"]).withMessage("Invalid role"),
  userController.createUser
); // Admin only
router.put(
  "/cms/users/update/:id",
  authenticate,
  isSuperAdmin,
  param("id").isMongoId().withMessage("Invalid ID format"),
  body("name").optional().isString(),
  body("email").optional().isEmail(),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("address").optional().isObject(),
  body("phoneNumber").optional().isString(),
  body("dateOfBirth").optional().isISO8601().withMessage("Invalid date format"),
  body("role").optional().isIn(["user", "admin"]),
  body("profileImage").optional().isString(),
  cmsController.updateUser
); // Admin only
router.delete(
  "/cms/users/delete/:id",
  authenticate,
  isSuperAdmin,
  cmsController.deleteUser
); // Admin only
router.post(
  "/cms/users/activate/:id",
  authenticate,
  isSuperAdmin,
  cmsController.activateUser
); // Admin only
router.post(
  "/cms/users/deactivate/:id",
  authenticate,
  isSuperAdmin,
  cmsController.deactivateUser
); // Admin only

module.exports = router;
