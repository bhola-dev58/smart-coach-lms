import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import LiveSession from '@/models/LiveSession';
import Batch from '@/models/Batch';

// GET: Fetch live sessions visible to the current user
// Sessions from the past 24 hours or any future sessions are shown.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const role = session.user.role;

    // 24 hours ago window so recently-started sessions still show
    const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000);

    let filter = {
      scheduledAt: { $gte: windowStart },
      status: { $in: ['scheduled', 'live'] },
    };

    // Instructors only see their own sessions
    if (role === 'instructor') {
      filter.instructor = session.user.id;
    }
    // Students only see sessions matching their batches or unbatched ones, restricted to their enrolled courses
    else if (role === 'student') {
      const Enrollment = (await import('@/models/Enrollment')).default;
      const enrollments = await Enrollment.find({
        student: session.user.id,
        status: { $in: ['active', 'completed'] }
      }).select('course').lean();
      const enrolledCourseIds = enrollments.map(e => e.course);

      filter.course = { $in: enrolledCourseIds };

      const userBatches = await Batch.find({ students: session.user.email, isActive: true }).select('_id').lean();
      const userBatchIds = userBatches.map(b => b._id);
      
      filter.$or = [
        { batch: { $in: userBatchIds } },
        { batch: { $exists: false } },
        { batch: null }
      ];
    }
    // Admins see all sessions

    const sessions = await LiveSession.find(filter)
      .sort({ scheduledAt: 1 })
      .limit(30)
      .lean();

    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error('Live sessions GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
