const Product = require('../models/product.model');

const createProduct = async (req, res) => {               //add product
  try {
    const { name, realPrice, salePrice, category, description, stock, imageUrl } = req.body;

    if (!name || !realPrice || !salePrice || !category) {
      return res.status(400).json({ 
        success: false, message: 'name, realPrice, salePrice and category are required' 
      });
    }
    if (Number(salePrice) > Number(realPrice)) {
      return res.status(400).json({ 
        success: false, message: 'salePrice cannot be greater than realPrice' 
      });
    }

    const product = new Product({ name, 
      realPrice: Number(realPrice), 
      salePrice: Number(salePrice), 
      category, 
      description: description || '', stock: Number(stock) || 0, imageUrl: imageUrl || '' 
    });
    await product.save();
    res.status(201).json({ 
      success: true, data: product 
    });
  } 
  catch (err) {
    res.status(400).json({ 
      success: false, message: err.message 
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      products,
    });
  } 
  catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } 
  catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProduct = async (req, res) => {                 //edit product
  try {
    const { realPrice, salePrice } = req.body;

    if (realPrice && salePrice && Number(salePrice) > Number(realPrice)) {
      return res.status(400).json({ 
        success: false, message: 'salePrice cannot be greater than realPrice' 
      });
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, runValidators: true 
    });
    if (!product) 
      return res.status(404).json({
        success: false, message: 'Product not found'
      });

    res.status(200).json({ 
      success: true, data: product 
    });
  } 
  catch (err) {
    res.status(400).json({ 
      success: false, message: err.message 
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } 
  catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct};