const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");

exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findById(req.body.cartId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const products = await Promise.all(
      cart.products.map(async (product) => {
        const prod = await Product.findById(product.prd_id);
        return {
          prd_id: prod._id,
          quantity: product.quantity,
          price: prod.price,
        };
      })
    );
    const order = new Order({
      userId: cart.userId,
      products,
      subtotal: cart.subtotal,
      tax: cart.tax,
      total: cart.total,
      paymentMethod: req.body.paymentMethod,
      paymentStatus: req.body.paymentStatus,
    });
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating order" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error getting order" });
  }
};

exports.getOrdersByUserId = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error getting orders" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { orderStatus: req.body.status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating order status" });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndRemove(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order removed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting order" });
  }
};
