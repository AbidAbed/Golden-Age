const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { authenticateToken, isAdmin, optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger'); // Import the logger
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all posts (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const posts = await Post.find(query)
      .populate('uploadedBy', 'username avatar')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    logger.error('Get posts error:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Get public statistics (basic overview for all users)
router.get('/statistics', optionalAuth, async (req, res) => {
  try {
    const User = require('../models/User');
    const Comment = require('../models/Comment');

    // Posts statistics
    const totalPosts = await Post.countDocuments();

    // Download statistics
    const totalDownloads = await Post.aggregate([
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);
    const totalDownloadCount = totalDownloads[0]?.total || 0;

    // Users statistics (only total, not detailed breakdown)
    const totalUsers = await User.countDocuments();

    // Comments statistics
    const totalComments = await Comment.countDocuments();

    // Featured posts (assuming all posts are featured for now)
    const featuredPosts = totalPosts;
    const featuredDownloads = totalDownloadCount;

    res.json({
      totalPosts,
      totalDownloads: totalDownloadCount,
      totalUsers,
      totalComments,
      featuredPosts,
      featuredDownloads: featuredDownloads
    });

  } catch (error) {
    logger.error('Public statistics error:', error);
    res.status(500).json({ message: 'Error retrieving public statistics' });
  }
});

// Get comprehensive admin statistics
router.get('/admin/statistics', authenticateToken, isAdmin, async (req, res) => {
  try {
    const User = require('../models/User');
    const Request = require('../models/Request');

    // Get current date for recent calculations
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Posts statistics
    const totalPosts = await Post.countDocuments();
    const recentPosts = await Post.countDocuments({ 
      createdAt: { $gte: oneWeekAgo } 
    });

    // Users statistics
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: oneWeekAgo } 
    });

    // Requests statistics
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const completedRequests = await Request.countDocuments({ status: 'completed' });
    const recentRequests = await Request.countDocuments({ 
      createdAt: { $gte: oneWeekAgo } 
    });

    // Download statistics
    const totalDownloads = await Post.aggregate([
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);
    const totalDownloadCount = totalDownloads[0]?.total || 0;

    // Ratings statistics
    const totalRatings = await Post.aggregate([
      { $group: { _id: null, total: { $sum: { $size: '$ratings' } } } }
    ]);
    const totalRatingCount = totalRatings[0]?.total || 0;
    
    const averageRatingStats = await Post.aggregate([
      { $match: { 'ratings.0': { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$averageRating' }, count: { $sum: 1 } } }
    ]);
    const overallAverageRating = averageRatingStats[0]?.avg || 0;
    const ratedPostsCount = averageRatingStats[0]?.count || 0;

    // Most popular posts
    const popularPosts = await Post.find()
      .sort({ downloads: -1 })
      .limit(5)
      .select('title downloads category averageRating');

    // Recent posts
    const recentPostsList = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdAt category averageRating');

    // Category distribution
    const categoryStats = await Post.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Monthly growth (last 6 months)
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
    const monthlyStats = await Post.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          posts: { $sum: 1 },
          downloads: { $sum: '$downloads' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      overview: {
        totalPosts,
        recentPosts,
        totalUsers,
        adminUsers,
        regularUsers,
        recentUsers,
        totalRequests,
        pendingRequests,
        completedRequests,
        recentRequests,
        totalDownloads: totalDownloadCount,
        totalRatings: totalRatingCount,
        averageRating: overallAverageRating,
        ratedPosts: ratedPostsCount
      },
      popularPosts,
      recentPosts: recentPostsList,
      categoryStats,
      monthlyGrowth: monthlyStats,
      performance: {
        weeklyGrowth: {
          posts: recentPosts,
          users: recentUsers,
          requests: recentRequests
        }
      }
    });

  } catch (error) {
    logger.error('Statistics error:', error);
    res.status(500).json({ message: 'Error retrieving statistics' });
  }
});

// Get public download statistics by category
router.get('/statistics/downloads', optionalAuth, async (req, res) => {
  try {
    const categoryStats = await Post.aggregate([
      {
        $group: {
          _id: '$category',
          softwareCount: { $sum: 1 },
          totalDownloads: { $sum: '$downloads' },
          averageRating: { $avg: '$rating' } // Assuming 'rating' field exists in Post model
        }
      },
      { $sort: { totalDownloads: -1 } }
    ]);

    res.json({
      success: true,
      byCategory: categoryStats
    });
  } catch (error) {
    logger.error('Public category statistics error:', error);
    res.status(500).json({ message: 'Error retrieving public category statistics' });
  }
});

// Get single post
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('uploadedBy', 'username avatar joinedAt');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    logger.error('Get post error:', error);
    res.status(500).json({ message: 'Error fetching post' });
  }
});

// Create post (admin only)
router.post('/', authenticateToken, [
  body('title')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim()
    .escape(),
  body('description')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters')
    .trim(),
  body('category')
    .isIn(['software', 'game', 'tool', 'plugin', 'other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('version')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Version must be less than 50 characters')
    .trim()
    .escape(),
  body('requirements')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Requirements must be less than 500 characters')
    .trim(),
  body('gofileLinks')
    .optional()
    .isArray()
    .withMessage('Gofile links must be an array'),
  body('screenshots')
    .optional()
    .isArray()
    .withMessage('Screenshots must be an array'),
  body('videos')
    .optional()
    .isArray()
    .withMessage('Videos must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Create post validation failed:', errors.array());
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { title, description, category, tags, version, requirements, gofileLinks, screenshots, videos } = req.body;

    const postData = {
      title,
      description,
      category,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []),
      version,
      requirements,
      uploadedBy: req.user.userId,
      gofileLinks: gofileLinks || [],
      screenshots: screenshots || [],
      videos: videos || []
    };

    const post = new Post(postData);
    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('uploadedBy', 'username avatar');

    res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost
    });
  } catch (error) {
    logger.error('Create post error:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Update post (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, description, category, tags, version, requirements } = req.body;

    // Basic input validation
    if (title && (title.length < 3 || title.length > 200)) {
      return res.status(400).json({ message: 'Title must be between 3 and 200 characters' });
    }
    if (description && (description.length < 10 || description.length > 2000)) {
      return res.status(400).json({ message: 'Description must be between 10 and 2000 characters' });
    }
    const allowedCategories = ['software', 'game', 'tool', 'plugin', 'other'];
    if (category && !allowedCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Validate tags
    if (tags && !Array.isArray(tags) && typeof tags !== 'string') {
      return res.status(400).json({ message: 'Tags must be an array or comma-separated string' });
    }

    const updateData = {
      title,
      description,
      category,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []),
      version,
      requirements
    };

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'username avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    logger.error('Update post error:', error);
    res.status(500).json({ message: 'Error updating post' });
  }
});

