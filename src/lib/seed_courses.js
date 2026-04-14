/**
 * ============================================
 * 🌱 Seed Featured Courses + Instructor into MongoDB
 * Run: node src/lib/seed_courses.js
 * ============================================
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

// Inline schemas (CommonJS) to avoid ESM issues
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    role: String,
    bio: String,
    specialization: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const lessonSchema = new mongoose.Schema({
  title: String,
  slug: String,
  duration: Number,
  videoUrl: String,
  content: String,
  order: Number,
  isFree: { type: Boolean, default: false },
});

const chapterSchema = new mongoose.Schema({
  title: String,
  description: String,
  order: Number,
  lessons: [lessonSchema],
});

const courseSchema = new mongoose.Schema(
  {
    title: String,
    slug: { type: String, unique: true },
    description: String,
    shortDescription: String,
    thumbnail: String,
    previewVideoUrl: String,
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    category: String,
    level: String,
    language: { type: String, default: 'Hindi' },
    price: Number,
    originalPrice: Number,
    isFree: { type: Boolean, default: false },
    totalHours: Number,
    totalLessons: Number,
    chapters: [chapterSchema],
    prerequisites: [String],
    learningOutcomes: [String],
    tags: [String],
    faqs: [{ question: String, answer: String }],
    rating: Number,
    totalRatings: Number,
    totalStudents: Number,
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    publishedAt: Date,
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // ── Create/find instructor ──
    let instructor = await User.findOne({ email: 'rajesh@meetme.center' });
    if (!instructor) {
      instructor = await User.create({
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh@meetme.center',
        role: 'instructor',
        bio: 'IIT Delhi professor with 15+ years of teaching experience in CSE.',
        specialization: ['DSA', 'Web Development', 'Machine Learning'],
      });
      console.log('✅ Created instructor: Dr. Rajesh Kumar');
    } else {
      console.log('⏭️  Instructor already exists: Dr. Rajesh Kumar');
    }

    // ── Create second instructor ──
    let instructor2 = await User.findOne({ email: 'priya@meetme.center' });
    if (!instructor2) {
      instructor2 = await User.create({
        name: 'Prof. Priya Sharma',
        email: 'priya@meetme.center',
        role: 'instructor',
        bio: 'NIT Trichy alumna, GATE AIR 12, 10+ years coaching experience.',
        specialization: ['GATE', 'Mathematics', 'Digital Electronics'],
      });
      console.log('✅ Created instructor: Prof. Priya Sharma');
    } else {
      console.log('⏭️  Instructor already exists: Prof. Priya Sharma');
    }

    // ── Course Data ──
    const coursesData = [
      {
        title: 'Data Structures & Algorithms',
        slug: 'dsa-masterclass',
        description:
          'Master arrays, linked lists, trees, graphs, sorting, and dynamic programming with hands-on coding practice. Build a strong foundation for coding interviews at FAANG companies.',
        shortDescription: 'Master DSA for coding interviews',
        thumbnail: '/images/courses/dsa.jpg',
        instructor: instructor._id,
        category: 'CSE',
        level: 'Intermediate',
        language: 'Hindi',
        price: 4999,
        originalPrice: 9999,
        totalHours: 120,
        totalLessons: 85,
        totalStudents: 2400,
        totalRatings: 380,
        rating: 4.8,
        isPublished: true,
        isFeatured: true, // ← POPULAR
        publishedAt: new Date('2025-06-15'),
        prerequisites: ['Basic C/C++ knowledge', 'Logical thinking'],
        learningOutcomes: [
          'Master all major data structures',
          'Solve 300+ coding problems',
          'Crack FAANG coding interviews',
          'Dynamic programming mastery',
          'Graph algorithms & shortest paths',
          'Time & space complexity analysis',
        ],
        tags: ['DSA', 'Coding', 'Interview', 'C++', 'Competitive Programming'],
        faqs: [
          { question: 'Which language is used?', answer: 'C++ with explanations in Hindi.' },
          { question: 'Is this course for beginners?', answer: 'You should know basics of C/C++. This is Intermediate level.' },
        ],
        chapters: [
          {
            title: 'Arrays & Strings',
            description: 'Foundation of data structures',
            order: 1,
            lessons: [
              { title: 'Introduction to Arrays', slug: 'intro-arrays', duration: 25, order: 1, isFree: true },
              { title: 'Two Pointer Technique', slug: 'two-pointer', duration: 35, order: 2 },
              { title: 'Sliding Window', slug: 'sliding-window', duration: 40, order: 3 },
            ],
          },
          {
            title: 'Linked Lists',
            description: 'Singly, Doubly, and Circular',
            order: 2,
            lessons: [
              { title: 'Singly Linked List', slug: 'singly-ll', duration: 30, order: 1 },
              { title: 'Doubly Linked List', slug: 'doubly-ll', duration: 25, order: 2 },
              { title: 'Reverse a Linked List', slug: 'reverse-ll', duration: 20, order: 3, isFree: true },
            ],
          },
          {
            title: 'Trees & Graphs',
            description: 'Binary Trees, BST, BFS, DFS',
            order: 3,
            lessons: [
              { title: 'Binary Tree Basics', slug: 'binary-tree', duration: 35, order: 1 },
              { title: 'BST Operations', slug: 'bst-ops', duration: 40, order: 2 },
              { title: 'Graph BFS & DFS', slug: 'graph-bfs-dfs', duration: 45, order: 3 },
            ],
          },
        ],
      },
      {
        title: 'Full Stack Web Development',
        slug: 'full-stack-web',
        description:
          'Build modern web apps with HTML, CSS, JavaScript, React, Node.js, MongoDB and deploy to production. A complete bootcamp from zero to deployment.',
        shortDescription: 'Build modern web apps from scratch',
        thumbnail: '/images/courses/webdev.jpg',
        instructor: instructor._id,
        category: 'CSE',
        level: 'Beginner',
        language: 'Hindi',
        price: 6999,
        originalPrice: 14999,
        totalHours: 180,
        totalLessons: 120,
        totalStudents: 3100,
        totalRatings: 520,
        rating: 4.9,
        isPublished: true,
        isFeatured: true, // ← POPULAR
        publishedAt: new Date('2025-03-10'),
        prerequisites: ['No prior experience needed', 'Basic computer skills'],
        learningOutcomes: [
          'Build production-ready web applications',
          'Master React.js & Next.js',
          'Backend development with Node.js',
          'Database design with MongoDB',
          'Deploy apps to cloud platforms',
          'REST API development',
        ],
        tags: ['Web Development', 'React', 'Node.js', 'MongoDB', 'Full Stack'],
        faqs: [
          { question: 'Do I need prior coding experience?', answer: 'No, this course starts from absolute basics.' },
          { question: 'Will I build real projects?', answer: 'Yes, you will build 5+ production-grade projects.' },
        ],
        chapters: [
          {
            title: 'HTML & CSS Fundamentals',
            description: 'Build solid web foundations',
            order: 1,
            lessons: [
              { title: 'HTML Structure', slug: 'html-basics', duration: 30, order: 1, isFree: true },
              { title: 'CSS Styling', slug: 'css-basics', duration: 40, order: 2. },
              { title: 'Responsive Design', slug: 'responsive', duration: 35, order: 3 },
            ],
          },
          {
            title: 'JavaScript Deep Dive',
            description: 'Core JS concepts',
            order: 2,
            lessons: [
              { title: 'Variables & Functions', slug: 'js-fundamentals', duration: 35, order: 1 },
              { title: 'DOM Manipulation', slug: 'dom', duration: 40, order: 2 },
              { title: 'Async/Await & Fetch', slug: 'async-js', duration: 45, order: 3 },
            ],
          },
          {
            title: 'React.js & Next.js',
            description: 'Frontend frameworks',
            order: 3,
            lessons: [
              { title: 'React Components', slug: 'react-components', duration: 40, order: 1 },
              { title: 'State Management', slug: 'state-mgmt', duration: 35, order: 2 },
              { title: 'Next.js App Router', slug: 'nextjs-router', duration: 50, order: 3 },
            ],
          },
        ],
      },
      {
        title: 'Machine Learning & AI',
        slug: 'ml-ai-course',
        description:
          'Learn neural networks, NLP, computer vision with Python & TensorFlow through real-world industry projects. From basics to advanced deep learning.',
        shortDescription: 'Learn AI and ML with Python',
        thumbnail: '/images/courses/ml.jpg',
        instructor: instructor._id,
        category: 'AI/ML',
        level: 'Advanced',
        language: 'Hindi',
        price: 7499,
        originalPrice: 15999,
        totalHours: 150,
        totalLessons: 95,
        totalStudents: 1800,
        totalRatings: 290,
        rating: 4.7,
        isPublished: true,
        isFeatured: true, // ← POPULAR
        publishedAt: new Date('2025-08-20'),
        prerequisites: ['Python basics', 'Basic mathematics (Linear Algebra)'],
        learningOutcomes: [
          'Build ML models from scratch',
          'Neural networks & deep learning',
          'Natural Language Processing (NLP)',
          'Computer Vision with OpenCV',
          'TensorFlow & PyTorch mastery',
          'Real-world AI project deployment',
        ],
        tags: ['Machine Learning', 'AI', 'Python', 'TensorFlow', 'Deep Learning'],
        faqs: [
          { question: 'Do I need GPU for this course?', answer: 'We use Google Colab with free GPU access.' },
          { question: 'Is math knowledge required?', answer: 'Basic linear algebra helps, but we explain math as we go.' },
        ],
        chapters: [
          {
            title: 'Python for ML',
            description: 'Python essentials for machine learning',
            order: 1,
            lessons: [
              { title: 'NumPy & Pandas', slug: 'numpy-pandas', duration: 35, order: 1, isFree: true },
              { title: 'Data Visualization', slug: 'data-viz', duration: 30, order: 2 },
              { title: 'Feature Engineering', slug: 'feature-eng', duration: 40, order: 3 },
            ],
          },
          {
            title: 'Supervised Learning',
            description: 'Regression and Classification',
            order: 2,
            lessons: [
              { title: 'Linear Regression', slug: 'linear-reg', duration: 40, order: 1 },
              { title: 'Decision Trees & Random Forests', slug: 'trees-forests', duration: 45, order: 2 },
              { title: 'SVM & KNN', slug: 'svm-knn', duration: 35, order: 3 },
            ],
          },
        ],
      },
      {
        title: 'GATE CSE Preparation',
        slug: 'gate-cse-prep',
        description:
          'Complete GATE CSE preparation with mock tests, subject-wise video lectures, previous year solutions, and rank prediction. Designed by GATE toppers.',
        shortDescription: 'Complete GATE CSE preparation',
        thumbnail: '/images/courses/gate.jpg',
        instructor: instructor2._id,
        category: 'GATE',
        level: 'All Levels',
        language: 'Hindi',
        price: 9999,
        originalPrice: 19999,
        totalHours: 300,
        totalLessons: 200,
        totalStudents: 4500,
        totalRatings: 780,
        rating: 4.9,
        isPublished: true,
        isFeatured: true, // ← POPULAR
        publishedAt: new Date('2025-01-05'),
        prerequisites: ['B.Tech CSE 2nd year or above'],
        learningOutcomes: [
          'Cover entire GATE CSE syllabus',
          'Solve 2000+ previous year questions',
          'Mock test series with analysis',
          'Subject-wise strategy planning',
          'Rank prediction & preparation tips',
          'Interview preparation for PSUs & IITs',
        ],
        tags: ['GATE', 'CSE', 'Competitive Exams', 'IIT', 'PSU'],
        faqs: [
          { question: 'When should I start preparing?', answer: 'Ideally from 3rd year, but this course works for final year too.' },
          { question: 'Are mock tests included?', answer: 'Yes, 30+ full-length mock tests with detailed solutions.' },
        ],
        chapters: [
          {
            title: 'Data Structures',
            description: 'GATE level DS',
            order: 1,
            lessons: [
              { title: 'Arrays & Linked Lists (GATE Level)', slug: 'gate-arrays-ll', duration: 50, order: 1, isFree: true },
              { title: 'Stacks, Queues & Hashing', slug: 'gate-stacks-queues', duration: 45, order: 2 },
              { title: 'Trees & Graphs (GATE)', slug: 'gate-trees-graphs', duration: 55, order: 3 },
            ],
          },
          {
            title: 'Operating Systems',
            description: 'Process management, Memory, Scheduling',
            order: 2,
            lessons: [
              { title: 'Process & Threads', slug: 'os-process', duration: 40, order: 1 },
              { title: 'CPU Scheduling', slug: 'os-scheduling', duration: 45, order: 2 },
              { title: 'Memory Management', slug: 'os-memory', duration: 50, order: 3 },
            ],
          },
        ],
      },
      {
        title: 'Digital Electronics & Logic Design',
        slug: 'digital-electronics',
        description:
          'Learn digital circuits, combinational and sequential logic, flip-flops, counters, and microprocessor basics. Essential for ECE and CSE students.',
        shortDescription: 'Master digital circuits and logic design',
        thumbnail: '/images/courses/digital.jpg',
        instructor: instructor2._id,
        category: 'ECE',
        level: 'Beginner',
        language: 'Hindi',
        price: 3499,
        originalPrice: 7999,
        totalHours: 80,
        totalLessons: 55,
        totalStudents: 950,
        totalRatings: 140,
        rating: 4.5,
        isPublished: true,
        isFeatured: false, // ← NOT on homepage
        publishedAt: new Date('2025-09-01'),
        prerequisites: ['Basic physics knowledge'],
        learningOutcomes: [
          'Understand number systems & boolean algebra',
          'Design combinational circuits',
          'Sequential circuit design',
          'Microprocessor architecture basics',
        ],
        tags: ['ECE', 'Digital Electronics', 'Logic Design', 'Microprocessor'],
        chapters: [
          {
            title: 'Number Systems',
            description: 'Binary, Octal, Hexadecimal',
            order: 1,
            lessons: [
              { title: 'Binary Number System', slug: 'binary-system', duration: 25, order: 1, isFree: true },
              { title: 'Base Conversions', slug: 'base-conversions', duration: 30, order: 2 },
            ],
          },
        ],
      },
      {
        title: 'Engineering Mathematics',
        slug: 'engineering-maths',
        description:
          'Complete engineering mathematics covering Calculus, Linear Algebra, Probability, Differential Equations. Essential for GATE and semester exams.',
        shortDescription: 'Complete B.Tech mathematics course',
        thumbnail: '/images/courses/maths.jpg',
        instructor: instructor2._id,
        category: 'MATHS',
        level: 'All Levels',
        language: 'Hindi',
        price: 2999,
        originalPrice: 6999,
        totalHours: 100,
        totalLessons: 70,
        totalStudents: 1200,
        totalRatings: 200,
        rating: 4.6,
        isPublished: true,
        isFeatured: false, // ← NOT on homepage
        publishedAt: new Date('2025-11-15'),
        prerequisites: ['12th class mathematics'],
        learningOutcomes: [
          'Calculus: Limits, derivatives, integrals',
          'Linear Algebra: Matrices, eigenvalues',
          'Probability & Statistics',
          'Differential Equations',
        ],
        tags: ['Mathematics', 'GATE', 'Calculus', 'Linear Algebra'],
        chapters: [
          {
            title: 'Calculus',
            description: 'Limits and Continuity',
            order: 1,
            lessons: [
              { title: 'Limits & Continuity', slug: 'limits', duration: 35, order: 1, isFree: true },
              { title: 'Differentiation', slug: 'differentiation', duration: 40, order: 2 },
            ],
          },
        ],
      },
    ];

    // ── Upsert courses (update if exists, create if not) ──
    let created = 0;
    let updated = 0;

    for (const courseData of coursesData) {
      const existing = await Course.findOne({ slug: courseData.slug });
      if (existing) {
        await Course.updateOne({ slug: courseData.slug }, { $set: courseData });
        console.log(`🔄 Updated: ${courseData.title}`);
        updated++;
      } else {
        await Course.create(courseData);
        console.log(`✅ Created: ${courseData.title}`);
        created++;
      }
    }

    console.log(`\n─────────────────────────────────────`);
    console.log(`🎉 Seed complete! Created: ${created} | Updated: ${updated} | Total: ${coursesData.length}`);

    // ── Verify featured courses ──
    const featured = await Course.countDocuments({ isFeatured: true, isPublished: true });
    const total = await Course.countDocuments({ isPublished: true });
    console.log(`⭐ Featured (for homepage): ${featured}`);
    console.log(`📚 Total published courses: ${total}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seed();
