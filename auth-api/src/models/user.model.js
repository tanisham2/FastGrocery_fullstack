const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,     //field is compulsory
      trim: true,         //remove extra spaces from the beginning and end of the string
    },
    email: {
      type: String,
      required: true,
      unique: true,        //email should be unique (no duplicate)
      lowercase: true,     //convert email to lowercase before saving to database
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,           //password must contain at least 6 characters
    },          
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);        //create and export User model