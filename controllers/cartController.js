const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");

const TAX_RATE = 0.10; // Assuming a 10% tax rate

// Function to calculate subtotal, tax, and total
function calculateCartSummary(products) {
  let subtotal = 0;
  products.forEach(product => {
    subtotal += product.price * product.quantity;
  });

  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return { subtotal, tax, total };
}

exports.getCartByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ userId });  // Assuming 'userId' is unique in User collection
    if (!user) {
      return res.status(404).json({ success : false,message: 'User not found' });
    }
    const cart = await Cart.findOne({ userId: user.userId });  
    if (!cart) {
      return res.status(404).json({ success : false,cart : [],message: 'Cart not found' });
    }

    // Return the found cart
    res.status(200).json({success : true,cart});
  } catch (error) {
    next(error);
    res.status(500).json({ success : false,message: "Error getting cart" });
  }
};

exports.addProductToCart = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user by userId
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ userId: user.userId });
    if (!cart) {
      cart = new Cart({ userId: user.userId });
    }

    // If the incoming request contains a single product (object) or multiple products (array)
    const productsToAdd = Array.isArray(req.body.products) ? req.body.products : [req.body];

    // Process each product
    for (const productData of productsToAdd) {
      // Look for the product by its prd_id (custom ID)
      const product = await Product.findOne({ prd_id: productData.prd_id }); // Query by prd_id
      if (!product) {
        return res.status(404).json({ success: false, message: `Product with prd_id ${productData.prd_id} not found` });
      }

      // Check if the product already exists in the cart by prd_id
      const existingProduct = cart.products.find((p) => p.prd_id === productData.prd_id);
      if (existingProduct) {
        // If product exists, update the quantity
        existingProduct.quantity += productData.quantity;
      } else {
        // If product does not exist in the cart, add it
        cart.products.push({
          prd_id: productData.prd_id,
          quantity: productData.quantity,
          price: product.price, // Assuming the price is stored in the product document
        });
      }
    }

    // Recalculate subtotal, tax, and total
    const { subtotal, tax, total } = await calculateCartSummary(cart.products);
    cart.subtotal = subtotal;
    cart.tax = tax;
    cart.total = total;

    // Save the updated cart
    await cart.save();
    res.status(200).json({ success: true, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error adding products to cart" });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ success : false, message: 'User not found' });
    }

    const cart = await Cart.findOne({ userId: user.userId });
    if (!cart) {
      return res.status(404).json({ success : false, message: "Cart not found" });
    }

    // Update the products array with the new products from the request body
    cart.products = [req.body];

    // Calculate the new subtotal, tax, and total
    const { subtotal, tax, total } = await calculateCartSummary(cart.products);
    cart.subtotal = subtotal;
    cart.tax = tax;
    cart.total = total;

    // Save the updated cart
    await cart.save();
    res.status(200).json({ success : true, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success : false, message: "Error updating cart" });
  }
};


exports.deleteProductFromCart = async (req, res) => {
  try {
    const { userId, prd_id } = req.params;
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ success : false, message: 'User not found' });
    }

    const cart = await Cart.findOne({ userId: user.userId });
    if (!cart) {
      return res.status(404).json({ success : false, message: "Cart not found" });
    }

    // Find the index of the product to delete
    const productIndex = cart.products.findIndex((p) =>
      p.prd_id && p.prd_id.toString() === (prd_id)
    );
    if (productIndex === -1) {
      return res.status(404).json({ success : false, message: "Product not found in cart" });
    }

    // Remove the product from the cart
    cart.products.splice(productIndex, 1);

    // Calculate the new subtotal, tax, and total
    console.log(cart.products,"cartproc");
    const { subtotal, tax, total } = calculateCartSummary(cart.products);
    cart.subtotal = subtotal;
    cart.tax = tax;
    cart.total = total;

    // Save the updated cart
    await cart.save();
    res.status(200).json({ success : true, cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success : false, message: "Error deleting product from cart" });
  }
};
