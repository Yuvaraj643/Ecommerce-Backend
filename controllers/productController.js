const { validationResult } = require("express-validator");
const Product = require("../models/product.model");

// Utility function to handle errors
const handleErrors = (res, error, statusCode = 500) => {
  console.error(error);
  res
    .status(statusCode)
    .json({ message: "Server Error", error: error.message });
};

// Get all products
exports.getAllProducts = async (req, res) => {
  const { skip, pageSize } = req.metadata;
  const { enabled = true } = req.query; // Defaults to `true` if not provided

  try {
    // Convert enabled to a boolean if it's provided as a string in the query (e.g., "true" or "false")
    const enabledFilter = enabled === "false" ? false : true;

    // Fetch products based on the enabled filter
    const products = await Product.find({ enabled: enabledFilter }).skip(skip).limit(pageSize);
    
    res.status(200).json({
      success: true,
      metadata: req.metadata,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// Get a single product by ID
exports.getProductById = async (req, res) => {
  const { prd_id } = req.params; // Destructure prd_id from request parameters

  // Validate prd_id format
  if (!/^prd_\d{2}$/.test(prd_id)) {
    return res.status(400).json({ message: "Invalid product ID format" });
  }

  try {
    const product = await Product.findOne({ prd_id }); // Use findOne to search by prd_id
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message }); // Handle errors
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  const { category } = req.params;

  // Validate category
  if (!category || typeof category !== "string") {
    return res.status(400).json({ message: "Invalid category" });
  }

  try {
    const products = await Product.find({ category });
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    handleErrors(res, error);
  }
};

// Search products based on query parameters
exports.searchProducts = async (req, res) => {
  const { term, minPrice, maxPrice } = req.query;

  // Validate query parameters
  if ((minPrice && isNaN(minPrice)) || (maxPrice && isNaN(maxPrice))) {
    return res.status(400).json({ message: "Invalid price range" });
  }

  try {
    const query = {};
    if (term) {
      query.$text = { $search: term };
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query);
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    handleErrors(res, error);
  }
};

// Get products by tags
exports.getProductsByTag = async (req, res) => {
  const { tag } = req.params;

  // Validate tag
  if (!tag || typeof tag !== "string") {
    return res.status(400).json({ message: "Invalid tag" });
  }

  try {
    const products = await Product.find({ tags: tag });
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    handleErrors(res, error);
  }
};