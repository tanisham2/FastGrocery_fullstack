const authService = require('../services/auth.service');      //import authService to call logic(register,login,forget,update) 

const register = async (req, res) => {
  try {
    const data = await authService.register(req.body);
    res.status(201).json({ success: true, data });
  } 
  catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    res.status(200).json({ success: true, data });
  } 
  catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const data = await authService.forgetPassword(req.body);
    res.status(200).json({ success: true, data });
  } 
  catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const data = await authService.updatePassword(req.body);
    res.status(200).json({ success: true, data });
  } 
  catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


module.exports = { register, login, forgetPassword, updatePassword };