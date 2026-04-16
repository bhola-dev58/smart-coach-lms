import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';

export const metadata = {
  title: 'Students - Instructor Panel',
};

export default async function InstructorStudentsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !['instructor', 'admin'].includes(session.user?.role)) {
    redirect('/?auth=login');
  }

  await connectDB();

  // Find all courses for this instructor to filter enrollments
  const courses = await Course.find({ instructor: session.user.id }).select('_id title').lean();
  const courseIds = courses.map(c => c._id);

  // Find enrollments
  const enrollments = await Enrollment.find({ course: { $in: courseIds } })
    .populate('student', 'name email phone avatar')
    .populate('course', 'title category')
    .sort({ enrolledAt: -1 })
    .lean();

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--dash-text)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            My Students
          </h1>
          <p style={{ color: 'var(--dash-text-secondary)', fontSize: '0.9rem' }}>
            Track progress and manage all students enrolled in your courses.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{
            background: 'var(--dash-surface)', border: '1px solid var(--dash-border)',
            padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <span>🔍</span>
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              style={{ background: 'transparent', border: 'none', color: 'var(--dash-text)', outline: 'none', width: '200px' }} 
            />
          </div>
          <button style={{
            background: 'var(--dash-surface)', color: 'var(--dash-text)', border: '1px solid var(--dash-border)',
            padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
          }}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {enrollments.length === 0 ? (
        <div style={{ 
          background: 'var(--dash-surface)', border: '1px dashed var(--dash-border)', 
          borderRadius: '12px', padding: '4rem 2rem', textAlign: 'center' 
        }}>
          <div style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>📂</div>
          <h3 style={{ color: 'var(--dash-text)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Students Yet</h3>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
            Publish your courses to start enrolling students. Their progress will appear here.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'var(--dash-surface)', borderRadius: '12px', border: '1px solid var(--dash-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--dash-border)', background: 'var(--dash-bg)' }}>
                <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Student Details</th>
                <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Course Enrolled</th>
                <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Progress</th>
                <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Enrollment Date</th>
                <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enr, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--dash-border)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background='var(--dash-bg)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                     <div style={{ 
                       width: '40px', height: '40px', borderRadius: '50%', 
                       background: 'var(--dash-accent-light)', color: 'var(--dash-accent)', 
                       display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' 
                     }}>
                       {(enr.student?.name || 'U').charAt(0)}
                     </div>
                     <div>
                       <div style={{ color: 'var(--dash-text)', fontWeight: 600, fontSize: '0.9rem' }}>{enr.student?.name || 'Unknown Student'}</div>
                       <div style={{ color: 'var(--dash-text-muted)', fontSize: '0.75rem' }}>{enr.student?.email || 'N/A'}</div>
                     </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: 'var(--dash-text)', fontSize: '0.9rem', fontWeight: 500 }}>{enr.course?.title || 'Unknown Course'}</div>
                    <div style={{ color: 'var(--dash-text-secondary)', fontSize: '0.75rem' }}>{enr.course?.category || ''}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <div style={{ flex: 1, height: '6px', background: 'var(--dash-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'var(--color-primary)', width: `${enr.progress?.percentage || 0}%`, borderRadius: '3px' }}></div>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--dash-text-muted)', fontWeight: 600 }}>{enr.progress?.percentage || 0}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--dash-text-muted)', fontSize: '0.85rem' }}>
                    {new Date(enr.enrolledAt).toLocaleDateString('en-IN')}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button style={{
                      background: 'transparent', color: 'var(--dash-text)', border: '1px solid var(--dash-border)',
                      padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: 500, fontSize: '0.8rem', cursor: 'pointer'
                    }}>
                      Message
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
