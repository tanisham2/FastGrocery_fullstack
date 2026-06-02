const Cart = require('../models/cart.model');

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id; // get from JWT token

    if (!productId || !quantity) {
      return res.status(400).json({ success: false, message: 'productId and quantity are required' });
    }

    let cart = await Cart.findOne({ userId });

    if (cart) {
      const existingProduct = cart.products.find(
        (p) => p.productId.toString() === productId.toString()
      );
      if (existingProduct) {
        existingProduct.quantity = quantity; // set exact quantity (not add)
      } 
      else {
        cart.products.push({ productId, quantity });
      }
      await cart.save();
    } 
    else {
      cart = new Cart({ userId, products: [{ productId, quantity }] });
      await cart.save();
    }

    res.status(200).json({ success: true, data: cart });
  } 
  catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user.id; // get from JWT token, not params
    const cart = await Cart.findOne({ userId }).populate('products.productId');

    if (!cart) {
      // return empty cart instead of 404 — frontend handles empty array
      return res.status(200).json({ success: true, data: { products: [] } });
    }

    res.status(200).json({ success: true, data: cart });
  } 
  catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id; // get from JWT token
    const { id: productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.products = cart.products.filter(
      (p) => p.productId.toString() !== productId.toString()
    );
    await cart.save();

    res.status(200).json({ success: true, data: cart });
  } 
  catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id; // get from JWT token
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(200).json({ success: true, message: 'Cart already empty' });
    }

    cart.products = [];
    await cart.save();

    res.status(200).json({ success: true, message: 'Cart cleared', data: cart });
  } 
  catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { addToCart, getCart, removeFromCart, clearCart };