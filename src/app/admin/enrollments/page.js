import { connectDB } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import '@/models/User';
import '@/models/Course';
import styles from '@/app/admin/admin.module.css';

export const metadata = { title: 'Manage Enrollments | Admin' };

export default async function AdminEnrollmentsPage() {
  await connectDB();
  
  const enrollments = await Enrollment.find({})
    .populate('student', 'name email')
    .populate('course', 'title category')
    .sort({ enrolledAt: -1 })
    .lean();
  
  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Student Enrollments</h2>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eaeaea' }}>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Student</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Course</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Progress</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Enrolled On</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.length === 0 && (
               <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No enrollments found.</td></tr>
            )}
            {enrollments.map(enr => (
              <tr key={enr._id.toString()} style={{ borderBottom: '1px solid #eaeaea' }}>
                <td style={{ padding: '1rem' }}>
                   <div style={{ fontWeight: 500 }}>{enr.student?.name || 'Unknown'}</div>
                   <div style={{ fontSize: '0.8rem', color: '#666' }}>{enr.student?.email}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                   <div style={{ fontWeight: 500 }}>{enr.course?.title || 'Unknown Course'}</div>
                   <div style={{ fontSize: '0.8rem', color: '#666' }}>{enr.course?.category}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '6px', 
                    fontSize: '0.75rem', 
                    background: enr.status === 'active' ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 71, 87, 0.1)',
                    color: enr.status === 'active' ? '#2ed573' : '#ff4757',
                    fontWeight: 600,
                    textTransform: 'capitalize'
                  }}>
                    {enr.status || 'Active'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                   <div style={{ width: '100%', background: '#eaeaea', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'var(--color-primary)', width: `${enr.progress?.percentage || 0}%` }}></div>
                   </div>
                   <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.3rem' }}>{enr.progress?.percentage || 0}% Complete</div>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                   {new Date(enr.enrolledAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
