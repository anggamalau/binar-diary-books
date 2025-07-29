const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.redirect('/auth/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      res.clearCookie('token');
      return res.redirect('/auth/login');
    }

    req.user = user;
    res.locals.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.clearCookie('token');
    res.redirect('/auth/login');
  }
};

const guestOnly = (req, res, next) => {
  const token = req.cookies.token;
  
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.redirect('/dashboard');
    } catch (error) {
      res.clearCookie('token');
    }
  }
  
  next();
};

module.exports = { authMiddleware, guestOnly };