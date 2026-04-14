import mongoose from 'mongoose';

// ============================================
// 💳 PAYMENT SCHEMA
// Tracks all Razorpay transactions
// ============================================
const paymentSchema = new mongoose.Schema(
  {
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

    // ── Amount ──
    amount: { type: Number, required: true }, // Amount in paise (₹499 = 49900)
    currency: { type: String, default: 'INR' },
    discountApplied: { type: Number, default: 0 }, // Discount in paise
    couponCode: { type: String, default: '' },

    // ── Razorpay Details ──
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },

    // ── Payment Info ──
    method: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'wallet', 'emi', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
      default: 'created',
    },

    // ── Refund ──
    refundAmount: { type: Number, default: 0 },
    refundReason: { type: String, default: '' },
    refundedAt: { type: Date },

    // ── Meta ──
    receipt: { type: String, default: '' },
    notes: { type: Map, of: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

// ── Indexes ──
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ student: 1 });
paymentSchema.index({ status: 1 });

export default mongoose.models.Payment ||
  mongoose.model('Payment', paymentSchema);
