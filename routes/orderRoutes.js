const express = require('express');
const { body, param, query } = require('express-validator');
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

// Create new order
router.post('/', 
  authenticate,
  body('cartId').isMongoId().withMessage('Invalid cart ID'),
  body('paymentMethod').isString().withMessage('Payment method is required'),
  body('paymentStatus').isString().withMessage('Payment status is required'),
  orderController.createOrder
);

// Get order by ID
router.get('/:orderId', 
  authenticate,
  param('orderId').isMongoId().withMessage('Invalid order ID'),
  orderController.getOrderById
);

// Get orders by user ID
router.get('/user/:userId', 
  authenticate,
  param('userId').isMongoId().withMessage('Invalid user ID'),
  orderController.getOrdersByUserId
);

// Update order status
router.put('/:orderId/status', 
  authenticate,
  param('orderId').isMongoId().withMessage('Invalid order ID'),
  body('status').isString().withMessage('Status is required'),
  orderController.updateOrderStatus
);

module.exports = router;