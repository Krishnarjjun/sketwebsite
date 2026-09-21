const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 160
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    dob: {
      type: String,
      default: ''
    },

    gender: {
      type: String,
      default: ''
    },

    passwordHash: {
      type: String,
      required: true
    },

    program: {
      type: String,
      default: ''
    },

    courseType: {
      type: String,
      default: ''
    },

    timing: {
      type: String,
      default: ''
    },

    institution: {
      type: String,
      default: ''
    },

    source: {
      type: String,
      default: ''
    },

    message: {
      type: String,
      default: '',
      maxlength: 500
    },

    // User access level
    role: {
      type: String,
      enum: [
        'student',
        'principal',
        'faculty',
        'admin',
        'super_admin'
      ],
      default: 'student',
      index: true
    },

    // College associated with this user.
    // Students, principals and faculty can be linked to a college.
    // Admins and super_admins can have this as null.
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      default: null,
      index: true
    },

    phoneVerified: {
      type: Boolean,
      default: true
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

userSchema.index(
  { email: 1 },
  { unique: true }
);

module.exports = mongoose.model('User', userSchema);