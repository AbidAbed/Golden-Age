const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const speakeasy = require('speakeasy');

const logger = require('../utils/logger'); // Assuming a logger utility exists

const router = express.Router();

// Register user (public registration for users)
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Basic input validation
    if (!username || !password) {
      logger.warn('Registration attempt with missing username or password');
      return res.status(400).json({ message: 'Username and password are required' });
    }
    if (username.length < 3 || username.length > 30) {
      logger.warn(`Registration attempt with invalid username length: ${username}`);
      return res.status(400).json({ message: 'Username must be between 3 and 30 characters' });
    }
    if (password.length < 6) {
      logger.warn(`Registration attempt with weak password for user: ${username}`);
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      logger.info(`Registration attempt for existing user: ${username}`);
      return res.status(400).json({
        message: 'User with this username already exists'
      });
    }

    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `GoldenAge (${username})`,
      issuer: 'GoldenAge'
    });
    logger.info(`Generated TOTP secret for new user ${username}. Secret: ${secret.base32}`);

    // Create new user with TOTP secret since 2FA is enabled by default
    const user = new User({
      username,
      password,
      role: 'user',
      totpSecret: secret.base32 // Set TOTP secret since 2FA is enabled by default
    });

    logger.debug(`Attempting to save user ${username} to DB.`);
    await user.save();
    logger.info(`User ${username} registered successfully with ID: ${user._id}`);

    logger.debug(`Sending registration success response for user ${username}.`);
    res.status(201).json({
      success: true,
      userId: user._id,
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(secret.otpauth_url)}`
    });
  } catch (error) {
    logger.error(`Registration error for user ${req.body.username || 'unknown'}:`, error);
    res.status(500).json({ message: 'Error creating user', error: error.message }); // Include error message for debugging
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Basic input validation
    if (!username || !password) {
      logger.warn('Login attempt with missing username or password');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      logger.info(`Login attempt failed for non-existent user: ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.warn(`Login attempt failed for user ${username}: Invalid password`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If 2FA is enabled, prompt for 2FA
    if (user.totpSecret) { // Check for totpSecret
      logger.info(`User ${username} requires 2FA for login.`);
      return res.json({ need2fa: true, userId: user._id });
    }

    // If 2FA is not enabled, proceed with regular login
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    logger.info(`User ${username} logged in successfully (no 2FA).`);

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Verify 2FA during login or setup
router.post('/verify-2fa', async (req, res) => {
  try {
    const { userId, twoFactorToken, secret } = req.body;

    if (!userId || !twoFactorToken) {
      logger.warn('2FA verification attempt with missing userId or twoFactorToken');
      return res.status(400).json({ message: 'User ID and 2FA token are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`2FA verification attempt for non-existent user ID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    let secretToVerify = user.totpSecret;
    if (!secretToVerify && secret) {
      // For setup, use the provided secret
      secretToVerify = secret;
    } else if (!secretToVerify) {
      logger.warn(`2FA verification attempt for user ${user.username} without 2FA setup.`);
      return res.status(400).json({ message: '2FA not set up for this user' });
    }

    const verified = speakeasy.totp.verify({
      secret: secretToVerify,
      encoding: 'base32',
      token: twoFactorToken,
      window: 1
    });

    if (!verified) {
      logger.warn(`2FA verification failed for user ${user.username}: Invalid token`);
      return res.status(401).json({ message: 'Invalid 2FA token' });
    }

    // If secret was provided and not set, save it
    if (secret && !user.totpSecret) {
      user.totpSecret = secret;
      await user.save();
      logger.info(`2FA secret set for user ${user.username}`);
    }

    // 2FA successfully verified, issue full authentication token
    const authToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();
    logger.info(`User ${user.username} successfully verified 2FA and logged in.`);

    res.json({
      message: '2FA verified and login successful',
      token: authToken,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    logger.error('2FA verification error:', error);
    res.status(500).json({ message: 'Error during 2FA verification' });
  }
});


// Get all users (admin only)
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = 'all' } = req.query;
    
    let filter = {};
    
    if (search) {
      filter.username = { $regex: search, $options: 'i' };
    }
    
    if (role !== 'all') {
      filter.role = role;
    }
    
    const totalUsers = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password -totpSecret')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    res.json({
      success: true,
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Create user (admin only)
router.post('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { username, password, role, telegramUsername } = req.body;

    // Basic input validation for admin creating user
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ message: 'Username must be between 3 and 30 characters' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this username already exists' 
      });
    }

    // Create new user
    const user = new User({
      username,
      password,
      role: role || 'user',
      telegramUsername
    });

    await user.save();

    logger.info(`Admin ${req.user.username} created user ${user.username} with role ${user.role}`);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        telegramUsername: user.telegramUsername,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Update user (admin only)
router.put('/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, role, telegramUsername, isActive } = req.body;

    // Basic input validation for admin updating user
    if (username && (username.length < 3 || username.length > 30)) {
      return res.status(400).json({ message: 'Username must be between 3 and 30 characters' });
    }
    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Check if username is already taken by another user
    const existingUser = await User.findOne({
      _id: { $ne: id },
      username
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Username already taken by another user'
      });
    }

    const updateData = {
      username,
      role,
      telegramUsername,
      isActive
    };

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password -totpSecret');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    logger.info(`Admin ${req.user.username} updated user ${user.username}`);

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (id === req.user.userId) {
      return res.status(400).json({
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    logger.info(`Admin ${req.user.username} deleted user ${user.username}`);

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Get single user (admin only)
router.get('/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password -totpSecret');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Reset user password (admin only)
router.post('/users/:id/reset-password', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long'
      });
    }

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

// Get all users (admin only with pagination)
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { telegramUsername: { $regex: search, $options: 'i' } }
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password -totpSecret')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get all users (admin only with pagination)
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { telegramUsername: { $regex: search, $options: 'i' } }
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password -totpSecret')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add computed fields
    const userResponse = user.toObject();
    // Return the stored twoFactorEnabled value
    delete userResponse.totpSecret; // Remove the secret from response

    res.json({ user: userResponse });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// Update current user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { username, telegramUsername, password, currentPassword, avatar } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Basic input validation for profile update
    if (username && (username.length < 3 || username.length > 30)) {
      return res.status(400).json({ message: 'Username must be between 3 and 30 characters' });
    }
    if (password && password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Verify current password if changing password
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password' });
      }
      
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    // Update username if provided and different
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    // Update telegramUsername if provided
    if (telegramUsername !== undefined) {
      user.telegramUsername = telegramUsername;
    }

    // Update avatar if provided
    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    // Update password if provided (pre-save hook will hash it)
    if (password) {
      user.password = password;
    }

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.totpSecret;

    res.json({ message: 'Profile updated successfully', user: safeUser });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Generate 2FA secret
router.post('/2fa/generate', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const secret = speakeasy.generateSecret({
      length: 20,
      name: `GoldenAge (${user.username})`,
      issuer: 'GoldenAge'
    });

    user.totpSecret = secret.base32;
    await user.save();

    res.json({
      message: '2FA secret generated',
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(secret.otpauth_url)}`
    });
  } catch (error) {
    logger.error('Generate 2FA secret error:', error);
    res.status(500).json({ message: 'Error generating 2FA secret' });
  }
});

// Cancel 2FA setup (clear generated secret)
router.post('/2fa/cancel', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Clear any generated TOTP secret that hasn't been verified yet
    user.totpSecret = undefined;
    await user.save();

    res.json({ message: '2FA setup cancelled' });
  } catch (error) {
    logger.error('Cancel 2FA setup error:', error);
    res.status(500).json({ message: 'Error cancelling 2FA setup' });
  }
});

// Verify 2FA token during registration (with temp token)
router.post('/verify-2fa-setup', async (req, res) => {
  try {
    const { tempToken, token } = req.body;

    // Verify temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (decoded.type !== '2fa_setup') {
      return res.status(400).json({ message: 'Invalid token type' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.totpSecret) return res.status(400).json({ message: '2FA not set up for this user' });

    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: token,
      window: 1
    });

    if (verified) {
      // Mark 2FA as verified (could add a flag if needed)
      res.json({ message: '2FA verified successfully. You can now log in.' });
    } else {
      res.status(401).json({ message: 'Invalid 2FA token' });
    }
  } catch (error) {
    logger.error('Verify 2FA setup error:', error);
    res.status(500).json({ message: 'Error verifying 2FA token' });
  }
});

// Verify 2FA token for authenticated user
router.post('/2fa/verify', authenticateToken, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      logger.warn('2FA verification attempt with missing token');
      return res.status(400).json({ message: '2FA token is required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      logger.warn(`2FA verification attempt for non-existent user ID: ${req.user.userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.totpSecret) {
      logger.warn(`2FA verification attempt for user ${user.username} without 2FA setup.`);
      return res.status(400).json({ message: '2FA not set up for this user' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: token,
      window: 1
    });

    if (!verified) {
      logger.warn(`2FA verification failed for user ${user.username}: Invalid token`);
      return res.status(401).json({ message: 'Invalid 2FA token' });
    }

    // Enable 2FA for the user
    user.twoFactorEnabled = true;
    await user.save();

    logger.info(`2FA successfully enabled for user ${user.username}`);

    res.json({ message: '2FA verified and enabled successfully' });
  } catch (error) {
    logger.error('2FA verify error:', error);
    res.status(500).json({ message: 'Error verifying 2FA token' });
  }
});

// Disable 2FA for authenticated user
router.post('/2fa/disable', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.totpSecret = null;
    user.twoFactorEnabled = false;
    await user.save();

    logger.info(`2FA disabled for user ${user.username}`);

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    logger.error('Disable 2FA error:', error);
    res.status(500).json({ message: 'Error disabling 2FA' });
  }
});

// Logout (client-side token removal, but we can add token blacklisting here if needed)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;
