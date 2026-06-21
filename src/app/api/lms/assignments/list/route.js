import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Assignment from '@/models/Assignment';
import AssignmentSubmission from '@/models/AssignmentSubmission';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // 1. Get enrolled courses
    const enrollments = await Enrollment.find({ student: session.user.id }).select('course').lean();
    const courseIds = enrollments.map(e => e.course);

    // 2. Fetch Assignments linked to those courses
    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate('course', 'title')
      .sort({ dueDate: 1 })
      .lean();

    // 3. Fetch submissions for this student
    const submissions = await AssignmentSubmission.find({ student: session.user.id }).lean();

    return NextResponse.json({ success: true, assignments, submissions });
  } catch (error) {
    console.error('Fetch Assignments List Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch assignments' }, { status: 500 });
  }
}
