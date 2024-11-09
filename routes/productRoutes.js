const express = require("express");
const { body, param, query } = require("express-validator");
const productController = require("../controllers/productController");
const productMetadata = require("../middleware/productMetadata");

const router = express.Router();

// Middleware to validate product ID
const validateprd_id = [
  param("id").isMongoId().withMessage("Invalid product ID format"),
];

// Middleware to validate category
const validateCategory = [
  param("category").isString().notEmpty().withMessage("Category is required"),
];

// Middleware to validate search query parameters
const validateSearchQuery = [
  query("term")
    .optional()
    .isString()
    .withMessage("Search term must be a string"),
  query("minPrice")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Min price must be a positive number"),
  query("maxPrice")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Max price must be a positive number"),
];

// Middleware to validate tag
const validateTag = [
  param("tag").isString().notEmpty().withMessage("Tag is required"),
];

// Route to get all products
router.get("/",productMetadata, productController.getAllProducts);

// Route to get a product by ID
router.get("/:prd_id", productController.getProductById);

// Route to get products by category
router.get(
  "/category/:category",
  validateCategory,
  productController.getProductsByCategory
);

// Route to search products
router.get("/search", validateSearchQuery, productController.searchProducts);

// Route to get products by tags
router.get("/tags/:tag", validateTag, productController.getProductsByTag);

// Export the router
module.exports = router;
