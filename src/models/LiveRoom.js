import mongoose from 'mongoose';

// ============================================
// 🎥 LIVE ROOM SCHEMA (WebRTC Live Classes)
// Manages live classroom sessions with
// peer-to-peer video communication
// ============================================
const liveRoomSchema = new mongoose.Schema(
  {
    // ── Basic Info ──
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    roomCode: { type: String, required: true, unique: true },  // Shareable join code

    // ── References ──
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },

    // ── Room Config ──
    maxParticipants: { type: Number, default: 100 },
    isRecording: { type: Boolean, default: false },
    allowChat: { type: Boolean, default: true },
    allowScreenShare: { type: Boolean, default: true },
    allowStudentVideo: { type: Boolean, default: false },
    allowStudentAudio: { type: Boolean, default: true },

    // ── Participants ──
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String },
        role: { type: String, enum: ['host', 'co-host', 'student'], default: 'student' },
        joinedAt: { type: Date, default: Date.now },
        leftAt: { type: Date },
      },
    ],

    // ── Chat Messages ──
    messages: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: { type: String },
        message: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // ── Schedule ──
    scheduledAt: { type: Date },
    startedAt: { type: Date },
    endedAt: { type: Date },

    // ── Recording ──
    recordingUrl: { type: String, default: '' },

    // ── Status ──
    status: {
      type: String,
      enum: ['scheduled', 'live', 'ended', 'cancelled'],
      default: 'scheduled',
    },
  },
  { timestamps: true }
);

// ── Indexes ──
liveRoomSchema.index({ host: 1 });
liveRoomSchema.index({ status: 1 });
liveRoomSchema.index({ scheduledAt: -1 });

export default mongoose.models.LiveRoom ||
  mongoose.model('LiveRoom', liveRoomSchema);
