const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define MONGODB_URI in .env.local');
  process.exit(1);
}

// Inline model definition to avoid ESM/CommonJS issues in scratch script
const courseSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true },
  description: String,
  shortDescription: String,
  thumbnail: String,
  instructor: mongoose.Schema.Types.ObjectId,
  category: String,
  level: String,
  price: Number,
  originalPrice: Number,
  totalHours: Number,
  totalLessons: Number,
  isPublished: { type: Boolean, default: true },
  rating: Number,
  totalStudents: Number
});

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a dummy instructor
    let instructor = await User.findOne({ role: 'instructor' });
    if (!instructor) {
      instructor = await User.create({
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh@meetme.center',
        role: 'instructor'
      });
      console.log('Created dummy instructor');
    }

    const courses = [
      { 
        title: 'Data Structures & Algorithms', 
        slug: 'dsa-masterclass',
        description: 'Master arrays, linked lists, trees, graphs, sorting, and dynamic programming with hands-on coding practice.', 
        shortDescription: 'Master DSA for interviews',
        totalHours: 120, 
        totalStudents: 2400, 
        rating: 4.8, 
        price: 4999, 
        originalPrice: 9999, 
        category: 'CSE', 
        level: 'Intermediate', 
        thumbnail: '/images/courses/dsa.jpg',
        instructor: instructor._id,
        isPublished: true
      },
      { 
        title: 'Full Stack Web Development', 
        slug: 'full-stack-web',
        description: 'Build modern web apps with HTML, CSS, JavaScript, React, Node.js, MongoDB and deploy to production.', 
        shortDescription: 'Build modern web apps',
        totalHours: 180, 
        totalStudents: 3100, 
        rating: 4.9, 
        price: 6999, 
        originalPrice: 14999, 
        category: 'CSE', 
        level: 'Beginner', 
        thumbnail: '/images/courses/webdev.jpg',
        instructor: instructor._id,
        isPublished: true
      },
      { 
        title: 'Machine Learning & AI', 
        slug: 'ml-ai-course',
        description: 'Learn neural networks, NLP, computer vision with Python & TensorFlow through real-world industry projects.', 
        shortDescription: 'Learn AI and ML',
        totalHours: 150, 
        totalStudents: 1800, 
        rating: 4.7, 
        price: 7499, 
        originalPrice: 15999, 
        category: 'AI/ML', 
        level: 'Advanced', 
        thumbnail: '/images/courses/ml.jpg',
        instructor: instructor._id,
        isPublished: true
      }
    ];

    await Course.deleteMany({ slug: { $in: courses.map(c => c.slug) } });
    await Course.insertMany(courses);
    console.log('Courses seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
