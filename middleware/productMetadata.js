const calculateMetadata = require("../utils/calculateMetadata");
const Product = require("../models/product.model");

const productMetadata = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const metadata = await calculateMetadata(Product, { enabled: true }, parseInt(page), parseInt(limit));
    req.metadata = metadata; // Ensure metadata is attached to req
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = productMetadata;
