import mongoose from 'mongoose';

// ============================================
// 🎟️ COUPON SCHEMA
// Discount codes for course enrollment
// ============================================
const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, default: '' },

    // ── Discount ──
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: { type: Number, required: true }, // e.g., 20 for 20% or 500 for ₹500
    maxDiscountAmount: { type: Number, default: 0 }, // cap for percentage discounts
    minPurchaseAmount: { type: Number, default: 0 }, // min cart value to apply

    // ── Applicability ──
    applicableCourses: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    ], // empty = all courses
    applicableCategories: [{ type: String }], // e.g., ['CSE', 'AI/ML']

    // ── Usage Limits ──
    maxUsageCount: { type: Number, default: 0 }, // 0 = unlimited
    currentUsageCount: { type: Number, default: 0 },
    maxUsagePerUser: { type: Number, default: 1 },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // ── Validity ──
    startsAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ── Indexes ──
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, expiresAt: 1 });

export default mongoose.models.Coupon ||
  mongoose.model('Coupon', couponSchema);
