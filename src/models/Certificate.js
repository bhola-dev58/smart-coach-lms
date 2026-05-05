import mongoose from 'mongoose';

// ============================================
// 🏆 CERTIFICATE SCHEMA
// Stores auto-generated verifiable certificates
// ============================================
const certificateSchema = new mongoose.Schema(
  {
    // ── Unique Verification ID (public-facing) ──
    certId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // ── References ──
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
    },

    // ── Certificate Details ──
    studentName: { type: String, required: true },
    courseName: { type: String, required: true },
    instructorName: { type: String, default: '' },
    completionDate: { type: Date, required: true },
    totalHours: { type: Number, default: 0 },

    // ── File URLs ──
    pdfUrl: { type: String, default: '' },       // Cloudinary PDF URL
    imageUrl: { type: String, default: '' },     // Cloudinary Image preview URL

    // ── Status ──
    status: {
      type: String,
      enum: ['generating', 'generated', 'emailed', 'revoked'],
      default: 'generating',
    },
    emailedAt: { type: Date },
    revokedAt: { type: Date },
    revokeReason: { type: String, default: '' },
  },
  { timestamps: true }
);

// ── Indexes ──
certificateSchema.index({ student: 1, course: 1 }, { unique: true });
certificateSchema.index({ status: 1 });

export default mongoose.models.Certificate ||
  mongoose.model('Certificate', certificateSchema);
