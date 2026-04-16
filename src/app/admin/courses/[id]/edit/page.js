import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import { notFound } from 'next/navigation';
import CourseForm from '@/components/admin/CourseForm';
import styles from '@/app/admin/admin.module.css';

export const metadata = { title: 'Edit Course | Admin' };

export default async function EditCoursePage({ params }) {
  await connectDB();
  const { id } = await params;
  
  const course = await Course.findById(id).lean();
  
  if (!course) {
    notFound();
  }

  // Deep serialize the MongoDB document
  const serialized = JSON.parse(JSON.stringify(course));

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Edit Course</h2>
      </div>
      <CourseForm initialData={serialized} />
    </div>
  );
}
