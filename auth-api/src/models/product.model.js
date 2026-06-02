const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,     //field is compulsory
      trim: true,         //remove extra spaces from the beginning and end of the string
    },
    price: {
      type: Number,
      required: true,
      min: 0,              //price must be a positive number
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
    imageUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);        //create and export Product model