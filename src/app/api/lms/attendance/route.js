import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Attendance from '@/models/Attendance';
import Batch from '@/models/Batch';

// POST: Record/update student attendance
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, lessonSlug, duration = 1 } = await req.json();
    if (!courseId || !lessonSlug) {
      return NextResponse.json({ success: false, error: 'courseId and lessonSlug required' }, { status: 400 });
    }

    await connectDB();

    // Verify student is actually enrolled in this course
    const Enrollment = (await import('@/models/Enrollment')).default;
    const enrollment = await Enrollment.findOne({
      student: session.user.id,
      course: courseId,
      status: { $in: ['active', 'completed'] }
    }).lean();

    if (!enrollment) {
      return NextResponse.json({ success: false, error: 'Student is not enrolled in this course' }, { status: 403 });
    }

    // Clamp duration to prevent DB value manipulation (1 to 10 minutes)
    const durationNum = Number(duration);
    const clampedDuration = isNaN(durationNum) ? 1 : Math.max(1, Math.min(10, durationNum));

    // Find if the student belongs to a batch for this course
    const batch = await Batch.findOne({
      course: courseId,
      students: session.user.email,
      isActive: true
    }).lean();

    // Upsert attendance record
    const attendance = await Attendance.findOneAndUpdate(
      {
        student: session.user.id,
        course: courseId,
        lessonSlug: lessonSlug
      },
      {
        $setOnInsert: {
          present: true,
          batch: batch ? batch._id : null
        },
        $set: {
          lastPingAt: new Date()
        },
        $inc: {
          durationMinutes: clampedDuration
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({ success: true, attendance });
  } catch (error) {
    console.error('Attendance track API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
