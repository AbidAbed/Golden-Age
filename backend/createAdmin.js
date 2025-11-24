const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const speakeasy = require('speakeasy');
require('dotenv').config({ path: '../.env' });

async function createAdminUser() {
  try {
    await mongoose.connect('mongodb+srv://MASSDESTRUCTION:vxk8quoX0I0kYwE8@cluster001.yqhek9a.mongodb.net/golden-age');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Generate TOTP secret for admin
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `GoldenAge (admin)`,
      issuer: 'GoldenAge'
    });

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      avatar: '',
      totpSecret: secret.base32
    });
    
    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('TOTP Secret:', secret.base32);
    console.log('QR Code URL:', `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(secret.otpauth_url)}`);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

createAdminUser();