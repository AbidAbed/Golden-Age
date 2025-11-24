const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['software', 'game', 'tool', 'plugin', 'other']
  },
  tags: [{
    type: String,
    trim: true
  }],
  gofileLinks: [{
    url: {
      type: String,
      required: true
    },
    gofileId: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['software', 'screenshot', 'video', 'other'],
      required: true
    },
    originalName: {
      type: String
    },
    size: {
      type: Number
    },
    mimetype: {
      type: String
    },
    hash: {
      type: String
    },
    createTime: {
      type: Number
    },
    gofileDirectLink: {
      type: String
    }
  }],
  screenshots: [{
    type: String // Store direct Gofile.io download links or preview links
  }],
  videos: [{
    type: String // Store direct Gofile.io download links or preview links
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  version: {
    type: String,
    default: '1.0'
  },
  requirements: {
    type: String,
    default: ''
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Create text index for search functionality
postSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Post', postSchema);
