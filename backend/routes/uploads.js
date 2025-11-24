const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Added fs for file operations
const { authenticateToken, isAdmin } = require('../middleware/auth');
const fileManager = require('../fileManager'); // Import Gofile.io file manager
const Post = require('../models/Post'); // Import Post model
const User = require('../models/User'); // Import User model
const logger = require('../utils/logger'); // Import the logger

const router = express.Router();

// Configure multer for memory storage (files will be processed by Gofile.io)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'application/zip': '.zip',
    'application/x-zip-compressed': '.zip',
    'application/x-rar-compressed': '.rar',
    'application/x-7z-compressed': '.7z',
    'application/pdf': '.pdf',
    'text/plain': '.txt',
    'video/mp4': '.mp4', // Added video types
    'video/webm': '.webm',
    'video/ogg': '.ogg',
    'application/x-msdownload': '.exe', // For software executables
    'application/octet-stream': '.bin' // Generic binary
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // Increased limit to 500MB for software/videos
  }
});

// File filter for avatars (images only)
const avatarFileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Avatar file type not allowed. Only images (jpg, png, gif) are permitted.'), false);
  }
};

const uploadAvatar = multer({
  storage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for avatars
  }
});

// Upload single file (admin only)
router.post('/single', authenticateToken, isAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { postId, fileType } = req.body; // Expect postId and fileType (software, screenshot, video)

    if (!postId || !fileType) {
      return res.status(400).json({ message: 'postId and fileType are required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Upload based on file type
    let uploadResponse;
    let fileData;

    if (fileType === 'software') {
      // Use Gofile for software
      uploadResponse = await fileManager.uploadFromBuffer(req.file.buffer, req.file.originalname);
      fileData = {
        url: uploadResponse.downloadPage, // Show download page for software
        gofileId: uploadResponse.id,
        type: fileType,
        originalName: uploadResponse.name || req.file.originalname,
        size: uploadResponse.size || req.file.size,
        mimetype: uploadResponse.mimetype || req.file.mimetype,
        hash: uploadResponse.md5,
        createTime: uploadResponse.createTime,
      };
      post.gofileLinks.push(fileData);
    } else if (fileType === 'screenshot' || fileType === 'video') {
      // Use Cloudinary for images and videos
      const resourceType = fileType === 'video' ? 'video' : 'image';
      uploadResponse = await fileManager.uploadToCloudinary(req.file.buffer, req.file.originalname, resourceType);
      fileData = {
        url: uploadResponse.secure_url,
        cloudinaryId: uploadResponse.public_id,
        type: fileType,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      };
      // No gofileLinks for Cloudinary uploads
    } else {
      return res.status(400).json({ message: 'Invalid file type' });
    }

    if (fileType === 'screenshot') {
      post.screenshots.push(fileData.url);
    } else if (fileType === 'video') {
      post.videos.push(fileData.url);
    }
    // For 'software' type, it's already in gofileLinks

    await post.save();

    res.json({
      message: `File uploaded successfully to ${fileType === 'software' ? 'Gofile.io' : 'Cloudinary'} and linked to post`,
      file: fileData,
      post
    });
  } catch (error) {
    logger.error('File upload error:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Upload multiple files (admin only) - Modified to link to a post
router.post('/multiple', authenticateToken, isAdmin, upload.array('files', 10), async (req, res) => { // Increased limit to 10 files
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const { postId, fileType } = req.body; // Expect postId and fileType (screenshot, video)

    if (!postId || !fileType) {
      return res.status(400).json({ message: 'postId and fileType are required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const uploadedFilesData = [];
    for (const file of req.files) {
      const gofileResponse = await fileManager.uploadFromBuffer(file.buffer, file.originalname);

      const fileData = {
        url: gofileResponse.downloadPage,
        gofileId: gofileResponse.id,
        type: fileType,
        originalName: gofileResponse.name || file.originalname,
        size: gofileResponse.size || file.size,
        mimetype: gofileResponse.mimetype || file.mimetype,
        hash: gofileResponse.md5,
        createTime: gofileResponse.createTime,
      };
      uploadedFilesData.push(fileData);
      post.gofileLinks.push(fileData);

      if (fileType === 'screenshot') {
        post.screenshots.push(gofileResponse.downloadPage);
      } else if (fileType === 'video') {
        post.videos.push(gofileResponse.downloadPage);
      }
    }

    await post.save();

    res.json({
      message: 'Files uploaded successfully to Gofile.io and linked to post',
      files: uploadedFilesData,
      post
    });
  } catch (error) {
    logger.error('Multiple file upload error:', error);
    res.status(500).json({ message: 'Error uploading files' });
  }
});

// Delete file from Gofile.io and from Post (admin only)
router.delete('/:postId/:gofileId', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { postId, gofileId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Find the file in gofileLinks
    const fileIndex = post.gofileLinks.findIndex(link => link.gofileId === gofileId);
    if (fileIndex === -1) {
      return res.status(404).json({ message: 'File not found in post' });
    }

    const fileToDelete = post.gofileLinks[fileIndex];

    // Delete from Gofile.io
    await fileManager.deleteContent(gofileId);

    // Remove from post's gofileLinks
    post.gofileLinks.splice(fileIndex, 1);

    // Also remove from screenshots or videos arrays if applicable
    if (fileToDelete.type === 'screenshot') {
      post.screenshots = post.screenshots.filter(url => url !== fileToDelete.url);
    } else if (fileToDelete.type === 'video') {
      post.videos = post.videos.filter(url => url !== fileToDelete.url);
    }

    await post.save();

    res.json({ message: 'File deleted successfully from Gofile.io and post', post });
  } catch (error) {
    logger.error('Delete file error:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 500MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Maximum is 10 files.' });
    }
  }
  
  if (error.message === 'File type not allowed') {
    return res.status(400).json({ message: 'File type not allowed' });
  }

  res.status(500).json({ message: 'Upload error occurred' });
});

// Upload avatar (authenticated users) - now accepts URL from frontend
router.post('/avatar', authenticateToken, async (req, res) => {
  try {
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({ message: 'Avatar URL is required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.avatar = avatarUrl;
    await user.save();

    res.json({
      message: 'Avatar updated successfully',
      avatarUrl: user.avatar
    });
  } catch (error) {
    logger.error('Avatar update error:', error);
    res.status(500).json({ message: 'Error updating avatar' });
  }
});

// Get Gofile token for frontend uploads
router.get('/gofile-token', authenticateToken, (req, res) => {
  const token = process.env.GOFILE_ACCOUNT_TOKEN;
  if (!token) {
    return res.status(500).json({ message: 'Gofile token not configured' });
  }
  res.json({ token });
});

// Get Cloudinary config for frontend uploads
router.get('/cloudinary-config', authenticateToken, (req, res) => {
  const config = {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
  };
  if (!config.cloudName || !config.uploadPreset) {
    return res.status(500).json({ message: 'Cloudinary not configured' });
  }
  res.json(config);
});

module.exports = router;
