import mongoose from 'mongoose';

// ============================================
// 📢 NOTIFICATION SCHEMA
// In-app notifications for students and admins
// ============================================
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'enrollment',     // "You enrolled in DSA Course"
        'payment',        // "Payment ₹4999 received"
        'course_update',  // "New lesson added to your course"
        'certificate',    // "Your certificate is ready"
        'announcement',   // General admin announcement
        'reminder',       // "Complete your course, 80% done!"
        'system',         // System-level notifications
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    link: { type: String, default: '' }, // e.g., /lms/courses/dsa-masterclass
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },

    // ── Optional references ──
    relatedCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    relatedPayment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  },
  { timestamps: true }
);

// ── Indexes ──
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model('Notification', notificationSchema);
