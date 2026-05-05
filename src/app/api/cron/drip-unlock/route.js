import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';

// ============================================
// 🔓 DRIP CONTENT CRON JOB
// Automatically unlocks chapters based on
// enrollment date + chapter drip schedule
// Called by Vercel Cron or external scheduler
// ============================================

export async function GET(request) {
  try {
    // Optional: Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find all active enrollments
    const enrollments = await Enrollment.find({ status: 'active' })
      .populate({
        path: 'course',
        select: 'chapters title',
      })
      .lean();

    let unlocked = 0;
    const now = new Date();

    for (const enrollment of enrollments) {
      if (!enrollment.course?.chapters) continue;

      const enrolledDate = new Date(enrollment.enrolledAt);

      for (const chapter of enrollment.course.chapters) {
        // Check if chapter has a drip schedule
        const dripDays = chapter.dripDays || 0; // Days after enrollment to unlock
        const dripDate = chapter.dripDate; // Specific calendar date to unlock

        if (dripDays === 0 && !dripDate) continue; // No drip, always available

        let unlockDate;
        if (dripDate) {
          unlockDate = new Date(dripDate);
        } else {
          unlockDate = new Date(enrolledDate.getTime() + dripDays * 24 * 60 * 60 * 1000);
        }

        // If unlock date has passed and chapter isn't already tracked as unlocked
        if (now >= unlockDate) {
          unlocked++;
          // Chapter is now accessible — the frontend checks this dynamically
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Drip content check completed. ${unlocked} chapters eligible for unlock.`,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Drip unlock cron error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
