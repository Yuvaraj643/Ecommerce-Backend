const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', path: 'userId' },
  products: [
    {
      prd_id: { type: String, ref: 'Product' , path : 'prd_id'},
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true },
    },
  ],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

CartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;