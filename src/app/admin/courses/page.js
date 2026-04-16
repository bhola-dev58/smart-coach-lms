import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import Link from 'next/link';
import styles from '@/app/admin/admin.module.css';

export const metadata = { title: 'Manage Courses | Admin' };

export default async function AdminCoursesPage() {
  await connectDB();
  
  // Fetch full list
  const courses = await Course.find({}).sort({ createdAt: -1 }).lean();
  
  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Manage Courses</h2>
        <Link href="/admin/courses/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          + Add New Course
        </Link>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eaeaea' }}>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Title</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Category</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Price</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: '600', maxWidth: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 && (
               <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No courses found in database.</td></tr>
            )}
            {courses.map(course => (
              <tr key={course._id.toString()} style={{ borderBottom: '1px solid #eaeaea' }}>
                <td style={{ padding: '1rem' }}>
                   <div style={{ fontWeight: 600 }}>{course.title}</div>
                   <div style={{ fontSize: '0.8rem', color: '#666' }}>{course.slug}</div>
                </td>
                <td style={{ padding: '1rem' }}>{course.category}</td>
                <td style={{ padding: '1rem' }}>₹{course.price?.toLocaleString('en-IN') || 0}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.6rem', 
                    borderRadius: '50px', 
                    fontSize: '0.75rem', 
                    background: course.isPublished ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 171, 0, 0.1)',
                    color: course.isPublished ? '#2ed573' : '#ffab00',
                    fontWeight: 600
                  }}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <Link href={`/admin/courses/${course._id}/edit`} style={{ 
                    padding: '0.4rem 0.8rem', 
                    background: '#f0f0f0', 
                    color: '#333', 
                    borderRadius: '6px', 
                    textDecoration: 'none', 
                    fontSize: '0.85rem',
                    fontWeight: 500
                  }}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
