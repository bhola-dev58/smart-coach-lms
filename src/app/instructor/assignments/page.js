import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Assignment from '@/models/Assignment';
import AssignmentSubmission from '@/models/AssignmentSubmission';
import Course from '@/models/Course';
import AssignmentDashboardClient from '@/components/instructor/AssignmentDashboardClient';

export const metadata = {
  title: 'Assignments - Instructor Panel',
};

export default async function InstructorAssignmentsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !['instructor', 'admin'].includes(session.user?.role)) {
    redirect('/?auth=login');
  }

  await connectDB();

  // Fetch Assignments created by this instructor
  const assignments = await Assignment.find({ instructor: session.user.id })
    .populate('course', 'title category')
    .sort({ dueDate: 1 })
    .lean();

  // Fetch submission counts for each assignment (using Promise.all for simplicity)
  const assignmentsWithStats = await Promise.all(
    assignments.map(async (assign) => {
      const submissions = await AssignmentSubmission.find({ assignment: assign._id }).lean();
      const graded = submissions.filter(s => s.status === 'graded').length;
      return {
        ...assign,
        totalSubmissions: submissions.length,
        gradedSubmissions: graded,
      };
    })
  );

  const coursesRaw = await Course.find({ instructor: session.user.id }).select('_id title').lean();
  const courses = coursesRaw.map(c => ({ _id: c._id.toString(), title: c.title }));

  const now = new Date();
  const activeAssignments = assignmentsWithStats
    .filter(a => new Date(a.dueDate) >= now)
    .map(a => ({ ...a, _id: a._id.toString(), courseTitle: a.course?.title || 'Unknown', dueDate: a.dueDate.toISOString() }));
    
  const pastAssignments = assignmentsWithStats
    .filter(a => new Date(a.dueDate) < now)
    .map(a => ({ ...a, _id: a._id.toString(), courseTitle: a.course?.title || 'Unknown', dueDate: a.dueDate.toISOString() }));

  return <AssignmentDashboardClient courses={courses} activeAssignments={activeAssignments} pastAssignments={pastAssignments} />;
}
