import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import InstructorDashboardClient from '@/components/instructor/InstructorDashboardClient';

export default async function InstructorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !['instructor', 'admin'].includes(session.user?.role)) {
    redirect('/?auth=login');
  }

  await connectDB();

  // 1. Get all courses taught by this instructor
  const courses = await Course.find({ instructor: session.user.id }).lean();
  const courseIds = courses.map(c => c._id);

  // 2. Aggregate metrics
  const activeCourses = courses.filter(c => c.isPublished).length;
  
  let averageRating = 0;
  if (courses.length > 0) {
    const totalRatingSum = courses.reduce((sum, c) => sum + (c.rating || 0), 0);
    averageRating = totalRatingSum / courses.length;
  }

  // 3. Get Recent Enrollments & Total Students
  // Assuming a student may be enrolled in multiple courses, unique students might be different.
  // We'll calculate "Total Course Enrollments" as totalStudents for now.
  const enrollments = await Enrollment.find({ course: { $in: courseIds } })
    .populate('student', 'name')
    .populate('course', 'title price')
    .sort({ enrolledAt: -1 })
    .lean();

  const totalStudents = enrollments.length;

  // Simulate total earnings (Sum of price of all enrollments)
  const totalEarnings = enrollments.reduce((sum, enr) => {
    return sum + (enr.course?.price || 0);
  }, 0);

  // Format recent enrollments for the client
  const recentEnrollments = enrollments.slice(0, 5).map(e => ({
    studentName: e.student?.name || 'Unknown Student',
    courseTitle: e.course?.title || 'Unknown Course',
    date: e.enrolledAt.toISOString(),
  }));

  const dashboardData = {
    totalStudents,
    activeCourses,
    averageRating,
    totalEarnings,
    recentEnrollments
  };

  return <InstructorDashboardClient dashboardData={dashboardData} />;
}
