const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { resolveJwtSecret } = require('../config/env');
const { mapAuthError } = require('../utils/authErrors');

const ensureDb = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      message: 'Database is not connected. Please try again in a moment.',
    });
    return false;
  }
  return true;
};

const signToken = (userId) =>
  jwt.sign({ id: userId.toString() }, resolveJwtSecret(), { expiresIn: '7d' });

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  if (!ensureDb(res)) return;

  const email = req.body.email?.trim().toLowerCase();
  const { password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const savedUser = await User.create({
      email,
      passwordHash,
    });

    const token = signToken(savedUser._id);

    res.status(201).json({
      token,
      user: {
        id: savedUser._id.toString(),
        email: savedUser.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    const { status, message } = mapAuthError(
      error,
      'Server error during registration'
    );
    res.status(status).json({ message });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', async (req, res) => {
  if (!ensureDb(res)) return;

  const email = req.body.email?.trim().toLowerCase();
  const { password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    const { status, message } = mapAuthError(error, 'Server error during login');
    res.status(status).json({ message });
  }
});

module.exports = router;
