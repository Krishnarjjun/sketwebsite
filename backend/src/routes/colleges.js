const express = require('express');

const College = require('../models/College');
const {
  authenticate,
  authorizeRoles
} = require('../middleware/auth');

const router = express.Router();

/*
  GET /api/colleges

  Super Admin/Admin:
  Can view all colleges.
*/
router.get(
  '/',
  authenticate,
  authorizeRoles('admin', 'super_admin'),
  async (req, res) => {
    try {
      const colleges = await College.find()
        .populate(
          'principalId',
          'firstName lastName email phone role'
        )
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        count: colleges.length,
        colleges
      });
    } catch (error) {
      console.error('Get colleges error:', error);

      return res.status(500).json({
        success: false,
        message: 'Unable to fetch colleges.'
      });
    }
  }
);


/*
  GET /api/colleges/:id

  Admin/Super Admin:
  Can view a specific college.
*/
router.get(
  '/:id',
  authenticate,
  authorizeRoles('admin', 'super_admin'),
  async (req, res) => {
    try {
      const college = await College.findById(req.params.id)
        .populate(
          'principalId',
          'firstName lastName email phone role'
        );

      if (!college) {
        return res.status(404).json({
          success: false,
          message: 'College not found.'
        });
      }

      return res.json({
        success: true,
        college
      });
    } catch (error) {
      console.error('Get college error:', error);

      return res.status(400).json({
        success: false,
        message: 'Invalid college ID.'
      });
    }
  }
);


/*
  POST /api/colleges

  Only Super Admin can create a college.
*/
router.post(
  '/',
  authenticate,
  authorizeRoles('super_admin'),
  async (req, res) => {
    try {
      const {
        name,
        code,
        address,
        city,
        district,
        state,
        pincode
      } = req.body;

      if (!name || !code) {
        return res.status(400).json({
          success: false,
          message: 'College name and code are required.'
        });
      }

      const existingCollege = await College.findOne({
        code: String(code).trim().toUpperCase()
      });

      if (existingCollege) {
        return res.status(409).json({
          success: false,
          message: 'College code already exists.'
        });
      }

      const college = await College.create({
        name: String(name).trim(),
        code: String(code).trim().toUpperCase(),
        address: String(address || '').trim(),
        city: String(city || '').trim(),
        district: String(district || '').trim(),
        state: String(state || 'Telangana').trim(),
        pincode: String(pincode || '').trim()
      });

      return res.status(201).json({
        success: true,
        message: 'College created successfully.',
        college
      });
    } catch (error) {
      console.error('Create college error:', error);

      return res.status(400).json({
        success: false,
        message: error.message || 'Unable to create college.'
      });
    }
  }
);


/*
  PATCH /api/colleges/:id

  Only Super Admin can update a college.
*/
router.patch(
  '/:id',
  authenticate,
  authorizeRoles('super_admin'),
  async (req, res) => {
    try {
      const allowedFields = [
        'name',
        'address',
        'city',
        'district',
        'state',
        'pincode',
        'status'
      ];

      const updates = {};

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      const college = await College.findByIdAndUpdate(
        req.params.id,
        updates,
        {
          new: true,
          runValidators: true
        }
      );

      if (!college) {
        return res.status(404).json({
          success: false,
          message: 'College not found.'
        });
      }

      return res.json({
        success: true,
        message: 'College updated successfully.',
        college
      });
    } catch (error) {
      console.error('Update college error:', error);

      return res.status(400).json({
        success: false,
        message: error.message || 'Unable to update college.'
      });
    }
  }
);

module.exports = router;