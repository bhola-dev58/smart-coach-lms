import mongoose from 'mongoose';

// ============================================
// 🎓 ENROLLMENT SCHEMA
// Links a student to a course with progress tracking
// ============================================
const enrollmentSchema = new mongoose.Schema(
  {
    // ── References ──
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
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },

    // ── Progress Tracking ──
    progress: {
      completedLessons: [{ type: String }], // lesson slugs that are done
      currentLesson: { type: String, default: '' },
      percentage: { type: Number, default: 0, min: 0, max: 100 },
      lastAccessedAt: { type: Date, default: Date.now },
      totalWatchTimeMin: { type: Number, default: 0 }, // total minutes watched
    },

    // ── Student Notes per Lesson ──
    notes: [
      {
        lessonSlug: { type: String, required: true },
        content: { type: String, default: '' },
        updatedAt: { type: Date, default: Date.now },
      },
    ],

    // ── Quiz Scores ──
    quizScores: [
      {
        lessonSlug: { type: String, required: true },
        score: { type: Number, required: true },
        maxScore: { type: Number, required: true },
        attemptedAt: { type: Date, default: Date.now },
      },
    ],

    // ── Certificate ──
    certificateIssued: { type: Boolean, default: false },
    certificateUrl: { type: String, default: '' },
    certificateIssuedAt: { type: Date },

    // ── Status ──
    status: {
      type: String,
      enum: ['active', 'completed', 'expired', 'refunded'],
      default: 'active',
    },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    expiresAt: { type: Date }, // optional: course access validity
  },
  { timestamps: true }
);

// ── Indexes ──
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true }); // one enrollment per student-course
enrollmentSchema.index({ student: 1, status: 1 });
enrollmentSchema.index({ course: 1 });

export default mongoose.models.Enrollment ||
  mongoose.model('Enrollment', enrollmentSchema);
