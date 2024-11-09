const { validationResult } = require("express-validator");
const Category = require("../models/category.model");

// Utility function to handle errors
const handleErrors = (res, error, statusCode = 500) => {
  console.error(error);
  res
    .status(statusCode)
    .json({ message: "Server Error", error: error.message });
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    handleErrors(res, error);
  }
};

// Get a single category by ID
exports.getCategoryById = async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({ message: "Invalid category ID format" });
  }

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    handleErrors(res, error);
  }
};

// Get sub-categories by parent category ID
exports.getSubCategoriesByParentId = async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return res
      .status(400)
      .json({ message: "Invalid parent category ID format" });
  }

  try {
    const subCategories = await Category.find({ parent: id });
    res.status(200).json(subCategories);
  } catch (error) {
    console.error(error);
    handleErrors(res, error);
  }
};

// Get a category by slug
exports.getCategoryBySlug = async (req, res) => {
  const { slug } = req.params;

  // Validate slug
  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ message: "Invalid slug" });
  }

  try {
    const category = await Category.findOne({ "meta.slug": slug });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    handleErrors(res, error);
  }
};
