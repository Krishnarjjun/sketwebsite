const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },

    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: 30
    },

    address: {
      type: String,
      default: '',
      trim: true
    },

    city: {
      type: String,
      default: '',
      trim: true
    },

    district: {
      type: String,
      default: '',
      trim: true
    },

    state: {
      type: String,
      default: 'Telangana',
      trim: true
    },

    pincode: {
      type: String,
      default: '',
      trim: true
    },

    principalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
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

module.exports = mongoose.model('College', collegeSchema);