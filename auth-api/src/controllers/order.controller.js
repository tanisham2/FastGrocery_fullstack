const Order = require('../models/order.model');

const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, address } = req.body;
    const userId = req.user.id; // from JWT token, not body

    if (!items || !totalAmount || !address) {
      return res.status(400).json({ success: false, message: 'items, totalAmount and address are required' });
    }

    const newOrder = new Order({ userId, items, totalAmount, address });
    const savedOrder = await newOrder.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: savedOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).populate('items.productId');

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('items.productId');
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, getOrdersByUserId, getAllOrders };