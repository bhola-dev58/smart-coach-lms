import mongoose from 'mongoose';

// ============================================
// ⭐ REVIEW SCHEMA
// Student ratings and reviews for courses
// ============================================
const reviewSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '', trim: true, maxlength: 100 },
    comment: { type: String, default: '', trim: true, maxlength: 1000 },
    isApproved: { type: Boolean, default: true }, // Admin can moderate
    helpfulCount: { type: Number, default: 0 }, // "Was this review helpful?"
  },
  { timestamps: true }
);

// ── One review per student per course ──
reviewSchema.index({ student: 1, course: 1 }, { unique: true });
reviewSchema.index({ course: 1, isApproved: 1 });

reviewSchema.post('save', async function(doc) {
  try {
    const Course = (await import('./Course')).default;
    await Course.syncRatingsCount(doc.course);
  } catch (err) {
    console.error('Review post-save hook error:', err);
  }
});

reviewSchema.post('remove', async function(doc) {
  try {
    const Course = (await import('./Course')).default;
    await Course.syncRatingsCount(doc.course);
  } catch (err) {
    console.error('Review post-remove hook error:', err);
  }
});

reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc && doc.course) {
    try {
      const Course = (await import('./Course')).default;
      await Course.syncRatingsCount(doc.course);
    } catch (err) {
      console.error('Review post-findOneAndDelete hook error:', err);
    }
  }
});

reviewSchema.post('findOneAndUpdate', async function(doc) {
  if (doc && doc.course) {
    try {
      const Course = (await import('./Course')).default;
      await Course.syncRatingsCount(doc.course);
    } catch (err) {
      console.error('Review post-findOneAndUpdate hook error:', err);
    }
  }
});

export default mongoose.models.Review ||
  mongoose.model('Review', reviewSchema);
