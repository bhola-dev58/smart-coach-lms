import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import LiveSession from '@/models/LiveSession';

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

    // ── Instructors: only see their own sessions ──
    if (role === 'instructor') {
      filter.instructor = session.user.id;

    // ── Students: see sessions for ALL courses they are enrolled in ──
    } else if (role === 'student') {
      const Enrollment = (await import('@/models/Enrollment')).default;
      const Batch = (await import('@/models/Batch')).default;

      // 1. Get all active/completed enrollments for this student
      const enrollments = await Enrollment.find({
        student: session.user.id,
        status: { $in: ['active', 'completed'] },
      }).select('course batch').lean();

      if (enrollments.length === 0) {
        // Student has no enrollments — return empty
        return NextResponse.json({ success: true, sessions: [] });
      }

      const enrolledCourseIds = enrollments.map(e => e.course);

      // 2. Get all batches this student belongs to (by email)
      const userBatches = await Batch.find({
        students: session.user.email,
        isActive: true,
      }).select('_id').lean();
      const userBatchIds = userBatches.map(b => b._id.toString());

      // 3. Also get batch IDs directly from their enrollment records
      const enrollmentBatchIds = enrollments
        .filter(e => e.batch)
        .map(e => e.batch.toString());

      // Merge both batch ID sources
      const allUserBatchIds = [...new Set([...userBatchIds, ...enrollmentBatchIds])];

      // 4. Build filter:
      //    - Course must be one the student is enrolled in
      //    - Batch condition (soft): show if:
      //        a) session has no batch (open to all enrolled students), OR
      //        b) session batch matches one of the student's batches
      filter.course = { $in: enrolledCourseIds };
      filter.$or = [
        { batch: { $exists: false } },
        { batch: null },
        { batch: { $in: allUserBatchIds } },
      ];
    }
    // ── Admins: see all sessions (no extra filter) ──

    const sessions = await LiveSession.find(filter)
      .sort({ scheduledAt: 1 })
      .limit(50)
      .lean();

    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error('Live sessions GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
