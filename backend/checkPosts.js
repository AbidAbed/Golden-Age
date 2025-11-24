const mongoose = require('mongoose');
const Post = require('./models/Post');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/golden-age').then(async () => {
  try {
    const posts = await Post.find({});
    console.log('📊 POSTS IN DATABASE:');
    console.log('═══════════════════════════════════════');
    
    posts.forEach((post, index) => {
      console.log(`\n🎯 POST ${index + 1}:`);
      console.log(`Title: ${post.title}`);
      console.log(`Description: ${post.description}`);
      console.log(`Category: ${post.category}`);
      console.log(`Download URL: ${post.downloadUrl}`);
      console.log(`Screenshots: ${JSON.stringify(post.screenshots)}`);
      console.log(`Video URL: ${post.videoUrl}`);
      console.log(`Preview Image: ${post.previewImage}`);
      console.log(`File Size: ${post.fileSize}`);
      console.log(`─────────────────────────────────────`);
    });
    
    console.log(`\n📈 TOTAL: ${posts.length} posts found`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
});
