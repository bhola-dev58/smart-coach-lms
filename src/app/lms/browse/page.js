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

  // Serialize MongoDB ObjectIds to strings
  const serialized = courses.map(c => ({
    ...c,
    _id: c._id.toString(),
    instructor: c.instructor ? { ...c.instructor, _id: c.instructor._id.toString() } : null,
  }));

  return <BrowseCoursesClient courses={serialized} />;
}
