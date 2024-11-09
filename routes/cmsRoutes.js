const express = require("express");
const { param, body } = require("express-validator");
const cmsController = require("../controllers/cmsController");
const { isAdmin } = require("../middleware/roleMiddleware");

const router = express.Router();

// Middleware to validate IDs
const validateId = [param("id").isMongoId().withMessage("Invalid ID format")];

// Product Routes
router.get("/products",isAdmin, cmsController.getAllProducts);

router.post(
  "/products/add", isAdmin,
  body("name").isString().notEmpty().withMessage("Name is required"),
  cmsController.createProduct
);
router.put(
  "/products/update/:prd_id", isAdmin,
  validateId,
  body("name").optional().isString(),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID format"),
  body("price")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number"),
  cmsController.updateProduct
);
router.delete("/products/delete/:prd_id", isAdmin, validateId, cmsController.deleteProduct);

// Route to enable/disable a product
router.patch("/products/:prd_id/status", isAdmin, cmsController.toggleProductStatus);

// Category Routes
router.get("/categories", isAdmin, cmsController.getAllCategories);
router.post(
  "/categories/add", isAdmin,
  body("name").isString().notEmpty().withMessage("Name is required"),
  body("slug").isString().notEmpty().withMessage("Slug is required"),
  cmsController.createCategory
);
router.put(
  "/categories/update/:id", isAdmin,
  validateId,
  body("name").optional().isString(),
  body("description").optional().isString(),
  body("parent").optional().isMongoId().withMessage("Invalid parent ID format"),
  body("image").optional().isString(),
  body("meta.title").optional().isString(),
  body("meta.description").optional().isString(),
  body("meta.slug").optional().isString(),
  cmsController.updateCategory
);
router.delete(
  "/categories/delete/:id", isAdmin,
  validateId,
  cmsController.deleteCategory
);
router.get(
  "/categories/parent/:id", isAdmin,
  validateId,
  cmsController.getSubCategoriesByParentId
);

module.exports = router;
