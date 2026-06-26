import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    course: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Course', 
      required: true 
    },
    students: [{ 
      type: String, 
      trim: true 
    }], // list of student email addresses assigned to this batch
    isActive: { 
      type: Boolean, 
      default: true 
    },
    // Optional schedule offsets or specific release times for lessons
    schedule: [
      {
        lessonSlug: { type: String, required: true },
        liveAt: { type: Date, required: true }
      }
    ]
  },
  { timestamps: true }
);

// Index to quickly search for batches by student email and course
batchSchema.index({ course: 1, students: 1 });

export default mongoose.models.Batch || mongoose.model('Batch', batchSchema);
