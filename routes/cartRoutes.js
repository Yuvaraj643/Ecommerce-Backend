const express = require('express');
const { body, param, query } = require('express-validator');
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/authMiddleware');
const User = require('../models/user.model');
const Product = require('../models/product.model');
// const { isAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/:userId', 
  authenticate,
  cartController.getCartByUserId
);

// Route to add product to cart
router.post('/:userId/products', 
  authenticate,
  body('prd_id').custom(async (value) => {
    const product = await Product.findOne({ prd_id: value });
    if (!product) {
      throw new Error('Product not found');
    }
  }),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('price').isInt({ min: 1 }).withMessage('Price must be a positive number'),
  cartController.addProductToCart
);

// Route to update cart
router.put('/:userId', 
  authenticate,
  cartController.updateCart
);

// Route to delete product from cart
router.delete('/:userId/products/:prd_id', 
  authenticate,
  cartController.deleteProductFromCart
);


module.exports = router;