import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      // Required only for standalone assignments (not lesson-embedded ones which use lessonSlug)
      required: function () { return !this.lessonSlug; },
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    lessonSlug: {
      type: String,
      required: false, // Optional for standalone assignments
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
      enum: ['submitted', 'graded', 'accepted', 'rejected', 'late'],
      default: 'submitted',
    },
  },
  { timestamps: true }
);

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true, partialFilterExpression: { assignment: { $exists: true } } });
submissionSchema.index({ course: 1, lessonSlug: 1, student: 1 }, { unique: true, partialFilterExpression: { lessonSlug: { $exists: true } } });

export default mongoose.models.AssignmentSubmission || mongoose.model('AssignmentSubmission', submissionSchema);
