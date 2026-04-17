import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import '@/models/Course'; // Register for populate

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const enrollments = await Enrollment.find({
      student: session.user.id,
      status: { $in: ['active', 'completed'] },
    })
      .populate('course', 'title slug thumbnail category totalHours')
      .sort({ 'progress.lastAccessedAt': -1 })
      .limit(10)
      .lean();

    return NextResponse.json({ success: true, enrollments });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
