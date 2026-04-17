import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Discussion from '@/models/Discussion';

// GET: Fetch all discussions for a course + lesson
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const lessonSlug = searchParams.get('lessonSlug');

    if (!courseId || !lessonSlug) {
      return NextResponse.json({ success: false, error: 'courseId and lessonSlug required' }, { status: 400 });
    }

    const discussions = await Discussion.find({ course: courseId, lessonSlug })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, discussions });
  } catch (error) {
    console.error('Discussions GET Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch discussions' }, { status: 500 });
  }
}

// POST: Create a new question OR add a reply
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { courseId, lessonSlug, question, videoTimestamp, discussionId, replyMessage } = body;

    // ── Adding a Reply to existing discussion ──
    if (discussionId && replyMessage) {
      const discussion = await Discussion.findById(discussionId);
      if (!discussion) {
        return NextResponse.json({ success: false, error: 'Discussion not found' }, { status: 404 });
      }

      discussion.replies.push({
        user: session.user.id,
        userName: session.user.name || session.user.email,
        userRole: session.user.role || 'student',
        message: replyMessage,
      });

      await discussion.save();

      return NextResponse.json({ success: true, discussion });
    }

    // ── Creating a New Question ──
    if (!courseId || !lessonSlug || !question) {
      return NextResponse.json({ success: false, error: 'courseId, lessonSlug, and question are required' }, { status: 400 });
    }

    const newDiscussion = await Discussion.create({
      course: courseId,
      lessonSlug,
      user: session.user.id,
      userName: session.user.name || session.user.email,
      userRole: session.user.role || 'student',
      question,
      videoTimestamp: videoTimestamp || null,
    });

    return NextResponse.json({ success: true, discussion: newDiscussion }, { status: 201 });
  } catch (error) {
    console.error('Discussions POST Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save discussion' }, { status: 500 });
  }
}
