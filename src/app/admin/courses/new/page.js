import CourseForm from '@/components/admin/CourseForm';
import styles from '@/app/admin/admin.module.css';

export const metadata = { title: 'Add New Course | Admin' };

export default function NewCoursePage() {
  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Add New Course</h2>
      </div>
      <CourseForm />
    </div>
  );
}
