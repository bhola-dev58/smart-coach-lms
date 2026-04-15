import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import '@/models/User';
import BrowseCoursesClient from '@/components/lms/BrowseCoursesClient';

export const metadata = { title: 'Browse Courses — MeetMe Center' };

export default async function BrowseCoursesPage() {
  await connectDB();

  const courses = await Course.find({ isPublished: true })
    .populate('instructor', 'name')
    .sort({ createdAt: -1 })
    .lean();

  // Deep serialize — converts ALL nested ObjectIds to plain strings
  const serialized = JSON.parse(JSON.stringify(courses));

  return <BrowseCoursesClient courses={serialized} />;
}
