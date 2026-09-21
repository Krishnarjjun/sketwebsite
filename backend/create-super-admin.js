require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/User');

async function createSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Connected to MongoDB.');

    const email = 'admin@shreekrishnaedutech.com';
    const phone = '9999999999';
    const password = 'Admin@12345';

    const passwordHash = await bcrypt.hash(password, 12);

    let admin = await User.findOne({ email });

    if (admin) {
      admin.firstName = 'Super';
      admin.lastName = 'Admin';
      admin.phone = phone;
      admin.passwordHash = passwordHash;
      admin.role = 'super_admin';
      admin.collegeId = null;
      admin.phoneVerified = true;
      admin.status = 'active';

      await admin.save();

      console.log('Existing account updated to Super Admin.');
    } else {
      admin = await User.create({
        firstName: 'Super',
        lastName: 'Admin',
        email,
        phone,
        passwordHash,
        role: 'super_admin',
        collegeId: null,
        phoneVerified: true,
        status: 'active'
      });

      console.log('Super Admin created successfully.');
    }

    console.log('');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Password has been reset for development testing.');
  } catch (error) {
    console.error('Error creating Super Admin:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createSuperAdmin();