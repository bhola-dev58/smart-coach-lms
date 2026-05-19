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
        <Link href="/admin/courses/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          + Add New Course
        </Link>
      </div>

      {/* Empty State */}
      {courses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
          <p style={{ color: '#888', marginBottom: '1rem' }}>No courses yet. Add your first course!</p>
          <Link href="/admin/courses/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>+ Add New Course</Link>
        </div>
      )}

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {courses.map(course => (
          <div key={course._id.toString()} style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14,
            overflow: 'hidden',
            transition: 'transform 0.2s, border-color 0.2s',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Thumbnail */}
            <div style={{ position: 'relative', height: 160, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                  📖
                </div>
              )}

              {/* Status Badge */}
              <span style={{
                position: 'absolute', top: 10, right: 10,
                padding: '0.2rem 0.7rem',
                borderRadius: 50,
                fontSize: '0.72rem',
                fontWeight: 700,
                background: course.isPublished ? 'rgba(46,213,115,0.15)' : 'rgba(255,171,0,0.15)',
                color: course.isPublished ? '#2ed573' : '#ffab00',
                border: `1px solid ${course.isPublished ? 'rgba(46,213,115,0.3)' : 'rgba(255,171,0,0.3)'}`,
                backdropFilter: 'blur(4px)',
              }}>
                {course.isPublished ? '✓ Published' : '⏸ Draft'}
              </span>

              {/* Category Badge */}
              <span style={{
                position: 'absolute', top: 10, left: 10,
                padding: '0.2rem 0.6rem',
                borderRadius: 6,
                fontSize: '0.7rem',
                fontWeight: 700,
                background: '#C8102E',
                color: 'white',
                letterSpacing: '0.05em',
              }}>
                {course.category}
              </span>
            </div>

            {/* Card Body */}
            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', lineHeight: 1.4, margin: 0 }}>
                {course.title}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>
                /{course.slug}
              </p>

              {/* Meta Row */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: 4, fontSize: '0.78rem', color: '#888' }}>
                <span>⏱ {course.totalHours || 0}h</span>
                <span>👥 {course.totalStudents?.toLocaleString('en-IN') || 0}</span>
                <span>⭐ {course.rating || 0}</span>
              </div>

              {/* Price Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#C8102E' }}>
                  ₹{course.price?.toLocaleString('en-IN') || 0}
                </span>
                {course.originalPrice > 0 && (
                  <span style={{ fontSize: '0.8rem', color: '#555', textDecoration: 'line-through' }}>
                    ₹{course.originalPrice?.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
              <Link
                href={`/admin/courses/${course._id}/edit`}
                style={{
                  flex: 1, textAlign: 'center',
                  padding: '0.5rem',
                  background: 'rgba(255,255,255,0.07)',
                  color: '#ccc',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  transition: 'background 0.2s',
                }}
              >
                ✏️ Edit
              </Link>
              <Link
                href={`/courses/${course.slug}`}
                target="_blank"
                style={{
                  flex: 1, textAlign: 'center',
                  padding: '0.5rem',
                  background: 'rgba(200,16,46,0.1)',
                  color: '#C8102E',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
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
