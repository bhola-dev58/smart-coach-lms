import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  progress: {
    completedLessons: [String],    // lesson slugs
    currentLesson: { type: String, default: '' },
    percentage: { type: Number, default: 0 },
    lastAccessedAt: { type: Date, default: Date.now },
  },
  notes: [{
    lessonSlug: String,
    content: String,
    updatedAt: { type: Date, default: Date.now },
  }],
  quizScores: [{
    lessonSlug: String,
    score: Number,
    maxScore: Number,
    attemptedAt: { type: Date, default: Date.now },
  }],
  certificateIssued: { type: Boolean, default: false },
  certificateUrl: { type: String, default: '' },
  status: { type: String, enum: ['active', 'completed', 'expired', 'refunded'], default: 'active' },
  enrolledAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
}, { timestamps: true });

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);
