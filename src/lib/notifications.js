// ============================================================
// 🔔 NOTIFICATION SERVICE — src/lib/notifications.js
// Single source of truth for creating in-app notifications.
// ============================================================
import { connectDB } from '@/lib/db';
import Notification from '@/models/Notification';

/**
 * Create an in-app notification for one or more recipients.
 *
 * @param {string|string[]} recipientIds - User ObjectId(s)
 * @param {'enrollment'|'payment'|'course_update'|'certificate'|'announcement'|'reminder'|'system'|'new_course'|'login'|'otp_verified'|'assignment_submitted'|'assignment_graded'} type
 * @param {string} title
 * @param {string} message
 * @param {string} [link] - e.g. /lms/course/dsa-masterclass
 * @param {object} [extras] - { relatedCourse, relatedPayment }
 */
export async function createNotification(recipientIds, type, title, message, link = '', extras = {}) {
  try {
    await connectDB();
    const ids = Array.isArray(recipientIds) ? recipientIds : [recipientIds];

    const docs = ids.map(id => ({
      recipient: id,
      type,
      title,
      message,
      link,
      isRead: false,
      ...(extras.relatedCourse ? { relatedCourse: extras.relatedCourse } : {}),
      ...(extras.relatedPayment ? { relatedPayment: extras.relatedPayment } : {}),
    }));

    // insertMany is faster for bulk creates
    if (docs.length === 1) {
      await Notification.create(docs[0]);
    } else {
      await Notification.insertMany(docs, { ordered: false });
    }
  } catch (err) {
    // Never throw — notifications failing must not crash the main flow
    console.error('[Notification Service] Error creating notification:', err.message);
  }
}

/**
 * Get unread notification count for a user.
 */
export async function getUnreadCount(userId) {
  try {
    await connectDB();
    return await Notification.countDocuments({ recipient: userId, isRead: false });
  } catch {
    return 0;
  }
}
