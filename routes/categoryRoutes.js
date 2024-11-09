const express = require("express");
const { param, query } = require("express-validator");
const categoryController = require("../controllers/categoryController");

const router = express.Router();

// Middleware to validate category ID
const validateCategoryId = [
  param("id").isMongoId().withMessage("Invalid category ID format"),
];

// Middleware to validate category slug
const validateCategorySlug = [
  param("slug").isString().notEmpty().withMessage("Slug is required"),
];

// Route to get all categories
router.get("/", categoryController.getAllCategories);

// Route to get a category by ID
router.get("/:id", validateCategoryId, categoryController.getCategoryById);

// Route to get sub-categories by parent category ID
router.get(
  "/parent/:id",
  validateCategoryId,
  categoryController.getSubCategoriesByParentId
);

// Route to get a category by slug
router.get(
  "/slug/:slug",
  validateCategorySlug,
  categoryController.getCategoryBySlug
);

// Export the router
module.exports = router;
