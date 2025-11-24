const mongoose = require('mongoose');
const Post = require('./models/Post');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/golden-age').then(async () => {
  try {
    console.log('🔧 UPDATING POST WITH MEDIA FILES...');
    
    const post = await Post.findOne({ title: 'test' });
    
    if (post) {
      console.log('Found post:', post.title);
      console.log('Current screenshots:', post.screenshots);
      console.log('Current videoUrl:', post.videoUrl);
      console.log('Current downloadUrl:', post.downloadUrl);
      
      // Update with proper paths
      post.screenshots = ['/uploads/screenshots/MASSDESTRUCTION-1762808719053-863907785.jpg'];
      post.videoUrl = '/uploads/videos/2025-11-07 19-40-10-1762808719786-405579626.mp4';
      post.previewImage = '/uploads/screenshots/MASSDESTRUCTION-1762808719053-863907785.jpg';
      
      await post.save();
      
      console.log('✅ POST UPDATED!');
      console.log('New screenshots:', post.screenshots);
      console.log('New videoUrl:', post.videoUrl);
      console.log('New previewImage:', post.previewImage);
    } else {
      console.log('❌ Test post not found');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
});
