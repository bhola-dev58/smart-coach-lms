import mongoose from 'mongoose';

// ============================================
// 👤 USER SCHEMA
// Stores students, instructors, and admins
// ============================================
const userSchema = new mongoose.Schema(
  {
    // ── Basic Info ──
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, select: false }, // Never returned in queries by default
    phone: { type: String, default: '', trim: true },
    avatar: { type: String, default: '' },

    // ── Role & Auth ──
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student',
    },
    provider: {
      type: String,
      enum: ['credentials', 'google'],
      default: 'credentials',
    },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },

    // ── Student-specific fields ──
    college: { type: String, default: '', trim: true },
    branch: { type: String, default: '', trim: true },
    year: { type: Number, min: 1, max: 4 },
    enrolledCourses: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    ],

    // ── Instructor-specific fields ──
    bio: { type: String, default: '', maxlength: 500 },
    specialization: [{ type: String }],
    socialLinks: {
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
      website: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

// ── Indexes for fast queries ──
userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 });

export default mongoose.models.User || mongoose.model('User', userSchema);
