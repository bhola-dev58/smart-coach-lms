import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import LmsCourseDetail from '@/components/lms/LmsCourseDetail';
import styles from '@/app/lms/lms.module.css';

export async function generateMetadata({ params }) {
  await connectDB();
  const { slug } = await params;
  const course = await Course.findOne({ slug }).lean();
  
  if (!course) return { title: 'Course Not Found' };
  
  return {
    title: `${course.title} | Gradify Academy`,
    description: course.shortDescription || course.description,
  };
}

export default async function CourseDetailsPage({ params }) {
  await connectDB();
  const { slug } = await params;
  const course = await Course.findOne({ slug })
    .populate('instructor', 'name bio specialization')
    .lean();

  if (!course) notFound();

  let computedLessons = 0;
  let computedDurationMinutes = 0;
  if (course.chapters) {
    course.chapters.forEach(ch => {
      if (ch.lessons) {
        ch.lessons.forEach(l => {
          const isAssignment = l.title?.toLowerCase().includes('assignment') || l.type === 'assignment';
          if (!isAssignment) {
            computedLessons += 1;
            computedDurationMinutes += (l.duration || 0);
          }
        });
      }
    });
  }

  const hours = Math.floor(computedDurationMinutes / 60);
  const mins = computedDurationMinutes % 60;
  const formattedTime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const serialized = JSON.parse(JSON.stringify({
    ...course,
    totalLessons: computedLessons,
    formattedTime,
    totalHours: Math.ceil(computedDurationMinutes / 60),
  }));

  return (
    <div className={styles.lmsWrapper} style={{ minHeight: '80vh', background: 'var(--dash-bg)', display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div style={{ width: '100%', maxWidth: '1000px' }}>
        <LmsCourseDetail course={serialized} backLink="/courses" />
      </div>
    </div>
  );
}
