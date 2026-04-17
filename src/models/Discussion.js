import mongoose from 'mongoose';

// ============================================
// 💬 DISCUSSION / Q&A SCHEMA
// Thread-based Q&A linked to a course + lesson
// ============================================

const replySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userRole: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
    message: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
);

const discussionSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    lessonSlug: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userRole: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
    question: { type: String, required: true, maxlength: 2000 },
    videoTimestamp: { type: Number, default: null }, // seconds into the video
    replies: [replySchema],
    isResolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for fast queries
discussionSchema.index({ course: 1, lessonSlug: 1, createdAt: -1 });

export default mongoose.models.Discussion || mongoose.model('Discussion', discussionSchema);
