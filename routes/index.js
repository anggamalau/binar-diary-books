const express = require('express');
const { authMiddleware, guestOnly } = require('../middleware/auth');
const database = require('../config/database');

const router = express.Router();

router.get('/', guestOnly, (req, res) => {
  res.render('index', {
    title: 'Welcome'
  });
});

router.get('/dashboard', authMiddleware, (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard',
    user: req.user
  });
});

module.exports = router;