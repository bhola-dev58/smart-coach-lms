import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ['PDF', 'ZIP', 'DOC', 'IMAGE'], default: 'PDF' },
    size: { type: String, default: 'Unknown' }, // e.g., '2.4 MB'
  },
  { timestamps: true }
);

export default mongoose.models.StudyMaterial || mongoose.model('StudyMaterial', materialSchema);
