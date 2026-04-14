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

export default mongoose.models.Review ||
  mongoose.model('Review', reviewSchema);
