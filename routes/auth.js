const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../utils/auth');
const { guestOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/register', guestOnly, (req, res) => {
  res.render('auth/register', {
    title: 'Register'
  });
});

router.post('/register', [
  guestOnly,
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.render('auth/register', {
        title: 'Register',
        error: errors.array()[0].msg,
        formData: req.body,
        errors: errors.array()
      });
    }

    const existingUser = await User.findByEmail(req.body.email);
    if (existingUser) {
      return res.render('auth/register', {
        title: 'Register',
        error: 'Email already registered',
        formData: req.body
      });
    }

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });

    const token = generateToken(user.id);
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Registration error:', error);
    res.render('auth/register', {
      title: 'Register',
      error: 'Registration failed. Please try again.',
      formData: req.body
    });
  }
});

router.get('/login', guestOnly, (req, res) => {
  res.render('auth/login', {
    title: 'Login'
  });
});

router.post('/login', [
  guestOnly,
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.render('auth/login', {
        title: 'Login',
        error: errors.array()[0].msg,
        formData: req.body
      });
    }

    const user = await User.findByEmail(req.body.email);
    if (!user || !(await user.validatePassword(req.body.password))) {
      return res.render('auth/login', {
        title: 'Login',
        error: 'Invalid email or password',
        formData: req.body
      });
    }

    const token = generateToken(user.id);
    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', {
      title: 'Login',
      error: 'Login failed. Please try again.',
      formData: req.body
    });
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

module.exports = router;