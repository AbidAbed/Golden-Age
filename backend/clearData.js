const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Request = require('./models/Request');
require('dotenv').config();

async function clearDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear all collections
    await User.deleteMany({});
    await Post.deleteMany({});
    await Request.deleteMany({});
    
    console.log('✅ Database cleared successfully!');
    console.log('All posts, users, and requests have been removed.');

  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

clearDatabase();