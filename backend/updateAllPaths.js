const mongoose = require('mongoose');
const Post = require('./models/Post');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/golden-age').then(async () => {
  try {
    console.log('🔧 UPDATING MEDIA PATHS...');
    
    const posts = await Post.find({});
    
    for (let post of posts) {
      console.log(`\n📝 Updating post: ${post.title}`);
      console.log(`Before - Screenshots: ${JSON.stringify(post.screenshots)}`);
      console.log(`Before - VideoUrl: ${post.videoUrl}`);
      console.log(`Before - PreviewImage: ${post.previewImage}`);
      
      // Update paths to match organized backend structure
      post.screenshots = ['/uploads/screenshots/MASSDESTRUCTION-1762808719053-863907785.jpg'];
      post.videoUrl = '/uploads/videos/2025-11-07 19-40-10-1762808719786-405579626.mp4';
      post.previewImage = '/uploads/screenshots/MASSDESTRUCTION-1762808719053-863907785.jpg';
      
      await post.save();
      
      console.log(`After - Screenshots: ${JSON.stringify(post.screenshots)}`);
      console.log(`After - VideoUrl: ${post.videoUrl}`);
      console.log(`After - PreviewImage: ${post.previewImage}`);
      console.log('✅ Updated successfully!');
    }
    
    console.log('\n🎉 ALL POSTS UPDATED!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
});
