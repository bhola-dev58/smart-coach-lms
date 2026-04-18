import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import AssignmentSubmission from '@/models/AssignmentSubmission';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const lessonSlug = searchParams.get('lessonSlug');

    if (!courseId || !lessonSlug) return NextResponse.json({ success: false, error: 'Missing params' }, { status: 400 });

    await connectDB();
    const submission = await AssignmentSubmission.findOne({ course: courseId, lessonSlug, student: session.user.id });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error('Fetch Assignment Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch assignment' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { courseId, lessonSlug, fileUrl, content } = await req.json();

    if (!courseId || !lessonSlug || !fileUrl) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Upsert student's assignment submission for this specific lesson
    const submission = await AssignmentSubmission.findOneAndUpdate(
      { student: session.user.id, lessonSlug, course: courseId },
      { 
        student: session.user.id,
        lessonSlug,
        course: courseId,
        fileUrl,
        content,
        status: 'submitted',
        $setOnInsert: { marksAwarded: null, feedback: '' }
      },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({ success: true, submission }, { status: 201 });
  } catch (error) {
    console.error('Submit Assignment Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit assignment' }, { status: 500 });
  }
}
