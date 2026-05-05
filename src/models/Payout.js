import mongoose from 'mongoose';

// ============================================
// 💸 PAYOUT SCHEMA
// Tracks automated instructor revenue splits
// ============================================
const payoutSchema = new mongoose.Schema(
  {
    // ── References ──
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── Period ──
    periodStart: { type: Date, required: true },  // Month start
    periodEnd: { type: Date, required: true },     // Month end
    periodLabel: { type: String, required: true },  // e.g. "April 2026"

    // ── Revenue Breakdown ──
    totalRevenue: { type: Number, default: 0 },         // Total course sales for this instructor
    platformCommission: { type: Number, default: 0 },   // 20% platform cut
    instructorEarnings: { type: Number, default: 0 },    // 80% instructor share
    taxDeducted: { type: Number, default: 0 },           // TDS or GST if applicable

    // ── Courses Breakdown ──
    courseBreakdown: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        courseName: { type: String },
        enrollments: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 },
        instructorShare: { type: Number, default: 0 },
      },
    ],

    // ── Payout Status ──
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },

    // ── Razorpay Transfer Details ──
    razorpayTransferId: { type: String, default: '' },
    razorpayFundAccountId: { type: String, default: '' },

    // ── Invoice ──
    invoiceUrl: { type: String, default: '' },    // Cloudinary URL
    invoiceNumber: { type: String, default: '' },

    // ── Meta ──
    processedAt: { type: Date },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// ── Indexes ──
payoutSchema.index({ instructor: 1, periodLabel: 1 }, { unique: true });
payoutSchema.index({ status: 1 });
payoutSchema.index({ periodStart: -1 });

export default mongoose.models.Payout ||
  mongoose.model('Payout', payoutSchema);
