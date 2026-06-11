const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    password: { 
      type: String, 
      required: true, 
      minlength: 6 
    },
    phone: {
      type: String,
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',        // all new users are regular users by default
    },
    otp: { 
      type: String, 
      default: null 
    },
    otpExpiry: { 
      type: Date, 
      default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);      //create and export User model