const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,     //field is compulsory
      trim: true,         //remove extra spaces from the beginning and end of the string
    },
    realPrice: {
      type: Number,
      required: true,
      min: 0,              //price must be a positive number
    },
    salePrice: {
      type: Number,
      required: true,
      min: 0,              //price must be a positive number
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: null,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,           //stock must be a positive number
    },
    images: { 
      type: [String], 
      default: [] 
    },      // multiple images array
    imageUrl: { 
      type: String, 
      default: '' 
    },
  },
  { timestamps: true }
);


// Validate salePrice <= realPrice
productSchema.pre('save', function (next) {
  if (this.salePrice > this.realPrice) {
    return next(new Error('Sale price cannot be greater than real price'));
  }

  // sync imageUrl with first image for backward compat
  if (this.images && this.images.length > 0) {
    this.imageUrl = this.images[0];
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);        //create and export Product model