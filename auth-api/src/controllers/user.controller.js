const User = require('../models/user.model');

const getAllUsers = async (req, res) => {
  try {
    const { name, email, sortBy, order, page, limit } = req.method === 'POST' ? req.body : req.query;

    const filter = {};

    if (name) {                           //filter by name (partial match, case-insensitive)
      filter.name = { $regex: name, $options: 'i' };
    }

    if (email) {                        //filter by email (partial match, case-insensitive)
      filter.email = { $regex: email, $options: 'i' };
    }

    const pageNum = parseInt(page) || 1;                     //pagination
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sortField = sortBy || 'createdAt';                  // sorting
    const sortOrder = order === 'asc' ? 1 : -1;

    const users = await User.find(filter, { password: 0, otp: 0, otpExpiry: 0 })
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      count: users.length,
      data: users,
    });
  } 
  catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllUsers };