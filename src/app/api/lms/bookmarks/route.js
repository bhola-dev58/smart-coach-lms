import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Enrollment from '@/models/Enrollment';

// ============================================
// 🔖 VIDEO BOOKMARKS API
// CRUD for timestamped video bookmarks
// Stored in Enrollment.notes array
// ============================================

// GET: Fetch bookmarks for a specific lesson
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const lessonSlug = searchParams.get('lessonSlug');

    if (!courseId) {
      return NextResponse.json({ success: false, error: 'courseId required' }, { status: 400 });
    }

    await connectDB();

    const enrollment = await Enrollment.findOne({
      student: session.user.id,
      course: courseId,
    }).lean();

    if (!enrollment) {
      return NextResponse.json({ success: false, error: 'Not enrolled' }, { status: 403 });
    }

    let bookmarks = enrollment.notes || [];

    // Filter by lesson if specified
    if (lessonSlug) {
      bookmarks = bookmarks.filter(b => b.lessonSlug === lessonSlug);
    }

    // Sort by timestamp
    bookmarks.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    return NextResponse.json({ success: true, bookmarks });
  } catch (error) {
    console.error('Bookmarks GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Add a new bookmark
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, lessonSlug, content, timestamp } = await request.json();

    if (!courseId || !lessonSlug || !content) {
      return NextResponse.json({ success: false, error: 'courseId, lessonSlug, and content required' }, { status: 400 });
    }

    await connectDB();

    const enrollment = await Enrollment.findOne({
      student: session.user.id,
      course: courseId,
    });

    if (!enrollment) {
      return NextResponse.json({ success: false, error: 'Not enrolled' }, { status: 403 });
    }

    // Add bookmark to notes array
    enrollment.notes.push({
      lessonSlug,
      content,
      timestamp: timestamp || 0, // video timestamp in seconds
      updatedAt: new Date(),
    });

    await enrollment.save();

    return NextResponse.json({
      success: true,
      bookmark: enrollment.notes[enrollment.notes.length - 1],
    });
  } catch (error) {
    console.error('Bookmarks POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a bookmark
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, noteId } = await request.json();

    if (!courseId || !noteId) {
      return NextResponse.json({ success: false, error: 'courseId and noteId required' }, { status: 400 });
    }

    await connectDB();

    const enrollment = await Enrollment.findOne({
      student: session.user.id,
      course: courseId,
    });

    if (!enrollment) {
      return NextResponse.json({ success: false, error: 'Not enrolled' }, { status: 403 });
    }

    enrollment.notes = enrollment.notes.filter(n => n._id.toString() !== noteId);
    await enrollment.save();

    return NextResponse.json({ success: true, message: 'Bookmark deleted' });
  } catch (error) {
    console.error('Bookmarks DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
