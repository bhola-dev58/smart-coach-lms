import mongoose from 'mongoose';

// ============================================
// 🎯 PRACTICE QUESTION SCHEMA
// Stores practice questions for subject/class/difficulty selection
// ============================================
const practiceQuestionSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      enum: ['MATHS', 'SCIENCE', 'COMMERCE', 'ARTS', 'GENERAL'],
      required: true,
    },
    class: {
      type: String,
      enum: ['6', '7', '8', '9', '10', '11', '12', 'All'],
      default: 'All',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    optionA: {
      type: String,
      required: true,
      trim: true,
    },
    optionB: {
      type: String,
      required: true,
      trim: true,
    },
    optionC: {
      type: String,
      required: true,
      trim: true,
    },
    optionD: {
      type: String,
      required: true,
      trim: true,
    },
    correctOptionIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ── Indexes ──
practiceQuestionSchema.index({ subject: 1, class: 1, difficulty: 1, isActive: 1 });
practiceQuestionSchema.index({ createdBy: 1 });

export default mongoose.models.PracticeQuestion ||
  mongoose.model('PracticeQuestion', practiceQuestionSchema);
