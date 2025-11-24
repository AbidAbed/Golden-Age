const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');
const Request = require('./models/Request');
const speakeasy = require('speakeasy');
require('dotenv').config();

const sampleSoftware = [
  {
    title: "Adobe Photoshop 2024",
    description: "Professional image editing and design software with AI-powered features. Create stunning graphics, photos, and artwork with industry-leading tools.",
    category: "software",
    downloadUrl: "#photoshop-2024",
    previewImage: "https://via.placeholder.com/400x250/1a1a1a/ffd700?text=Photoshop+2024",
    tags: ["photo-editing", "design", "adobe", "graphics"],
    fileSize: "2.1 GB",
    version: "25.0.0",
    requirements: "Windows 10/11 64-bit, 8GB RAM, 4GB free space"
  },
  {
    title: "Microsoft Office 2024",
    description: "Complete productivity suite including Word, Excel, PowerPoint, and Outlook. Enhanced collaboration features and cloud integration.",
    category: "software",
    downloadUrl: "#office-2024",
    previewImage: "https://via.placeholder.com/400x250/1a1a1a/ffd700?text=Office+2024",
    tags: ["office", "productivity", "microsoft", "word", "excel"],
    fileSize: "3.5 GB",
    version: "16.80.0",
    requirements: "Windows 10/11, 4GB RAM, 4GB free space"
  },
  {
    title: "Visual Studio Code",
    description: "Lightweight but powerful source code editor with built-in support for JavaScript, TypeScript, and Node.js debugging.",
    category: "tool",
    downloadUrl: "#vscode",
    previewImage: "https://via.placeholder.com/400x250/1a1a1a/ffd700?text=VS+Code",
    tags: ["code-editor", "development", "microsoft", "programming"],
    fileSize: "85 MB",
    version: "1.85.0",
    requirements: "Windows 10/11, 1GB RAM, 200MB free space"
  },
  {
    title: "OBS Studio",
    description: "Free and open-source software for video recording and live streaming. Perfect for content creators and streamers.",
    category: "tool",
    downloadUrl: "#obs-studio",
    previewImage: "https://via.placeholder.com/400x250/1a1a1a/ffd700?text=OBS+Studio",
    tags: ["streaming", "recording", "obs", "multimedia"],
    fileSize: "320 MB",
    version: "30.0.2",
    requirements: "Windows 10/11, 4GB RAM, DirectX 10.1"
  },
  {
    title: "Blender 3D",
    description: "Open-source 3D creation suite supporting modeling, rigging, animation, simulation, rendering, and video editing.",
    category: "software",
    downloadUrl: "#blender",
    previewImage: "https://via.placeholder.com/400x250/1a1a1a/ffd700?text=Blender+3D",
    tags: ["3d-modeling", "animation", "blender", "graphics"],
    fileSize: "290 MB",
    version: "4.0.0",
    requirements: "Windows 10/11 64-bit, 8GB RAM, OpenGL 3.3"
  },
  {
    title: "Steam",
    description: "Digital distribution platform for PC gaming. Access thousands of games, connect with friends, and join gaming communities.",
    category: "game",
    downloadUrl: "#steam",
    previewImage: "https://via.placeholder.com/400x250/1a1a1a/ffd700?text=Steam",
    tags: ["gaming", "steam", "valve", "platform"],
    fileSize: "1.5 MB",
    version: "Latest",
    requirements: "Windows 10/11, 512MB RAM, 1GB free space"
  }
];

const sampleRequests = [
  {
    title: "Adobe After Effects 2024",
    description: "Need the latest version of After Effects for motion graphics and visual effects work.",
    category: "software",
    priority: "high",
    reason: "Required for professional video editing projects"
  },
  {
    title: "AutoCAD 2024",
    description: "CAD software for architectural and engineering drawings.",
    category: "software",
    priority: "medium",
    reason: "Needed for technical drawings and blueprints"
  },
  {
    title: "FL Studio Producer Edition",
    description: "Digital audio workstation for music production.",
    category: "software",
    priority: "low",
    reason: "Music production and beat making"
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://MASSDESTRUCTION:vxk8quoX0I0kYwE8@cluster001.yqhek9a.mongodb.net/golden-age');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Request.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminSecret = speakeasy.generateSecret({
      length: 20,
      name: `GoldenAge (admin)`,
      issuer: 'GoldenAge'
    });
    const adminUser = new User({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      avatar: 'https://via.placeholder.com/150/ffd700/000000?text=Admin',
      totpSecret: adminSecret.base32
    });
    await adminUser.save();
    console.log('Created admin user with TOTP secret:', adminSecret.base32);

    // Create regular test user
    const hashedUserPassword = await bcrypt.hash('user123', 10);
    const userSecret = speakeasy.generateSecret({
      length: 20,
      name: `GoldenAge (testuser)`,
      issuer: 'GoldenAge'
    });
    const testUser = new User({
      username: 'testuser',
      password: hashedUserPassword,
      role: 'user',
      avatar: 'https://via.placeholder.com/150/daa520/000000?text=User',
      totpSecret: userSecret.base32
    });
    await testUser.save();
    console.log('Created test user with TOTP secret:', userSecret.base32);

    // Create sample software posts
    const posts = [];
    for (const software of sampleSoftware) {
      const post = new Post({
        ...software,
        author: adminUser._id,
        downloadCount: Math.floor(Math.random() * 1000) + 100,
        averageRating: (Math.random() * 2 + 3), // 3.0 - 5.0
        comments: []
      });
      await post.save();
      posts.push(post);
    }
    console.log(`Created ${posts.length} software posts`);

    // Create sample requests
    for (const requestData of sampleRequests) {
      const request = new Request({
        ...requestData,
        requestedBy: testUser._id,
        status: ['pending', 'in-progress', 'completed', 'rejected'][Math.floor(Math.random() * 4)]
      });
      await request.save();
    }
    console.log(`Created ${sampleRequests.length} sample requests`);

    // Add some sample comments
    const comments = [
      "Great software! Works perfectly on my system.",
      "Installation was smooth, highly recommend!",
      "Excellent quality and fast download speed.",
      "This saved me so much money, thank you!",
      "Perfect for my workflow, amazing features."
    ];

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const numComments = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < numComments; j++) {
        post.comments.push({
          author: Math.random() > 0.5 ? adminUser._id : testUser._id,
          text: comments[Math.floor(Math.random() * comments.length)],
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days
        });
      }
      await post.save();
    }
    console.log('Added sample comments to posts');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('👑 Admin: username: admin, password: admin123');
    console.log('👤 User: username: testuser, password: user123');
    console.log('\nFeatures available:');
    console.log('✅ 6 sample software posts with ratings and comments');
    console.log('✅ 3 sample user requests (various statuses)');
    console.log('✅ Admin dashboard with full CRUD operations');
    console.log('✅ User request system');
    console.log('✅ Download tracking and statistics');
    console.log('✅ Rating and comment system');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedDatabase();