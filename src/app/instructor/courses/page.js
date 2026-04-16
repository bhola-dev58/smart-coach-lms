import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';
import Link from 'next/link';

export const metadata = {
  title: 'My Courses - Instructor Panel',
};

export default async function InstructorCoursesPage() {
  const session = await getServerSession(authOptions);

  if (!session || !['instructor', 'admin'].includes(session.user?.role)) {
    redirect('/?auth=login');
  }

  await connectDB();

  // Find all courses for this instructor
  const courses = await Course.find({ instructor: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--dash-text)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            Course Management
          </h1>
          <p style={{ color: 'var(--dash-text-secondary)', fontSize: '0.9rem' }}>
            Manage your courses, edit curriculum, and review student progress.
          </p>
        </div>
        <button style={{
          background: 'var(--color-primary)', color: 'white', border: 'none',
          padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
        }}>
          + Create New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div style={{ 
          background: 'var(--dash-surface)', border: '1px dashed var(--dash-border)', 
          borderRadius: '12px', padding: '4rem 2rem', textAlign: 'center' 
        }}>
          <div style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>📂</div>
          <h3 style={{ color: 'var(--dash-text)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Courses Yet</h3>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            You haven't created any courses yet. Start building your first course to share your knowledge with students.
          </p>
          <button style={{
            background: 'var(--color-primary)', color: 'white', border: 'none',
            padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
          }}>
            Create Course
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {courses.map(course => (
            <div key={course._id.toString()} style={{
              background: 'var(--dash-surface)', border: '1px solid var(--dash-border)',
              borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--dash-shadow)'
            }}>
              <div style={{
                height: '160px', background: 'linear-gradient(135deg, var(--dash-surface), var(--dash-bg))',
                position: 'relative'
              }}>
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--dash-text-muted)', fontSize: '2rem' }}>📺</div>
                )}
                <div style={{
                  position: 'absolute', top: '0.75rem', right: '0.75rem',
                  background: course.isPublished ? '#2ed573' : '#f39c12',
                  color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700
                }}>
                  {course.isPublished ? 'PUBLISHED' : 'DRAFT'}
                </div>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <div style={{ color: 'var(--dash-accent)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {course.category}
                </div>
                <h3 style={{ color: 'var(--dash-text)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {course.title}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--dash-text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                   <span>{course.totalStudents || 0} Students</span>
                   <span>₹{course.price.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{ 
                    flex: 1, padding: '0.5rem', background: 'var(--dash-bg)', color: 'var(--dash-text)',
                    border: '1px solid var(--dash-border)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                  }}>
                    Edit Details
                  </button>
                  <button style={{ 
                    flex: 1, padding: '0.5rem', background: 'var(--dash-bg)', color: 'var(--dash-text)',
                    border: '1px solid var(--dash-border)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                  }}>
                    Curriculum
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
