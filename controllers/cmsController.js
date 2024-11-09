const { validationResult } = require("express-validator");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const Category = require("../models/category.model");
const calculateMetadata = require("../utils/calculateMetadata")

// Utility function to handle errors
const handleErrors = (res, error, statusCode = 500) => {
  console.error(error);
  res
    .status(statusCode)
    .json({ message: "Server Error", error: error.message });
};

// Product Controller
exports.getAllProducts = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
      const totalItems = await Product.countDocuments();
      const totalPages = Math.ceil(totalItems / limit);

      // Fetch all products with pagination
      const products = await Product.find() 
          .limit(parseInt(limit)); 

      const metadata = {
          totalItems,
          totalPages,
          currentPage: parseInt(page),
          pageSize: parseInt(limit),
      };

      res.status(200).json({
          success: true,
          metadata,
          list: products,
      });
  } catch (error) {
      console.error('Error fetching products:', error); // Log any errors
      res.status(500).json({ success: false, error,message: error.message });
  }
};
exports.createProduct = async (req, res) => {
  try {
    const productData = req.body; 
    const product = new Product(productData);
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { prd_id } = req.params; // Get prd_id from request parameters
    const updatedData = req.body; // Get updated data from request body

    // Calculate special price if discount is provided
    if (updatedData.price != null || updatedData.discount != null) {
      if (updatedData.discount) {
        const discountAmount = (updatedData.discount / 100) * updatedData.price;
        updatedData.specialPrice = updatedData.price - discountAmount;
        console.log(`Discount: ${updatedData.discount}%, Discount Amount: ${discountAmount}, Calculated specialPrice: ${updatedData.specialPrice}`);
      } else {
        updatedData.specialPrice = null; // No discount, special price set to null
        console.log('No discount provided, specialPrice set to null');
      }
    }

    // Update the product
    const product = await Product.findOneAndUpdate(
      { prd_id },
      updatedData,
      {
        new: true, // Return the updated document
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    // Return the updated product including specialPrice
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.deleteProduct = async (req, res) => {
  const { prd_id } = req.params; // Get prd_id from request parameters

  try {
    const product = await Product.findOneAndDelete({ prd_id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ success : true,message: "Product deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleProductStatus = async (req, res) => {
  console.log(req,"Req")
  const { prd_id } = req.params; // Get prd_id from request parameters
  const { enabled } = req.body; // Set `enabled` to true or false

  if (typeof enabled !== "boolean") {
    return res.status(400).json({ success: false, error: "Enabled status must be a boolean." });
  }

  try {
    const product = await Product.findOneAndUpdate(
      { prd_id },
      { enabled },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: `Product ${enabled ? "enabled" : "disabled"} successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// User Controller
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    handleErrors(res, error);
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    handleErrors(res, error);
  }
};

exports.updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const updates = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    handleErrors(res, error);
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.error(error);
    handleErrors(res, error);
  }
};

exports.activateUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    handleErrors(res, error);
  }
};

exports.deactivateUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    handleErrors(res, error);
  }
};

// Category Controller
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    handleErrors(res, error);
  }
};

exports.createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, parent, image, meta } = req.body;

  try {
    const newCategory = new Category({
      name,
      description,
      parent,
      image,
      meta,
    });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    console.error(error);
    handleErrors(res, error);
  }
};

exports.updateCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const updates = req.body;

  try {
    const category = await Category.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    handleErrors(res, error);
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the category by ID
    const category = await Category.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ status: 1001, message: "Category not found" });
    }

    // Optionally, check if the category has sub-categories and handle accordingly
    // Example: Delete all sub-categories if they exist
    await Category.deleteMany({ parent: id });

    // Delete the category
    await category.remove();
    res
      .status(200)
      .json({ status: 1000, message: "Category deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 1001, message: "Server error" });
  }
};

// Get sub-categories by parent ID
exports.getSubCategoriesByParentId = async (req, res) => {
  const { id } = req.params;

  try {
    // Find sub-categories with the given parent ID
    const subCategories = await Category.find({ parent: id });
    if (!subCategories.length) {
      return res
        .status(404)
        .json({ status: 1001, message: "No sub-categories found" });
    }

    res.status(200).json({
      status: 1000,
      message: "Sub-categories retrieved successfully",
      data: subCategories,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 1001, message: "Server error" });
  }
};
