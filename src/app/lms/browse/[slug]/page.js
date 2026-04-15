import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import '@/models/User';
import LmsCourseDetail from '@/components/lms/LmsCourseDetail';

export async function generateMetadata({ params }) {
  await connectDB();
  const { slug } = await params;
  const course = await Course.findOne({ slug }).lean();
  if (!course) return { title: 'Course Not Found' };
  return {
    title: `${course.title} — MeetMe Center`,
    description: course.shortDescription || course.description,
  };
}

export default async function LmsCourseDetailPage({ params }) {
  await connectDB();
  const { slug } = await params;
  const course = await Course.findOne({ slug })
    .populate('instructor', 'name bio specialization')
    .lean();

  if (!course) notFound();

  // Deep serialize — converts ALL nested ObjectIds/Dates to plain values
  const serialized = JSON.parse(JSON.stringify(course));

  return <LmsCourseDetail course={serialized} />;
}
