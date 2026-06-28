import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: true, discountApplicable: false });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ success: false, error: 'courseId is required' }, { status: 400 });
    }

    await connectDB();

    const course = await Course.findById(courseId).select('price').lean();
    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    }

    // Check if the student has an enrollment with status 'expired' for this course
    const expiredEnrollment = await Enrollment.findOne({
      student: session.user.id,
      course: courseId,
      status: 'expired'
    }).lean();

    if (expiredEnrollment) {
      const discountedPrice = Math.round(course.price * 0.5);
      return NextResponse.json({
        success: true,
        discountApplicable: true,
        originalPrice: course.price,
        discountedPrice: discountedPrice,
        message: 'Welcome back! You are eligible for a 50% re-enrollment discount.'
      });
    }

    return NextResponse.json({
      success: true,
      discountApplicable: false,
      originalPrice: course.price,
      discountedPrice: course.price
    });
  } catch (error) {
    console.error('Check discount error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
