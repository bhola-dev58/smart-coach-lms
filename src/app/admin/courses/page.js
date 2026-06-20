import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import Link from 'next/link';
import styles from '@/app/admin/admin.module.css';

export const metadata = { title: 'Manage Courses | Admin' };

export default async function AdminCoursesPage() {
  await connectDB();
  const courses = await Course.find({}).sort({ createdAt: -1 }).lean();

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Manage Courses</h2>
          <p style={{ color: '#888', fontSize: '0.9rem', marginTop: 4 }}>
            {courses.length} course{courses.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link href="/admin/courses/new" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
          + Add New Course
        </Link>
      </div>

      {/* Empty State */}
      {courses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
          <p style={{ color: '#888', marginBottom: '1rem' }}>No courses yet. Add your first course!</p>
          <Link href="/admin/courses/new" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>+ Add New Course</Link>
        </div>
      )}

      {/* Cards Grid */}
      <div className={styles.courseGrid}>
        {courses.map(course => (
          <div key={course._id.toString()} className={styles.courseCard}>
            {/* Thumbnail */}
            <div className={styles.thumbnailContainer}>
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className={styles.thumbnailImage}
                />
              ) : (
                <div className={styles.placeholderThumbnail}>
                  📖
                </div>
              )}

              {/* Status Badge */}
              <span className={`${styles.statusBadge} ${course.isPublished ? styles.statusBadgePublished : styles.statusBadgeDraft}`}>
                {course.isPublished ? '✓ Published' : '⏸ Draft'}
              </span>

              {/* Category Badge */}
              <span className={styles.categoryBadge}>
                {course.category}
              </span>
            </div>

            {/* Card Body */}
            <div className={styles.cardBody}>
              <h3 className={styles.courseTitle}>
                {course.title}
              </h3>
              <p className={styles.courseSlug}>
                /{course.slug}
              </p>

              {/* Meta Row */}
              <div className={styles.metaRow}>
                <span>⏱ {course.totalHours || 0}h</span>
                <span>👥 {course.totalStudents?.toLocaleString('en-IN') || 0}</span>
                <span>⭐ {course.rating || 0}</span>
              </div>

              {/* Price Row */}
              <div className={styles.priceRow}>
                <span className={styles.priceText}>
                  ₹{course.price?.toLocaleString('en-IN') || 0}
                </span>
                {course.originalPrice > 0 && (
                  <span className={styles.originalPriceText}>
                    ₹{course.originalPrice?.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div className={styles.cardFooter}>
              <Link
                href={`/admin/courses/${course._id}/edit`}
                className={styles.btnEdit}
              >
                ✏️ Edit
              </Link>
              <Link
                href={`/courses/${course.slug}`}
                target="_blank"
                className={styles.btnPreview}
              >
                👁 Preview
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
