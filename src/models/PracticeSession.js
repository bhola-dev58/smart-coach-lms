import mongoose from 'mongoose';

// ============================================
// 📈 PRACTICE SESSION SCHEMA
// Stores results of a student's practice run, tracking telemetry & violations
// ============================================
const movementSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const practiceSessionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    timeTakenSeconds: {
      type: Number,
      required: true,
    },
    violationsCount: {
      type: Number,
      default: 0,
    },
    movements: [movementSchema], // Telemetry trace of tab switching, exiting fullscreen, option selections
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ── Indexes ──
practiceSessionSchema.index({ student: 1, completedAt: -1 });
practiceSessionSchema.index({ subject: 1, class: 1, difficulty: 1 });

export default mongoose.models.PracticeSession ||
  mongoose.model('PracticeSession', practiceSessionSchema);
