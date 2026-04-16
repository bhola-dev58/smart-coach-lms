import mongoose from 'mongoose';

const liveSessionSchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, default: 60 }, // minutes
    joinUrl: { type: String, default: '' }, // Zoom/WebRTC link
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
    },
  },
  { timestamps: true }
);

export default mongoose.models.LiveSession || mongoose.model('LiveSession', liveSessionSchema);
