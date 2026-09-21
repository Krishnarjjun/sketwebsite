const mongoose = require('mongoose');

const pendingRegistrationSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 80 },
    lastName: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    phone: { type: String, required: true, unique: true, index: true },
    dob: { type: String, default: '' },
    gender: { type: String, default: '' },
    passwordHash: { type: String, required: true },
    program: { type: String, required: true },
    courseType: { type: String, default: '' },
    timing: { type: String, default: '' },
    institution: { type: String, default: '' },
    source: { type: String, default: '' },
    message: { type: String, default: '', maxlength: 500 },
    lastOtpSentAt: { type: Date, default: null },
    otpRequestCount: { type: Number, default: 0 },
    expiresAt: {type: Date,  required: true},
  },
  { timestamps: true }
);

pendingRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PendingRegistration', pendingRegistrationSchema);
