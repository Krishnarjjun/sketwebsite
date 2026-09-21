const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { normalizePhone } = require('../utils');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const identifier = String(req.body.identifier || '').trim();
    const password = String(req.body.password || '');

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Mobile/email and password are required.'
      });
    }

    const isEmail = identifier.includes('@');

    const user = isEmail
      ? await User.findOne({ email: identifier.toLowerCase() })
      : await User.findOne({ phone: normalizePhone(identifier) });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid login credentials.'
      });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid login credentials.'
      });
    }

    const token = jwt.sign(
      { sub: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        phone: `+${user.phone}`,
        role: user.role,
        program: user.program
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Unable to login.'
    });
  }
});

module.exports = router;
