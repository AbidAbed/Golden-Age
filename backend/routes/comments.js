const express = require('express');
const Comment = require('../models/Comment');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Get comments for a specific post
router.get('/post/:postId', optionalAuth, async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({
      post: postId,
      parentComment: null // Only get top-level comments
    })
    .populate('author', 'username avatar')
    .sort({ createdAt: 1 })
    .exec();

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          parentComment: comment._id
        })
        .populate('author', 'username avatar')
        .sort({ createdAt: 1 })
        .exec();

        return {
          ...comment.toObject(),
          replies
        };
      })
    );

    res.json({
      comments: commentsWithReplies
    });
  } catch (error) {
    logger.error('Get comments error:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

module.exports = router;
