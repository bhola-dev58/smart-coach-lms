import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String, default: '' },
  razorpaySignature: { type: String, default: '' },
  method: { type: String, enum: ['upi', 'card', 'netbanking', 'wallet', 'emi', 'other'], default: 'other' },
  status: { type: String, enum: ['created', 'authorized', 'captured', 'refunded', 'failed'], default: 'created' },
  refundAmount: { type: Number, default: 0 },
  refundReason: { type: String, default: '' },
  receipt: { type: String, default: '' },
  notes: { type: Map, of: String },
}, { timestamps: true });

paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ student: 1 });

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
