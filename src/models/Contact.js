import mongoose from 'mongoose';

// ============================================
// 📞 CONTACT SCHEMA
// Stores contact form submissions from website visitors
// ============================================
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '', trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },

    // ── Admin Management ──
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'closed'],
      default: 'new',
    },
    adminReply: { type: String, default: '' },
    repliedAt: { type: Date },
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ── Indexes ──
contactSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Contact ||
  mongoose.model('Contact', contactSchema);
