/**
 * ============================================
 * 🔄 Recalculate and Sync All Course Stats
 * Run: node src/lib/sync_all_courses.js
 * ============================================
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

// Minimal schemas for CommonJS execution
const enrollmentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  status: String
});

const reviewSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  rating: Number,
  isApproved: Boolean
});

const courseSchema = new mongoose.Schema({
  title: String,
  totalStudents: Number,
  rating: Number,
  totalRatings: Number
});

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

async function run() {
  let exitCode = 0;
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses to sync.\n`);

    for (const course of courses) {
      // 1. Calculate students count
      const totalStudents = await Enrollment.countDocuments({
        course: course._id,
        status: { $in: ['active', 'completed'] }
      });

      // 2. Calculate reviews count and average rating
      const reviews = await Review.find({ course: course._id, isApproved: true });
      const totalRatings = reviews.length;
      const rating = totalRatings > 0
        ? parseFloat((reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / totalRatings).toFixed(1))
        : 0;

      // Update course document
      await Course.findByIdAndUpdate(course._id, {
        totalStudents,
        rating,
        totalRatings
      });

      console.log(`✨ Synced: "${course.title}"`);
      console.log(`   - Students: ${totalStudents}`);
      console.log(`   - Rating: ${rating} (${totalRatings} ratings)`);
    }

    console.log('\n🎉 Recalculation complete!');
  } catch (err) {
    console.error('❌ Sync failed:', err);
    exitCode = 1;
  } finally {
    await mongoose.disconnect();
    process.exit(exitCode);
  }
}

run();
