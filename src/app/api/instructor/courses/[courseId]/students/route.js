import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import '@/models/User'; // Ensure User model is registered

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'instructor' && session.user.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const unwrappedParams = await params;
    await connectDB();
    const courseId = unwrappedParams.courseId;

    // Fetch all active/completed enrollments for this course
    const enrollments = await Enrollment.find({
      course: courseId,
      status: { $in: ['active', 'completed'] }
    })
      .populate('student', 'name email avatar')
      .lean();

    // Extract student user details
    const students = enrollments
      .map(e => e.student)
      .filter(s => s && s.email);

    return NextResponse.json({ success: true, students });
  } catch (err) {
    console.error('Error fetching course students:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
