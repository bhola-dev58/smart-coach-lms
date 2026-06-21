import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Assignment from '@/models/Assignment';
import AssignmentSubmission from '@/models/AssignmentSubmission';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { assignmentId, fileUrl, content } = await req.json();

    if (!assignmentId) {
      return NextResponse.json({ success: false, error: 'Missing assignmentId' }, { status: 400 });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ success: false, error: 'Assignment not found' }, { status: 404 });
    }

    const isLate = new Date() > new Date(assignment.dueDate);

    // Upsert student's assignment submission for this specific assignment
    const submission = await AssignmentSubmission.findOneAndUpdate(
      { student: session.user.id, assignment: assignmentId },
      { 
        student: session.user.id,
        assignment: assignmentId,
        course: assignment.course,
        fileUrl: fileUrl || '',
        content: content || '',
        status: isLate ? 'late' : 'submitted',
        $setOnInsert: { marksAwarded: null, feedback: '' }
      },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({ success: true, submission }, { status: 201 });
  } catch (error) {
    console.error('Submit Standalone Assignment Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit assignment' }, { status: 500 });
  }
}
