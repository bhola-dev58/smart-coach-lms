import styles from '@/app/lms/lms.module.css';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import LiveSession from '@/models/LiveSession';
import Enrollment from '@/models/Enrollment';

export const metadata = { title: 'Live Classes | LMS' };

export default async function LiveClassesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/?auth=login');
  }

  await connectDB();

  // Find courses this student is enrolled in
  const enrollments = await Enrollment.find({ student: session.user.id }).select('course').lean();
  const courseIds = enrollments.map(e => e.course);

  // Fetch Live Sessions where course is in their enrollments OR course is null (General session)
  const sessions = await LiveSession.find({
    $or: [{ course: { $in: courseIds } }, { course: null }]
  })
    .populate('instructor', 'name')
    .sort({ scheduledAt: 1 })
    .lean();

  const now = new Date();

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
         <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--dash-text)', marginBottom: '0.4rem', fontWeight: 700 }}>
              Live Classes
            </h1>
            <p style={{ color: 'var(--dash-text-secondary)', fontSize: '0.9rem' }}>
              Attend your scheduled live sessions and interact with instructors.
            </p>
         </div>
         <div style={{ background: 'var(--dash-surface)', border: '1px solid var(--dash-border)', padding: '0.5rem 1rem', borderRadius: '8px', color: 'var(--dash-text-muted)', fontSize: '0.85rem' }}>
            Timezone: IST (GMT+5:30)
         </div>
      </div>

      <div style={{ background: 'var(--dash-surface)', borderRadius: '12px', border: '1px solid var(--dash-border)', overflow: 'hidden', boxShadow: 'var(--dash-shadow)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--dash-bg)', borderBottom: '1px solid var(--dash-border)' }}>
              <th style={{ padding: '1.25rem', fontWeight: '600', color: 'var(--dash-text-secondary)', fontSize: '0.9rem' }}>Session Details</th>
              <th style={{ padding: '1.25rem', fontWeight: '600', color: 'var(--dash-text-secondary)', fontSize: '0.9rem' }}>Timing</th>
              <th style={{ padding: '1.25rem', fontWeight: '600', color: 'var(--dash-text-secondary)', fontSize: '0.9rem' }}>Instructor</th>
              <th style={{ padding: '1.25rem', fontWeight: '600', color: 'var(--dash-text-secondary)', fontSize: '0.9rem', maxWidth: '100px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--dash-text-muted)' }}>
                  No live sessions scheduled at the moment.
                </td>
              </tr>
            ) : (
              sessions.map(s => {
                const isPast = new Date(s.scheduledAt) < now;
                let statusLabel = s.status === 'cancelled' ? 'Cancelled' : isPast ? 'Past Session' : 'Upcoming';
                let btnText = isPast ? 'N/A' : 'Join Class';
                if (s.status === 'live') {
                   statusLabel = '🔴 LIVE NOW';
                   btnText = 'Join Now';
                }

                return (
                 <tr key={s._id.toString()} style={{ borderBottom: '1px solid var(--dash-border)', transition: 'background 0.2s', background: 'var(--dash-surface)' }}>
                   <td style={{ padding: '1.25rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--dash-text)' }}>{s.title}</div>
                      <div style={{ fontSize: '0.8rem', color: statusLabel.includes('LIVE') || statusLabel === 'Upcoming' ? '#2ed573' : 'var(--dash-text-muted)', marginTop: '0.4rem', fontWeight: 500 }}>
                        {statusLabel}
                      </div>
                   </td>
                   <td style={{ padding: '1.25rem', color: 'var(--dash-text-muted)', fontSize: '0.9rem' }}>
                     {new Date(s.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}<br/>
                     <span style={{ fontSize: '0.75rem' }}>({s.duration} mins)</span>
                   </td>
                   <td style={{ padding: '1.25rem', color: 'var(--dash-text-muted)', fontSize: '0.9rem' }}>
                     {s.instructor?.name || 'Instructor'}
                   </td>
                   <td style={{ padding: '1.25rem' }}>
                     {isPast || s.status === 'cancelled' ? (
                        <button disabled style={{ padding: '0.5rem 1.25rem', background: 'var(--dash-bg)', color: 'var(--dash-text-muted)', borderRadius: 'var(--dash-radius-xs)', border: '1px solid var(--dash-border)', fontSize: '0.85rem', fontWeight: 600, cursor: 'not-allowed' }}>
                          Ended
                        </button>
                     ) : (
                        <a href={s.joinUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'inline-block', padding: '0.5rem 1.25rem', background: 'var(--dash-accent)', color: 'white', borderRadius: 'var(--dash-radius-xs)', border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                          {btnText}
                        </a>
                     )}
                   </td>
                 </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