// Delete post (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    logger.error('Delete post error:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

// Increment download count
router.post('/:id/download', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ downloads: post.downloads });
  } catch (error) {
    logger.error('Download count error:', error);
    res.status(500).json({ message: 'Error updating download count' });
  }
});

// Rate a post
router.post('/:id/rate', authenticateToken, async (req, res) => {
  try {
    const { rating } = req.body;
    
    // Allow rating to be null/0 to remove rating
    if (rating !== null && rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5 or null to remove' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already rated this post
    const existingRatingIndex = post.ratings.findIndex(r => r.user.toString() === req.user.userId);
    
    if (existingRatingIndex > -1) {
      if (rating === null || rating === 0) {
        // Remove existing rating
        post.ratings.splice(existingRatingIndex, 1);
      } else {
        // Update existing rating
        post.ratings[existingRatingIndex].rating = rating;
      }
    } else {
      if (rating && rating >= 1 && rating <= 5) {
        // Add new rating
        post.ratings.push({
          user: req.user.userId,
          rating: rating
        });
      }
    }

    // Calculate average rating
    const totalRating = post.ratings.reduce((sum, r) => sum + r.rating, 0);
    post.averageRating = post.ratings.length > 0 ? totalRating / post.ratings.length : 0;

    await post.save();

    // Find user's current rating
    const userRatingObj = post.ratings.find(r => r.user.toString() === req.user.userId);

    res.json({
      message: rating ? 'Rating submitted successfully' : 'Rating removed successfully',
      averageRating: post.averageRating,
      totalRatings: post.ratings.length,
      userRating: userRatingObj ? userRatingObj.rating : null
    });
  } catch (error) {
    logger.error('Rating error:', error);
    res.status(500).json({ message: 'Error submitting rating' });
  }
});

// Like a post
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user.userId;
    const userLikedIndex = post.likes.indexOf(userId);
    const userDislikedIndex = post.dislikes.indexOf(userId);

    if (userLikedIndex > -1) {
      // User already liked, remove like
      post.likes.splice(userLikedIndex, 1);
    } else {
      // Add like
      post.likes.push(userId);
      // Remove dislike if exists
      if (userDislikedIndex > -1) {
        post.dislikes.splice(userDislikedIndex, 1);
      }
    }

    await post.save();

    res.json({
      likes: post.likes.length,
      dislikes: post.dislikes.length,
      userLiked: post.likes.includes(userId),
      userDisliked: post.dislikes.includes(userId)
    });
  } catch (error) {
    logger.error('Like post error:', error);
    res.status(500).json({ message: 'Error liking post' });
  }
});

