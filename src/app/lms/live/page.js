import styles from '@/app/lms/lms.module.css';

export const metadata = { title: 'Live Classes | LMS' };

export default function LiveClassesPage() {
  const schedule = [
    { id: 1, title: 'Calculus Doubt Clearing Session', date: 'Tomorrow, 5:00 PM', instructor: 'Prof. Sharma', status: 'Upcoming' },
    { id: 2, title: 'System Design Mock Interview', date: 'Oct 20, 10:00 AM', instructor: 'Rahul Dev', status: 'Scheduled' },
    { id: 3, title: 'Orientation & Roadmap 2025', date: 'Past (Oct 10)', instructor: 'Admin', status: 'Recording Available' },
  ];

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
         <div>
            <h1 className={styles.title}>Live Classes</h1>
            <p className={styles.subtitle}>Attend your scheduled live sessions and interact with instructors.</p>
         </div>
         <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#aaa', fontSize: '0.9rem' }}>
            Timezone: IST (GMT+5:30)
         </div>
      </div>

      <div style={{ background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '1.25rem', fontWeight: '500', color: '#aaa' }}>Session Details</th>
              <th style={{ padding: '1.25rem', fontWeight: '500', color: '#aaa' }}>Timing</th>
              <th style={{ padding: '1.25rem', fontWeight: '500', color: '#aaa' }}>Instructor</th>
              <th style={{ padding: '1.25rem', fontWeight: '500', color: '#aaa', maxWidth: '100px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map(session => (
              <tr key={session.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                <td style={{ padding: '1.25rem' }}>
                   <div style={{ fontWeight: 500, color: '#e0e0e0' }}>{session.title}</div>
                   <div style={{ fontSize: '0.8rem', color: session.status === 'Upcoming' ? '#2ed573' : '#888', marginTop: '0.2rem' }}>{session.status}</div>
                </td>
                <td style={{ padding: '1.25rem', color: '#bbb' }}>{session.date}</td>
                <td style={{ padding: '1.25rem', color: '#bbb' }}>{session.instructor}</td>
                <td style={{ padding: '1.25rem' }}>
                  <button 
                     disabled={session.status === 'Scheduled'}
                     style={{ 
                        padding: '0.5rem 1.25rem', 
                        background: session.status === 'Upcoming' ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)', 
                        color: session.status === 'Upcoming' ? 'white' : '#888', 
                        borderRadius: '6px', 
                        border: 'none', 
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: session.status === 'Scheduled' ? 'not-allowed' : 'pointer'
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
