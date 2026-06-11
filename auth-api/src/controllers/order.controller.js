const Order = require('../models/order.model');
const Product = require('../models/product.model');

const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, address, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!items || !totalAmount || !address || !paymentMethod) {
      return res.status(400).json({ 
        success: false, message: 'items, totalAmount, address and paymentMethod are required' 
      });
    }

    // Check stock availability for all items first
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ 
          success: false, message: `Product not found: ${item.productId}` 
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }
    }

    // Deduct stock using atomic updates to prevent overselling
    for (const item of items) {
      const result = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!result) {
        return res.status(400).json({
          success: false,
          message: `Stock update failed for product ${item.productId}. It may have just sold out.`,
        });
      }
    }

    // Create order
    const newOrder = new Order({ userId, items, totalAmount, address, paymentMethod });
    const savedOrder = await newOrder.save();

    res.status(201).json({ success: true, message: 'Order created successfully', order: savedOrder });
  } 
  catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).populate('items.productId').sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } 
  catch (error) {
    res.status(500).json({ success: false, message: error.message 
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('items.productId').sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } 
  catch (error) {
    res.status(500).json({ success: false, message: error.message 
    });
  }
};

module.exports = { createOrder, getOrdersByUserId, getAllOrders };