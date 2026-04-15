/**
 * ============================================
 * 🌱 Seed Demo Enrollment for testing the Course Player
 * Run: node src/lib/seed_enrollment.js
 * ============================================
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

// Inline schemas (CommonJS)
const userSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true }, role: String }, { timestamps: true });
const lessonSchema = new mongoose.Schema({ title: String, slug: String, duration: Number, videoUrl: String, content: String, order: Number, isFree: Boolean });
const chapterSchema = new mongoose.Schema({ title: String, order: Number, lessons: [lessonSchema] });
const courseSchema = new mongoose.Schema({ title: String, slug: { type: String, unique: true }, chapters: [chapterSchema] }, { timestamps: true });

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  progress: {
    completedLessons: [String],
    currentLesson: { type: String, default: '' },
    percentage: { type: Number, default: 0 },
    lastAccessedAt: { type: Date, default: Date.now },
    totalWatchTimeMin: { type: Number, default: 0 },
  },
  status: { type: String, default: 'active' },
  enrolledAt: { type: Date, default: Date.now },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // Find the student user (created by seed_users.js)
    const student = await User.findOne({ email: 'student@meetme.center' });
    if (!student) {
      console.error('❌ Student user not found. Run seed_users.js first.');
      process.exit(1);
    }
    console.log(`📋 Student: ${student.name} (${student.email})`);

    // Fetch all published courses
    const courses = await Course.find({}).lean();
    if (courses.length === 0) {
      console.error('❌ No courses found. Run seed_courses.js first.');
      process.exit(1);
    }

    let enrolled = 0;
    for (const course of courses) {
      // Check if already enrolled
      const exists = await Enrollment.findOne({ student: student._id, course: course._id });
      if (exists) {
        console.log(`⏭️  Already enrolled: ${course.title}`);
        continue;
      }

      // Get first lesson slug for currentLesson
      let firstLessonSlug = '';
      if (course.chapters?.length > 0 && course.chapters[0].lessons?.length > 0) {
        firstLessonSlug = course.chapters[0].lessons[0].slug || '';
      }

      await Enrollment.create({
        student: student._id,
        course: course._id,
        progress: {
          completedLessons: [],
          currentLesson: firstLessonSlug,
          percentage: 0,
          lastAccessedAt: new Date(),
          totalWatchTimeMin: 0,
        },
        status: 'active',
        enrolledAt: new Date(),
      });

      console.log(`✅ Enrolled in: ${course.title}`);
      enrolled++;
    }

    console.log(`\n─────────────────────────────────────`);
    console.log(`🎉 Enrollment seed complete! ${enrolled} new enrollment(s) created.`);
    console.log(`📌 Login as student@meetme.center / password123 to test.`);

  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
