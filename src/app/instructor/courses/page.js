import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import CourseDashboardClient from '@/components/instructor/CourseDashboardClient';

export const metadata = {
  title: 'My Courses - Instructor Panel',
};

export default async function InstructorCoursesPage() {
  const session = await getServerSession(authOptions);

  if (!session || !['instructor', 'admin'].includes(session.user?.role)) {
    redirect('/?auth=login');
  }

  await connectDB();

  // Find all courses for this instructor
  const courses = await Course.find({ instructor: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  // Format course data for client
  const serializedCourses = courses.map(c => ({
    ...c,
    _id: c._id.toString(),
    instructor: c.instructor.toString(),
  }));

  return <CourseDashboardClient courses={serializedCourses} />;
}
