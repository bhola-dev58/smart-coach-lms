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
          durationMinutes: duration
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({ success: true, attendance });
  } catch (error) {
    console.error('Attendance track API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
