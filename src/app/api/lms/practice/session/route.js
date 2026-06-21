import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import PracticeSession from '@/models/PracticeSession';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      subject,
      class: classValue,
      difficulty,
      score,
      totalQuestions,
      timeTakenSeconds,
      violationsCount,
      movements,
    } = body;

    if (!subject || !classValue || !difficulty || score === undefined || totalQuestions === undefined || timeTakenSeconds === undefined) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const newSession = await PracticeSession.create({
      student: session.user.id,
      subject,
      class: classValue,
      difficulty,
      score,
      totalQuestions,
      timeTakenSeconds,
      violationsCount: violationsCount || 0,
      movements: movements || [],
      completedAt: new Date(),
    });

    return NextResponse.json({ success: true, sessionId: newSession._id });
  } catch (error) {
    console.error('[POST /api/lms/practice/session]', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
