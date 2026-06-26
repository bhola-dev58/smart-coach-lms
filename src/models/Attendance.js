import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    lessonSlug: {
      type: String,
      required: true
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch'
    },
    present: {
      type: Boolean,
      default: true
    },
    durationMinutes: {
      type: Number,
      default: 0
    },
    lastPingAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Compound index to quickly find attendance by student, course, and lesson
attendanceSchema.index({ student: 1, course: 1, lessonSlug: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
