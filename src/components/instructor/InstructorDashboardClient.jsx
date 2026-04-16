'use client';

import { useSession } from 'next-auth/react';
import styles from '@/app/lms/lms.module.css';

export default function InstructorDashboardClient({ dashboardData }) {
  const { data: session } = useSession();
  const { totalStudents, activeCourses, averageRating, totalEarnings, recentEnrollments } = dashboardData;

  const stats = [
    { label: 'Total Students', value: totalStudents.toLocaleString('en-IN'), icon: '👨‍🎓', trend: 'Lifetime' },
    { label: 'Active Courses', value: activeCourses, icon: '📚', trend: 'Published' },
    { label: 'Avg Rating', value: averageRating.toFixed(1), icon: '⭐', trend: 'Verified' },
    { label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString('en-IN')}`, icon: '💰', trend: 'Estimated' },
  ];

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection} style={{ marginBottom: '2rem' }}>
        <div className={styles.welcomeText}>
          <h1 style={{ color: 'var(--dash-text)' }}>Welcome back, Prof. {session?.user?.name?.split(' ')[0] || 'Instructor'}!</h1>
          <p style={{ color: 'var(--dash-text-secondary)' }}>Here is what is happening with your courses today.</p>
        </div>
        <button className={styles.storeBtn}>
          + Create New Course
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {stats.map((stat, idx) => (
          <div key={idx} className={styles.dCard} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
               <span style={{ fontSize: '0.75rem', color: '#2ed573', fontWeight: 600, background: 'rgba(46,213,115,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                 {stat.trend}
               </span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--dash-text)', marginTop: '0.5rem' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--dash-text-muted)', fontWeight: 500 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid area */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        
        {/* Recent Enrollments */}
        <div className={styles.dCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Recent Enrollments</h2>
            <button className={styles.outlineBtn} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>View All</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--dash-border)', background: 'var(--dash-bg)' }}>
                  <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Student</th>
                  <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Course</th>
                  <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentEnrollments.length > 0 ? recentEnrollments.map((enrollment, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--dash-border)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background='var(--dash-bg)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--dash-accent-light)', color: 'var(--dash-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                        {enrollment.studentName.charAt(0)}
                      </div>
                      <span style={{ color: 'var(--dash-text)', fontWeight: 500, fontSize: '0.9rem' }}>{enrollment.studentName}</span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--dash-text-muted)', fontSize: '0.85rem' }}>{enrollment.courseTitle}</td>
                    <td style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.8rem' }}>{new Date(enrollment.date).toLocaleDateString('en-IN')}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--dash-text-muted)', fontSize: '0.9rem' }}>
                      No recent enrollments.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Schedule */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Upcoming Class */}
          <div className={styles.dCard} style={{ background: 'var(--dash-accent-light)', borderColor: 'var(--dash-accent)', color: 'var(--dash-text)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
               <div style={{ background: 'var(--dash-accent)', color: 'white', padding: '0.4rem', borderRadius: '8px' }}>
                 🎥
               </div>
               <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dash-accent)' }}>NOT SCHEDULED</span>
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--dash-accent)' }}>No Upcoming Session</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--dash-text-muted)' }}>Start a quick broadcast instead.</p>
            <button className={styles.storeBtn} style={{ width: '100%', marginTop: '1.25rem' }}>Schedule Now</button>
          </div>
          
          {/* Recent Feedbacks */}
          <div className={styles.dCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Recent Feedback</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '0.5rem' }}>
              <div style={{ padding: '1rem', background: 'var(--dash-bg)', borderRadius: '8px' }}>
                <div style={{ color: 'var(--dash-text)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', fontStyle: 'italic' }}>"No feedback yet."</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
