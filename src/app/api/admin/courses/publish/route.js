// ============================================================
// 🚀 COURSE PUBLISH API — /api/admin/courses/publish
// When admin/instructor publishes a course:
//   1. Sets course status to 'published'
//   2. Notifies ALL active students (in-app + email)
// ============================================================
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import User from '@/models/User';
import { createNotification } from '@/lib/notifications';
import { sendNewCourseLaunchEmail } from '@/lib/email';
import { revalidatePath } from 'next/cache';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'instructor'].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ success: false, error: 'courseId is required.' }, { status: 400 });
    }

    await connectDB();

    // ── Update course status ──
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found.' }, { status: 404 });
    }

    if (course.status === 'published') {
      return NextResponse.json({ success: false, error: 'Course is already published.' }, { status: 409 });
    }

    await Course.findByIdAndUpdate(courseId, { status: 'published', publishedAt: new Date() });

    revalidatePath('/');
    revalidatePath('/courses');
    revalidatePath('/lms/browse');

    // ── Get all active students to notify ──
    const students = await User.find({ isActive: true, role: 'student' }).select('_id email').lean();

    if (students.length > 0) {
      const studentIds = students.map(s => s._id.toString());
      const emails = students.map(s => s.email).filter(Boolean);

      // ── In-app notifications ──
      createNotification(
        studentIds,
        'new_course',
        `🚀 New Course: ${course.title}`,
        `A brand new course has been launched at Gradify Academy. Enroll now!`,
        `/lms/course/${course.slug}`
      );

      // ── Email broadcast ──
      sendNewCourseLaunchEmail(emails, course.title, course.slug, course.description || '')
        .catch(err => console.error('[Course publish email error]', err.message));
    }

    return NextResponse.json({
      success: true,
      message: `Course published and ${students.length} students notified.`,
      notifiedCount: students.length,
    });

  } catch (err) {
    console.error('[Course Publish Error]', err);
    return NextResponse.json({ success: false, error: 'Failed to publish course.' }, { status: 500 });
  }
}
