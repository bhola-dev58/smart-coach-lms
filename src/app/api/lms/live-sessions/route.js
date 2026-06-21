import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import LiveSession from '@/models/LiveSession';

// GET: Fetch live sessions visible to the current user
// ALL sessions are visible to ALL logged-in users (students, instructors, admins)
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
    // Admins and students see ALL sessions

    const sessions = await LiveSession.find(filter)
      .sort({ scheduledAt: 1 })
      .limit(30)
      .lean();

    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error('Live sessions GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
