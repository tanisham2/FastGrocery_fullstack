const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');               //import 'jsonwebtoken' package to: generate JWT tokens
const User = require('../models/user.model');      //import "User model" to interact with: users collection in database

const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });         //check if email already exists
  if (existing) {
    throw new Error('Email already registered');
  }
  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashed });

  return { id: user._id, name: user.name, email: user.email, role: user.role };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { 
      id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return { 
    token, 
    user: { 
      id: user._id, 
      name: user.name, 
      email: user.email,
      role: user.role
     }};
};

const { sendOTPEmail } = require('../config/mailer');

const forgetPassword = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Email not found');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);        //5 mins from now

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();
  await sendOTPEmail(email, otp);

  return { message: 'OTP sent to your email' };
};

const updatePassword = async ({ email, otp, newPassword, confirmPassword }) => {
  if (newPassword !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Email not found');
  }
  if (!user.otp || !user.otpExpiry) {
    throw new Error('OTP not generated! Please request a new one');
  }
  if (user.otp !== otp) {
    throw new Error('Invalid OTP');
  }
  if (new Date() > user.otpExpiry) {
    throw new Error('OTP has expired. Please request a new one');
  }
  user.password = await bcrypt.hash(newPassword, 12);
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  return { message: 'Password updated successfully' };
};
module.exports = { register, login, forgetPassword, updatePassword };