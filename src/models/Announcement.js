import mongoose from 'mongoose';

// ============================================
// 📊 ANNOUNCEMENT SCHEMA
// Admin announcements shown on dashboard/banner
// ============================================
const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true }, // HTML or Markdown
    type: {
      type: String,
      enum: ['info', 'warning', 'success', 'urgent'],
      default: 'info',
    },
    targetAudience: {
      type: String,
      enum: ['all', 'students', 'instructors'],
      default: 'all',
    },
    targetCourses: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    ], // empty = shown to all

    // ── Display Settings ──
    showAsBanner: { type: Boolean, default: false }, // show as top banner on site
    isActive: { type: Boolean, default: true },
    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },

    // ── Author ──
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// ── Indexes ──
announcementSchema.index({ isActive: 1, startsAt: -1 });
announcementSchema.index({ targetAudience: 1, isActive: 1 });

export default mongoose.models.Announcement ||
  mongoose.model('Announcement', announcementSchema);
