const express = require('express');
const Request = require('../models/Request');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const logger = require('../utils/logger'); // Import the logger
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all requests (admin can see all, users see only their own)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category,
      priority 
    } = req.query;

    let query = {};
    
    // If not admin, only show user's own requests
    if (req.user.role !== 'admin') {
      query.requestedBy = req.user.userId;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    const requests = await Request.find(query)
      .populate('requestedBy', 'username avatar')
      .populate('assignedTo', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Request.countDocuments(query);

    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    logger.error('Get requests error:', error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// Get single request
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('requestedBy', 'username avatar joinedAt')
      .populate('assignedTo', 'username avatar');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Users can only see their own requests unless they're admin
    if (req.user.role !== 'admin' && request.requestedBy._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(request);
  } catch (error) {
    logger.error('Get request error:', error);
    res.status(500).json({ message: 'Error fetching request' });
  }
});

// Create request (authenticated users)
router.post('/', authenticateToken, [
  body('title')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim()
    .escape(),
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .trim(),
  body('category')
    .isIn(['software', 'game', 'tool', 'plugin', 'other'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Create request validation failed:', errors.array());
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    // Prevent admins from creating requests
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Administrators cannot create software requests' });
    }

    const { title, description, category, priority } = req.body;

    const requestData = {
      title,
      description,
      category,
      priority: priority || 'medium',
      requestedBy: req.user.userId
    };

    const request = new Request(requestData);
    await request.save();

    const populatedRequest = await Request.findById(request._id)
      .populate('requestedBy', 'username avatar');

    res.status(201).json({
      message: 'Request created successfully',
      request: populatedRequest
    });
  } catch (error) {
    logger.error('Create request error:', error);
    res.status(500).json({ message: 'Error creating request' });
  }
});

// Update request status (admin only)
router.put('/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status, adminNotes, assignedTo } = req.body;

    // Basic input validation for status update
    const allowedStatuses = ['pending', 'in-progress', 'completed', 'rejected'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided' });
    }
    if (adminNotes && adminNotes.length > 1000) {
      return res.status(400).json({ message: 'Admin notes too long' });
    }

    const updateData = { status };
    
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }
    
    if (assignedTo !== undefined) {
      // Validate assignedTo is a valid user ID if provided
      // For simplicity, we'll assume it's valid for now or let Mongoose handle it
      updateData.assignedTo = assignedTo;
    }
    
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('requestedBy', 'username avatar')
      .populate('assignedTo', 'username avatar');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({
      message: 'Request updated successfully',
      request
    });
  } catch (error) {
    logger.error('Update request status error:', error);
    res.status(500).json({ message: 'Error updating request' });
  }
});

// Vote on request (authenticated users)
router.post('/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { type } = req.body; // 'up' or 'down'
    
    // Basic input validation
    if (!type || !['up', 'down'].includes(type)) {
      return res.status(400).json({ message: 'Invalid vote type. Must be "up" or "down".' });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const userId = req.user.userId;
    const existingVoteIndex = request.votes.findIndex(
      vote => vote.user.toString() === userId
    );

    if (existingVoteIndex > -1) {
      // Update existing vote or remove if same type
      if (request.votes[existingVoteIndex].type === type) {
        request.votes.splice(existingVoteIndex, 1);
      } else {
        request.votes[existingVoteIndex].type = type;
      }
    } else {
      // Add new vote
      request.votes.push({ user: userId, type });
    }

    await request.save();

    const upVotes = request.votes.filter(vote => vote.type === 'up').length;
    const downVotes = request.votes.filter(vote => vote.type === 'down').length;
    const userVote = request.votes.find(vote => vote.user.toString() === userId);

    res.json({
      upVotes,
      downVotes,
      userVote: userVote ? userVote.type : null
    });
  } catch (error) {
    logger.error('Vote request error:', error);
    res.status(500).json({ message: 'Error voting on request' });
  }
});

// Delete request (admin or request owner)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only admin or request owner can delete
    if (req.user.role !== 'admin' && request.requestedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this request' });
    }

    await Request.findByIdAndDelete(req.params.id);

    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    logger.error('Delete request error:', error);
    res.status(500).json({ message: 'Error deleting request' });
  }
});

// Get request statistics (admin only)
router.get('/stats/overview', authenticateToken, isAdmin, async (req, res) => {
  try {
    const stats = await Request.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Request.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Request.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      statusStats: stats,
      categoryStats,
      priorityStats
    });
  } catch (error) {
    logger.error('Get request stats error:', error);
    res.status(500).json({ message: 'Error fetching request statistics' });
  }
});

module.exports = router;
