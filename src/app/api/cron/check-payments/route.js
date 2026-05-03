import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Payment from '@/models/Payment';
import User from '@/models/User';
import { dispatchJob } from '@/lib/queue';

// ============================================
// 💳 PAYMENT & ACCESS CONTROL CRON JOB
// Checks for expired enrollments or failed
// subscription payments and gracefully revokes access
// ============================================

export async function GET(request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const now = new Date();
    let expiredCount = 0;
    let remindersSent = 0;

    // ── 1. Check for expired enrollments ──
    const expiredEnrollments = await Enrollment.find({
      status: 'active',
      expiresAt: { $exists: true, $ne: null, $lte: now },
    }).populate('student', 'name email').populate('course', 'title');

    for (const enrollment of expiredEnrollments) {
      // Mark as expired
      enrollment.status = 'expired';
      await enrollment.save();
      expiredCount++;

      // Send expiry notification email
      if (enrollment.student?.email) {
        await dispatchJob('/api/jobs/send-email', {
          to: enrollment.student.email,
          subject: `⚠️ Your access to "${enrollment.course?.title}" has expired`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #e74c3c;">Access Expired</h2>
              <p>Hi ${enrollment.student.name},</p>
              <p>Your access to <strong>"${enrollment.course?.title}"</strong> has expired.</p>
              <p>To continue learning, please renew your subscription or contact support.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/lms/courses"
                   style="background: #C8102E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  Renew Access
                </a>
              </div>
              <p style="font-size: 12px; color: #999;">MeetMe Center - Your Learning Partner</p>
            </div>
          `,
        });
      }
    }

    // ── 2. Send reminders for enrollments expiring in 3 days ──
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const expiringEnrollments = await Enrollment.find({
      status: 'active',
      expiresAt: {
        $exists: true,
        $ne: null,
        $gt: now,
        $lte: threeDaysFromNow,
      },
    }).populate('student', 'name email').populate('course', 'title');

    for (const enrollment of expiringEnrollments) {
      if (enrollment.student?.email) {
        const daysLeft = Math.ceil((enrollment.expiresAt - now) / (1000 * 60 * 60 * 24));
        await dispatchJob('/api/jobs/send-email', {
          to: enrollment.student.email,
          subject: `⏰ ${daysLeft} day${daysLeft > 1 ? 's' : ''} left for "${enrollment.course?.title}"`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #f39c12;">⏰ Renewal Reminder</h2>
              <p>Hi ${enrollment.student.name},</p>
              <p>Your access to <strong>"${enrollment.course?.title}"</strong> expires in <strong>${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong>.</p>
              <p>Renew now to keep your progress and continue learning!</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/lms/courses"
                   style="background: #C8102E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  Renew Now
                </a>
              </div>
            </div>
          `,
        });
        remindersSent++;
      }
    }

    // ── 3. Check for failed payments ──
    const failedPayments = await Payment.find({
      status: 'failed',
      createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
    }).populate('student', 'name email').populate('course', 'title');

    for (const payment of failedPayments) {
      if (payment.student?.email) {
        await dispatchJob('/api/jobs/send-email', {
          to: payment.student.email,
          subject: `❌ Payment failed for "${payment.course?.title}"`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #e74c3c;">Payment Failed</h2>
              <p>Hi ${payment.student.name},</p>
              <p>Your payment of ₹${(payment.amount / 100).toLocaleString('en-IN')} for <strong>"${payment.course?.title}"</strong> could not be processed.</p>
              <p>Please try again to complete your enrollment.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/courses"
                   style="background: #C8102E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  Retry Payment
                </a>
              </div>
            </div>
          `,
        });
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        expiredEnrollments: expiredCount,
        remindersSent,
        failedPaymentsNotified: failedPayments.length,
      },
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Payment check cron error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
