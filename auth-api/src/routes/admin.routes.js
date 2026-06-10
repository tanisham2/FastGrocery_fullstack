const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');
const adminOnly = require('../middlewares/admin.middleware');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const upload = require('../middlewares/upload.middleware');

// All admin routes require both authenticate + adminOnly
const guard = [authenticate, adminOnly];

// --- STATS ---
router.get('/stats', guard, async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, orders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.find().select('totalAmount createdAt status'),
    ]);
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('items.productId');

    res.json({ success: true, data: { totalUsers, totalProducts, totalOrders, totalRevenue, recentOrders } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- USERS ---
router.get('/users', guard, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/users/:id/role', guard, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- PRODUCTS ---
router.get('/products', guard, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/products', guard, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/products/:id', guard, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/products/:id', guard, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- ORDERS ---
router.get('/orders', guard, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('items.productId');
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/orders/:id/status', guard, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Upload single image, returns URL
router.post('/upload-image', guard, upload.single('image'), (req, res) => {
  if (!req.file) 
    return res.status(400).json({
  success: false, message: 'No file uploaded' 
});
  const imageUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
  res.json({ 
    success: true, imageUrl 
  });
});

module.exports = router;