const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const PendingRegistration = require('../models/PendingRegistration');
const { sendOtp, verifyOtp } = require('../services/msg91');
const { pushRegistrationToGoogleSheet } = require('../services/googleSheets');
const { normalizePhone, cleanString, validEmail } = require('../utils');

const router = express.Router();

const RESEND_COOLDOWN_MS = 60 * 1000;
const PENDING_EXPIRY_MS = Number(process.env.MSG91_OTP_EXPIRY_MINUTES || 10) * 60 * 1000;

function validateRegistration(body) {
  const firstName = cleanString(body.firstName, 80);
  const lastName = cleanString(body.lastName, 80);
  const email = cleanString(body.email, 160).toLowerCase();
  const phone = normalizePhone(body.phone);
  const password = String(body.password || '');
  const program = cleanString(body.program, 120);

  if (!firstName) throw new Error('First name is required.');
  if (!lastName) throw new Error('Last name is required.');
  if (!validEmail(email)) throw new Error('Please enter a valid email address.');
  if (password.length < 6) throw new Error('Password must contain at least 6 characters.');
  if (!program) throw new Error('Please select a program.');

  return {
    firstName,
    lastName,
    email,
    phone,
    password,
    dob: cleanString(body.dob, 30),
    gender: cleanString(body.gender, 40),
    program,
    courseType: cleanString(body.courseType, 80),
    timing: cleanString(body.timing, 80),
    institution: cleanString(body.institution, 160),
    source: cleanString(body.source, 80),
    message: cleanString(body.message, 500)
  };
}

async function sendRegistrationOtp(req, res, isResend = false) {
  try {
    const data = validateRegistration(req.body);

    const existingUser = await User.findOne({
      $or: [{ phone: data.phone }, { email: data.email }]
    }).lean();

    if (existingUser) {
      if (existingUser.phone === data.phone) {
        return res.status(409).json({
          success: false,
          message: 'An account already exists for this mobile number. Please login.'
        });
      }

      return res.status(409).json({
        success: false,
        message: 'An account already exists with this email address.'
      });
    }

    const existingPending = await PendingRegistration.findOne({ phone: data.phone });
    const now = Date.now();

    if (existingPending?.lastOtpSentAt && now - new Date(existingPending.lastOtpSentAt).getTime() < RESEND_COOLDOWN_MS) {
      const remaining = Math.ceil(
        (RESEND_COOLDOWN_MS - (now - new Date(existingPending.lastOtpSentAt).getTime())) / 1000
      );

      return res.status(429).json({
        success: false,
        message: `Please wait ${remaining} seconds before requesting another OTP.`,
        retryAfterSeconds: remaining
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const pending = await PendingRegistration.findOneAndUpdate(
      { phone: data.phone },
      {
        ...data,
        passwordHash,
        lastOtpSentAt: new Date(),
        otpRequestCount: (existingPending?.otpRequestCount || 0) + 1,
        expiresAt: new Date(now + PENDING_EXPIRY_MS)
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const msg91 = await sendOtp(data.phone);

    return res.json({
      success: true,
      message: isResend ? 'A new OTP has been sent.' : 'OTP sent successfully.',
      phone: `+${data.phone.slice(0, 2)} ${data.phone.slice(2, 7)} ${data.phone.slice(7)}`,
      expiresInSeconds: Math.round(PENDING_EXPIRY_MS / 1000),
      requestId: msg91.requestId,
      pendingId: pending._id.toString()
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Unable to send OTP.'
    });
  }
}

router.post('/send-otp', (req, res) => sendRegistrationOtp(req, res, false));
router.post('/resend-otp', (req, res) => sendRegistrationOtp(req, res, true));

router.post('/verify-otp', async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const otp = String(req.body.otp || '').replace(/\D/g, '');

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the complete 6-digit OTP.'
      });
    }

    const pending = await PendingRegistration.findOne({ phone });

    if (!pending) {
      return res.status(404).json({
        success: false,
        message: 'Your registration session has expired. Please start again.'
      });
    }

    if (pending.expiresAt.getTime() < Date.now()) {
      await PendingRegistration.deleteOne({ _id: pending._id });
      return res.status(410).json({
        success: false,
        message: 'OTP session expired. Please request a new OTP.'
      });
    }

    const result = await verifyOtp(phone, otp);

    if (!result.verified) {
      return res.status(401).json({
        success: false,
        message: result.message || 'Invalid or expired OTP.'
      });
    }

    const duplicate = await User.findOne({
      $or: [{ phone: pending.phone }, { email: pending.email }]
    }).lean();

    if (duplicate) {
      await PendingRegistration.deleteOne({ _id: pending._id });
      return res.status(409).json({
        success: false,
        message: 'An account already exists with this mobile number or email.'
      });
    }

    const user = await User.create({
      firstName: pending.firstName,
      lastName: pending.lastName,
      email: pending.email,
      phone: pending.phone,
      dob: pending.dob,
      gender: pending.gender,
      passwordHash: pending.passwordHash,
      program: pending.program,
      courseType: pending.courseType,
      timing: pending.timing,
      institution: pending.institution,
      source: pending.source,
      message: pending.message,
      phoneVerified: true
    });

    let sheetResult = { sent: false, skipped: true };

    try {
      sheetResult = await pushRegistrationToGoogleSheet({
        studentId: user._id.toString(),
        name: `${user.firstName} ${user.lastName}`.trim(),
        phone: `+${user.phone}`,
        email: user.email,
        dob: user.dob,
        gender: user.gender,
        program: user.program,
        courseType: user.courseType,
        timing: user.timing,
        institution: user.institution,
        source: user.source,
        message: user.message,
        registeredAt: user.createdAt.toISOString(),
        status: 'New'
      });
    } catch (sheetError) {
      console.error('Google Sheet sync failed:', sheetError);
    }

    await PendingRegistration.deleteOne({ _id: pending._id });

    const token = jwt.sign(
      {
        sub: user._id.toString(),
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      user: {
        id: user._id.toString(),
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        phone: `+${user.phone}`,
        program: user.program,
        role: user.role
      },
      token,
      googleSheetSynced: Boolean(sheetResult.sent)
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Unable to verify OTP.'
    });
  }
});

module.exports = router;
