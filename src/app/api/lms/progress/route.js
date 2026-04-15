import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { courseId, lessonSlug, action } = await req.json();

    if (!courseId || !lessonSlug) {
      return NextResponse.json({ success: false, error: 'courseId and lessonSlug are required' }, { status: 400 });
    }

    const enrollment = await Enrollment.findOne({
      student: session.user.id,
      course: courseId,
      status: 'active',
    });

    if (!enrollment) {
      return NextResponse.json({ success: false, error: 'Not enrolled' }, { status: 403 });
    }

    // Update current lesson
    enrollment.progress.currentLesson = lessonSlug;
    enrollment.progress.lastAccessedAt = new Date();

    if (action === 'complete') {
      // Add to completed if not already there
      if (!enrollment.progress.completedLessons.includes(lessonSlug)) {
        enrollment.progress.completedLessons.push(lessonSlug);
      }

      // Recalculate percentage from actual course data
      const course = await Course.findById(courseId).lean();
      let totalLessons = 0;
      if (course?.chapters) {
        course.chapters.forEach((ch) => {
          totalLessons += ch.lessons?.length || 0;
        });
      }
      enrollment.progress.percentage = totalLessons > 0
        ? Math.round((enrollment.progress.completedLessons.length / totalLessons) * 100)
        : 0;

      // Check if course completed
      if (enrollment.progress.percentage >= 100) {
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
      }
    }

    if (action === 'watch') {
      // Add 1 minute of watch time (called periodically from client)
      enrollment.progress.totalWatchTimeMin = (enrollment.progress.totalWatchTimeMin || 0) + 1;
    }

    await enrollment.save();

    return NextResponse.json({
      success: true,
      progress: {
        completedLessons: enrollment.progress.completedLessons,
        currentLesson: enrollment.progress.currentLesson,
        percentage: enrollment.progress.percentage,
        totalWatchTimeMin: enrollment.progress.totalWatchTimeMin,
      },
    });
  } catch (error) {
    console.error('Progress API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update progress' }, { status: 500 });
  }
}
