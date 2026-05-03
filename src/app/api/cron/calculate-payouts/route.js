import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Payment from '@/models/Payment';
import Course from '@/models/Course';
import User from '@/models/User';
import Payout from '@/models/Payout';
import { dispatchJob } from '@/lib/queue';

// ============================================
// 💸 AUTOMATED INSTRUCTOR PAYOUT CALCULATOR
// Monthly cron job that:
// 1. Calculates revenue per instructor
// 2. Splits 80/20 (instructor/platform)
// 3. Creates payout records
// 4. Sends payout summary email
// ============================================

const INSTRUCTOR_SHARE = 0.80; // 80% to instructor
const PLATFORM_SHARE = 0.20;    // 20% to platform

export async function GET(request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Calculate period (previous month)
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const periodLabel = periodStart.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    // Get all captured payments for the period
    const payments = await Payment.find({
      status: 'captured',
      paidAt: { $gte: periodStart, $lte: periodEnd },
    }).populate({
      path: 'course',
      select: 'title instructor',
      populate: { path: 'instructor', select: 'name email payoutInfo' },
    });

    // Group by instructor
    const instructorMap = {};

    for (const payment of payments) {
      if (!payment.course?.instructor) continue;

      const instructorId = payment.course.instructor._id.toString();

      if (!instructorMap[instructorId]) {
        instructorMap[instructorId] = {
          instructor: payment.course.instructor,
          totalRevenue: 0,
          courses: {},
        };
      }

      instructorMap[instructorId].totalRevenue += payment.amount;

      const courseId = payment.course._id.toString();
      if (!instructorMap[instructorId].courses[courseId]) {
        instructorMap[instructorId].courses[courseId] = {
          course: payment.course._id,
          courseName: payment.course.title,
          enrollments: 0,
          revenue: 0,
        };
      }
      instructorMap[instructorId].courses[courseId].enrollments += 1;
      instructorMap[instructorId].courses[courseId].revenue += payment.amount;
    }

    // Create payout records
    const payouts = [];
    for (const [instructorId, data] of Object.entries(instructorMap)) {
      // Check if payout already exists for this period
      const existing = await Payout.findOne({
        instructor: instructorId,
        periodLabel,
      });

      if (existing) {
        payouts.push({ instructorId, status: 'already_exists', periodLabel });
        continue;
      }

      const instructorEarnings = Math.round(data.totalRevenue * INSTRUCTOR_SHARE);
      const platformCommission = Math.round(data.totalRevenue * PLATFORM_SHARE);

      const courseBreakdown = Object.values(data.courses).map(c => ({
        ...c,
        instructorShare: Math.round(c.revenue * INSTRUCTOR_SHARE),
      }));

      // Generate invoice number
      const invoiceNumber = `INV-${periodStart.getFullYear()}${String(periodStart.getMonth() + 1).padStart(2, '0')}-${instructorId.slice(-6).toUpperCase()}`;

      const payout = await Payout.create({
        instructor: instructorId,
        periodStart,
        periodEnd,
        periodLabel,
        totalRevenue: data.totalRevenue,
        platformCommission,
        instructorEarnings,
        courseBreakdown,
        invoiceNumber,
        status: 'pending',
      });

      payouts.push({
        instructorId,
        instructorName: data.instructor.name,
        totalRevenue: `₹${(data.totalRevenue / 100).toLocaleString('en-IN')}`,
        instructorEarnings: `₹${(instructorEarnings / 100).toLocaleString('en-IN')}`,
        status: 'created',
      });

      // Send payout notification email
      if (data.instructor.email) {
        await dispatchJob('/api/jobs/send-email', {
          to: data.instructor.email,
          subject: `💰 Payout Summary for ${periodLabel} - MeetMe Center`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #27ae60;">💰 Payout Summary</h2>
              <p>Hi ${data.instructor.name},</p>
              <p>Here's your earnings summary for <strong>${periodLabel}</strong>:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background: #f8f9fa;">
                  <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: 600;">Total Revenue</td>
                  <td style="padding: 12px; border: 1px solid #dee2e6;">₹${(data.totalRevenue / 100).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: 600;">Platform Fee (20%)</td>
                  <td style="padding: 12px; border: 1px solid #dee2e6;">₹${(platformCommission / 100).toLocaleString('en-IN')}</td>
                </tr>
                <tr style="background: #d4edda;">
                  <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: 700; color: #27ae60;">Your Earnings (80%)</td>
                  <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: 700; color: #27ae60;">₹${(instructorEarnings / 100).toLocaleString('en-IN')}</td>
                </tr>
              </table>
              <p>Invoice No: <strong>${invoiceNumber}</strong></p>
              <p style="font-size: 12px; color: #999;">Payouts are processed within 7 business days.</p>
            </div>
          `,
        });
      }
    }

    return NextResponse.json({
      success: true,
      period: periodLabel,
      totalInstructors: Object.keys(instructorMap).length,
      payouts,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Payout calculation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
