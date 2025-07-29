const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      // Store the intended destination for after login
      if (req.method === 'GET' && !req.originalUrl.startsWith('/auth/')) {
        req.session = req.session || {};
        req.session.returnTo = req.originalUrl;
      }
      return res.redirect('/auth/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.clearCookie('token');
      return res.redirect('/auth/login');
    }

    // Check if token is close to expiring (within 1 day) and refresh if needed
    const tokenExp = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    if (tokenExp - now < oneDayInMs) {
      const { generateToken } = require('../utils/auth');
      const newToken = generateToken(user.id);
      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
    }

    req.user = user;
    res.locals.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.clearCookie('token');

    // Store the intended destination for after login
    if (req.method === 'GET' && !req.originalUrl.startsWith('/auth/')) {
      req.session = req.session || {};
      req.session.returnTo = req.originalUrl;
    }

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
      console.error('Guest only middleware error:', error);
      res.clearCookie('token');
    }
  }

  next();
};

module.exports = { authMiddleware, guestOnly };
