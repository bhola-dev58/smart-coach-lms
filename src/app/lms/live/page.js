import styles from '@/app/lms/lms.module.css';

export const metadata = { title: 'Live Classes | LMS' };

export default function LiveClassesPage() {
  const schedule = [
    { id: 1, title: 'Calculus Doubt Clearing Session', date: 'Tomorrow, 5:00 PM', instructor: 'Prof. Sharma', status: 'Upcoming' },
    { id: 2, title: 'System Design Mock Interview', date: 'Oct 20, 10:00 AM', instructor: 'Rahul Dev', status: 'Scheduled' },
    { id: 3, title: 'Orientation & Roadmap 2025', date: 'Past (Oct 10)', instructor: 'Admin', status: 'Recording Available' },
  ];

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
            {schedule.map(session => (
              <tr key={session.id} style={{ borderBottom: '1px solid var(--dash-border)', transition: 'background 0.2s', background: 'var(--dash-surface)' }}>
                <td style={{ padding: '1.25rem' }}>
                   <div style={{ fontWeight: 600, color: 'var(--dash-text)' }}>{session.title}</div>
                   <div style={{ fontSize: '0.8rem', color: session.status === 'Upcoming' ? '#2ed573' : 'var(--dash-text-muted)', marginTop: '0.4rem', fontWeight: 500 }}>{session.status}</div>
                </td>
                <td style={{ padding: '1.25rem', color: 'var(--dash-text-muted)', fontSize: '0.9rem' }}>{session.date}</td>
                <td style={{ padding: '1.25rem', color: 'var(--dash-text-muted)', fontSize: '0.9rem' }}>{session.instructor}</td>
                <td style={{ padding: '1.25rem' }}>
                  <button 
                     disabled={session.status === 'Scheduled'}
                     style={{ 
                        padding: '0.5rem 1.25rem', 
                        background: session.status === 'Upcoming' ? 'var(--dash-accent)' : 'var(--dash-bg)', 
                        color: session.status === 'Upcoming' ? 'white' : 'var(--dash-text-muted)', 
                        borderRadius: 'var(--dash-radius-xs)', 
                        border: session.status === 'Upcoming' ? 'none' : '1px solid var(--dash-border)', 
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: session.status === 'Scheduled' ? 'not-allowed' : 'pointer',
                        transition: 'opacity var(--dash-transition)'
                     }}>
                    {session.status === 'Recording Available' ? 'Watch' : 'Join'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
