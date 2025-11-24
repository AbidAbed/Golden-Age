const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: '../.env' });
const logger = require('./utils/logger'); // Import the logger

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const requestRoutes = require('./routes/requests');
const uploadRoutes = require('./routes/uploads');

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", process.env.FRONTEND_URL, process.env.BACKEND_URL],
      mediaSrc: ["'self'", process.env.FRONTEND_URL, process.env.BACKEND_URL],
      connectSrc: ["'self'", process.env.FRONTEND_URL, process.env.BACKEND_URL],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// Connect to MongoDB
mongoose.connect('mongodb+srv://MASSDESTRUCTION:vxk8quoX0I0kYwE8@cluster001.yqhek9a.mongodb.net/golden-age')
.then(async () => {
  logger.info('Connected to MongoDB');
  // Drop the problematic email index if it exists
  try {
    await mongoose.connection.db.collection('users').dropIndex('email_1');
    logger.info('Dropped email_1 index');
  } catch (err) {
    logger.info('email_1 index not found or already dropped:', err.message);
  }
})
.catch(err => logger.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
