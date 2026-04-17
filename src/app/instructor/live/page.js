import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import LiveSession from '@/models/LiveSession';
import Course from '@/models/Course';
import LiveDashboardClient from '@/components/instructor/LiveDashboardClient';
import Link from 'next/link';

export const metadata = {
  title: 'Live Sessions - Instructor Panel',
};

export default async function InstructorLivePage() {
  const session = await getServerSession(authOptions);

  if (!session || !['instructor', 'admin'].includes(session.user?.role)) {
    redirect('/?auth=login');
  }

  await connectDB();

  // Fetch Live Sessions for this instructor
  const sessions = await LiveSession.find({ instructor: session.user.id })
    .populate('course', 'title')
    .sort({ scheduledAt: 1 })
    .lean();

  // Prepare basic courses list for the dropdown
  const coursesRaw = await Course.find({ instructor: session.user.id }).select('_id title').lean();
  const courses = coursesRaw.map(c => ({ _id: c._id.toString(), title: c.title }));

  // Prepare Live Sessions data
  const now = new Date();
  
  const upcoming = sessions
    .filter(s => new Date(s.scheduledAt) >= now && s.status !== 'cancelled')
    .map(s => ({
      _id: s._id.toString(),
      title: s.title,
      scheduledAt: s.scheduledAt.toISOString(),
      duration: s.duration,
      joinUrl: s.joinUrl,
      status: s.status,
      courseTitle: s.course?.title || 'General'
    }));

  const past = sessions
    .filter(s => new Date(s.scheduledAt) < now || s.status === 'cancelled')
    .map(s => ({
      _id: s._id.toString(),
      title: s.title,
      scheduledAt: s.scheduledAt.toISOString(),
      duration: s.duration,
      status: s.status,
      courseTitle: s.course?.title || 'General'
    }));

  return <LiveDashboardClient upcoming={upcoming} past={past} courses={courses} />;
}
