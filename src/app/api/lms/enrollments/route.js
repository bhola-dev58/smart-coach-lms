// ============================================================
// 🎓 ENROLLMENTS API — /api/lms/enrollments
// GET  — List current user's enrollments
// POST — Enroll student in a course (free enrollment)
//         Triggers: in-app notification + confirmation email
// ============================================================
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import User from '@/models/User';
import { createNotification } from '@/lib/notifications';
import { sendEnrollmentConfirmation } from '@/lib/email';

// GET /api/lms/enrollments
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

// POST /api/lms/enrollments — Enroll in a course
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json({ success: false, error: 'courseId is required.' }, { status: 400 });
    }

    await connectDB();

    // ── Fetch course details ──
    const course = await Course.findById(courseId).select('title slug price').lean();
    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found.' }, { status: 404 });
    }

    // ── Check already enrolled ──
    const existing = await Enrollment.findOne({ student: session.user.id, course: courseId });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Already enrolled in this course.' }, { status: 409 });
    }

    // ── Create Enrollment ──
    const enrollment = await Enrollment.create({
      student: session.user.id,
      course: courseId,
      status: 'active',
    });

    // ── Update User's enrolledCourses array ──
    await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { enrolledCourses: courseId },
    });

    // ── In-app Notification (non-blocking) ──
    createNotification(
      session.user.id,
      'enrollment',
      '🎉 Enrollment Confirmed!',
      `You have successfully enrolled in "${course.title}". Start learning now!`,
      `/lms/course/${course.slug}`,
      { relatedCourse: courseId }
    );

    // ── Confirmation Email (non-blocking) ──
    User.findById(session.user.id).select('email name').lean().then(user => {
      if (user?.email) {
        sendEnrollmentConfirmation(user.email, user.name, course.title, course.slug)
          .catch(err => console.error('[Enrollment] Email failed:', err.message));
      }
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Successfully enrolled in "${course.title}"!`,
      enrollmentId: enrollment._id.toString(),
    }, { status: 201 });

  } catch (error) {
    console.error('[Enrollment POST Error]', error);
    return NextResponse.json({ success: false, error: 'Enrollment failed. Please try again.' }, { status: 500 });
  }
}
