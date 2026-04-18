import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    lessonSlug: {
      type: String,
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    marksAwarded: { type: Number, default: null },
    feedback: { type: String, default: '' },
    status: {
      type: String,
      enum: ['submitted', 'graded', 'late'],
      default: 'submitted',
    },
  },
  { timestamps: true }
);

submissionSchema.index({ course: 1, lessonSlug: 1, student: 1 }, { unique: true });

export default mongoose.models.AssignmentSubmission || mongoose.model('AssignmentSubmission', submissionSchema);