// Dislike a post
router.post('/:id/dislike', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user.userId;
    const userLikedIndex = post.likes.indexOf(userId);
    const userDislikedIndex = post.dislikes.indexOf(userId);

    if (userDislikedIndex > -1) {
      // User already disliked, remove dislike
      post.dislikes.splice(userDislikedIndex, 1);
    } else {
      // Add dislike
      post.dislikes.push(userId);
      // Remove like if exists
      if (userLikedIndex > -1) {
        post.likes.splice(userLikedIndex, 1);
      }
    }

    await post.save();

    res.json({
      likes: post.likes.length,
      dislikes: post.dislikes.length,
      userLiked: post.likes.includes(userId),
      userDisliked: post.dislikes.includes(userId)
    });
  } catch (error) {
    logger.error('Dislike post error:', error);
    res.status(500).json({ message: 'Error disliking post' });
  }
});

// Get ratings for a post
router.get('/:id/ratings', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('ratings.user', 'username');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userRating = req.user ? post.ratings.find(r => r.user._id.toString() === req.user.userId) : null;

    res.json({
      averageRating: post.averageRating,
      totalRatings: post.ratings.length,
      userRating: userRating ? userRating.rating : null,
      ratings: post.ratings.map(r => ({
        user: r.user.username,
        rating: r.rating,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    logger.error('Get ratings error:', error);
    res.status(500).json({ message: 'Error fetching ratings' });
  }
});

// Admin: Get all ratings (for moderation)
router.get('/admin/ratings', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const posts = await Post.find({ 'ratings.0': { $exists: true } })
      .select('title ratings averageRating')
      .populate('ratings.user', 'username')
      .sort({ 'ratings.createdAt': -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const totalPosts = await Post.countDocuments({ 'ratings.0': { $exists: true } });
    
    res.json({
      posts,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    logger.error('Admin get ratings error:', error);
    res.status(500).json({ message: 'Error fetching ratings' });
  }
});

// Get comments for a post (backward compatibility)
// router.get('/:postId/comments', optionalAuth, async (req, res) => {
//   try {
//     const { page = 1, limit = 10 } = req.query;

//     const comments = await Comment.find({
//       post: req.params.postId,
//       parentComment: null // Only get top-level comments
//     })
//       .populate('author', 'username avatar')
//       .populate({
//         path: 'replies',
//         populate: {
//           path: 'author',
//           select: 'username avatar'
//         }
//       })
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     // Get replies for each comment
//     const commentsWithReplies = await Promise.all(
//       comments.map(async (comment) => {
//         const replies = await Comment.find({ parentComment: comment._id })
//           .populate('author', 'username avatar')
//           .sort({ createdAt: 1 });
        
//         return {
//           ...comment.toObject(),
//           replies
//         };
//       })
//     );

//     const total = await Comment.countDocuments({ 
//       post: req.params.postId,
//       parentComment: null 
//     });

//     res.json({
//       comments: commentsWithReplies,
//       totalPages: Math.ceil(total / limit),
//       currentPage: page,
//       total
//     });
//   } catch (error) {
//     logger.error('Get comments error:', error);
//     res.status(500).json({ message: 'Error fetching comments' });
//   }
// });


// Add comment to a post
router.post('/:postId/comments', authenticateToken, [
  body('text')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
    .trim(),
  body('parentCommentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent comment ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Create comment validation failed:', errors.array());
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { postId } = req.params;
    const { text, parentCommentId } = req.body;
    const author = req.user.userId;

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      content: text.trim(),
      author,
      post: postId,
      parentComment: parentCommentId || null
    });

    await comment.save();
    await comment.populate('author', 'username avatar');

    // Update post's updatedAt timestamp
    await Post.findByIdAndUpdate(postId, { updatedAt: new Date() });

    res.status(201).json(comment);
  } catch (error) {
    logger.error('Add comment error:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// Update comment
router.put('/:postId/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment or is admin
    if (comment.author.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    comment.content = text.trim();
    comment.updatedAt = new Date();
    await comment.save();
    await comment.populate('author', 'username avatar');

    res.json(comment);
  } catch (error) {
    logger.error('Update comment error:', error);
    res.status(500).json({ message: 'Error updating comment' });
  }
});

// Delete comment
router.delete('/:postId/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment or is admin
    if (comment.author.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Delete comment and all its replies
    await Comment.deleteMany({
      $or: [
        { _id: commentId },
        { parentComment: commentId }
      ]
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    logger.error('Delete comment error:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
});


module.exports = router;