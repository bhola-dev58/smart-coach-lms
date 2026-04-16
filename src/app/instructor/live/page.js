import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import LiveSession from '@/models/LiveSession';
import Course from '@/models/Course';
import Link from 'next/link';

export const metadata = {
  title: 'Live Sessions - Instructor Panel',
};

export default async function InstructorLivePage() {
  const session = await getServerSession(authOptions);

  if (!session || !['instructor', 'admin'].includes(session.user?.role)) {
    redirect('/?auth=login');
  }

  await connectDB();

  // Fetch Live Sessions for this instructor
  const sessions = await LiveSession.find({ instructor: session.user.id })
    .populate('course', 'title')
    .sort({ scheduledAt: 1 })
    .lean();

  const now = new Date();
  const upcoming = sessions.filter(s => new Date(s.scheduledAt) >= now && s.status !== 'cancelled');
  const past = sessions.filter(s => new Date(s.scheduledAt) < now || s.status === 'cancelled');

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--dash-text)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            Live Sessions
          </h1>
          <p style={{ color: 'var(--dash-text-secondary)', fontSize: '0.9rem' }}>
            Schedule and manage your live broadcasts and doubt classes.
          </p>
        </div>
        <button style={{
          background: 'var(--color-primary)', color: 'white', border: 'none',
          padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
        }}>
          + Schedule New Session
        </button>
      </div>

      <h2 style={{ color: 'var(--dash-text)', fontSize: '1.2rem', marginBottom: '1rem' }}>Upcoming Broadcasts</h2>
      {upcoming.length === 0 ? (
        <div style={{ 
          background: 'var(--dash-surface)', border: '1px dashed var(--dash-border)', 
          borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', marginBottom: '2rem' 
        }}>
          <div style={{ fontSize: '3rem', margin: '0 0 1rem 0', opacity: 0.8 }}>🎥</div>
          <h3 style={{ color: 'var(--dash-text)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Upcoming Sessions</h3>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
            Schedule a session to interact live with your enrolled students.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {upcoming.map((s, idx) => (
            <div key={idx} style={{
              background: 'var(--dash-surface)', border: '1px solid var(--dash-accent)',
              borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(220,53,69,0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white', background: 'var(--dash-accent)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                  UPCOMING
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--dash-text-secondary)' }}>
                  {s.duration} mins
                </span>
              </div>
              <h3 style={{ color: 'var(--dash-text)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{s.title}</h3>
              <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Course: <strong>{s.course?.title || 'General / Not linked'}</strong><br/>
                Time: <strong>{new Date(s.scheduledAt).toLocaleString('en-IN')}</strong>
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button style={{ 
                  flex: 1, padding: '0.6rem', background: 'var(--dash-accent)', color: 'white',
                  border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                }}>
                  Start Broadcast
                </button>
                <button style={{ 
                  padding: '0.6rem 1rem', background: 'transparent', color: 'var(--dash-text)',
                  border: '1px solid var(--dash-border)', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer'
                }}>
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <>
          <h2 style={{ color: 'var(--dash-text)', fontSize: '1.2rem', marginBottom: '1rem' }}>Past Sessions</h2>
          <div style={{ overflowX: 'auto', background: 'var(--dash-surface)', borderRadius: '12px', border: '1px solid var(--dash-border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--dash-border)', background: 'var(--dash-bg)' }}>
                  <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Title</th>
                  <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Course</th>
                  <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Date</th>
                  <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {past.map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--dash-border)' }}>
                    <td style={{ padding: '1rem', color: 'var(--dash-text)', fontSize: '0.9rem', fontWeight: 500 }}>{s.title}</td>
                    <td style={{ padding: '1rem', color: 'var(--dash-text-muted)', fontSize: '0.85rem' }}>{s.course?.title || 'N/A'}</td>
                    <td style={{ padding: '1rem', color: 'var(--dash-text-muted)', fontSize: '0.85rem' }}>{new Date(s.scheduledAt).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>
                      <span style={{ 
                        background: s.status === 'completed' ? 'rgba(46,213,115,0.1)' : 'rgba(243,156,18,0.1)', 
                        color: s.status === 'completed' ? '#2ed573' : '#f39c12', 
                        padding: '0.2rem 0.5rem', borderRadius: '4px' 
                      }}>
                        {s.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

    </div>
  );
}
