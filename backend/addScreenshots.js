const mongoose = require('mongoose');
const Post = require('./models/Post');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/golden-age').then(async () => {
  try {
    console.log('🔧 UPDATING POST WITH SCREENSHOTS...');
    
    // Find the test post
    const post = await Post.findOne({ title: 'test' });
    
    if (post) {
      // Add the screenshot we moved earlier
      post.screenshots = ['/uploads/screenshots/MASSDESTRUCTION-1762808719053-863907785.jpg'];
      post.videoUrl = '/uploads/videos/2025-11-07 19-40-10-1762808719786-405579626.mp4';
      post.previewImage = '/uploads/screenshots/MASSDESTRUCTION-1762808719053-863907785.jpg';
      
      await post.save();
      
      console.log('✅ POST UPDATED SUCCESSFULLY!');
      console.log('Screenshots:', post.screenshots);
      console.log('Video URL:', post.videoUrl);
      console.log('Preview Image:', post.previewImage);
    } else {
      console.log('❌ Test post not found');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
});
