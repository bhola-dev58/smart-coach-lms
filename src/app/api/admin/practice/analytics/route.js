import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import PracticeSession from '@/models/PracticeSession';
import '@/models/User'; // Ensure User is loaded for population

async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return { error: 'Unauthorized Access' };
  }
  return { session };
}

export async function GET() {
  try {
    const auth = await checkAdminAuth();
    if (auth.error) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    await connectDB();

    // 1. Fetch practice session history (last 200 records)
    const sessions = await PracticeSession.find({})
      .populate('student', 'name email')
      .sort({ completedAt: -1 })
      .limit(200)
      .lean();

    // 2. Perform aggregations
    // Total runs
    const totalSessions = await PracticeSession.countDocuments();

    // Average Score, Total Violations
    const aggregations = await PracticeSession.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$score' },
          totalViolations: { $sum: '$violationsCount' },
        },
      },
    ]);

    const avgScore = aggregations[0]?.avgScore || 0;
    const totalViolations = aggregations[0]?.totalViolations || 0;

    // Breakdown by Subject
    const subjectBreakdown = await PracticeSession.aggregate([
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 },
          avgScore: { $avg: '$score' },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      sessions,
      summary: {
        totalSessions,
        avgScore: Math.round(avgScore * 100) / 100,
        totalViolations,
        subjectBreakdown,
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/practice/analytics]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
