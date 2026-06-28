'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import UiIcon from '@/components/common/UiIcon';

export default function InstructorRootPage() {
  const [stats, setStats] = useState(null);
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/instructor/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
          setRecentCourses(data.recentCourses || []);
        } else {
          setError(data.error || 'Failed to load stats');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch statistics');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Skeletons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              height: '130px',
              borderRadius: 'var(--dash-radius, 12px)',
              background: 'var(--dash-surface)',
              border: '1px solid var(--dash-border)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              opacity: 0.7,
              animation: 'pulse-dashboard 1.5s infinite ease-in-out'
            }} />
          ))}
        </div>
        <div style={{ height: '300px', background: 'var(--dash-surface)', border: '1px solid var(--dash-border)', borderRadius: '12px', opacity: 0.7, animation: 'pulse-dashboard 1.5s infinite ease-in-out' }} />
        <style>{`
          @keyframes pulse-dashboard {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.85; }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            marginTop: '1rem',
            padding: '0.6rem 1.5rem',
            background: 'var(--color-primary, #3b82f6)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Courses',
      value: stats?.totalCourses || 0,
      href: '/lms/instructor/courses',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
      color: '#3b82f6',
      bgLight: 'rgba(59,130,246,0.1)',
    },
    {
      title: 'Active Batches',
      value: stats?.totalBatches || 0,
      href: '/lms/instructor/batches',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      color: '#10b981',
      bgLight: 'rgba(16,185,129,0.1)',
    },
    {
      title: 'Active Students',
      value: stats?.totalEnrollments || 0,
      href: '/lms/instructor/enrollments',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <polyline points="16 11 18 13 22 9" />
        </svg>
      ),
      color: '#8b5cf6',
      bgLight: 'rgba(139,92,246,0.1)',
    },
    {
      title: 'Upcoming Classes',
      value: stats?.upcomingLive || 0,
      href: '/lms/instructor/livesessions',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      ),
      color: '#f59e0b',
      bgLight: 'rgba(245,158,11,0.1)',
    },
    {
      title: 'Pending Submissions',
      value: stats?.pendingSubmissions || 0,
      href: '/lms/instructor/assignmentsubmissions',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
      color: '#ec4899',
      bgLight: 'rgba(236,72,153,0.1)',
    },
    {
      title: 'Course Rating',
      value: `${stats?.avgRating || 4.8} ★`,
      href: '/lms/instructor/reviews',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      color: '#f97316',
      bgLight: 'rgba(249,115,22,0.1)',
    }
  ];

  return (
    <div className="dash-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <style>{`
        .dash-container {
          padding: 1.5rem;
          box-sizing: border-box;
          width: 100%;
        }
        .dash-card {
          background: var(--dash-surface);
          border: 1px solid var(--dash-border);
          border-radius: var(--dash-radius, 12px);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-decoration: none;
          color: inherit;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .dash-card:hover {
          transform: translateY(-4px);
          border-color: var(--color-primary, #3b82f6);
          box-shadow: 0 12px 20px -8px rgba(0,0,0,0.15);
        }
        .dash-quick-link {
          background: var(--dash-surface);
          border: 1px solid var(--dash-border);
          border-radius: 8px;
          padding: 0.85rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--dash-text);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .dash-quick-link:hover {
          background: var(--color-primary);
          color: white !important;
          border-color: var(--color-primary);
        }
        .dash-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          border: 1px solid var(--dash-border);
        }
        .dash-table th {
          padding: 0.75rem 1rem;
          color: var(--dash-text-secondary);
          font-size: 0.8rem;
          font-weight: 600;
          border-bottom: 1px solid var(--dash-border);
          border-right: 1px solid var(--dash-border);
        }
        .dash-table th:last-child {
          border-right: none;
        }
        .dash-table td {
          padding: 0.75rem 1rem;
          color: var(--dash-text);
          font-size: 0.85rem;
          border-bottom: 1px solid var(--dash-border);
          border-right: 1px solid var(--dash-border);
        }
        .dash-table td:last-child {
          border-right: none;
        }
        @media (max-width: 768px) {
          .dash-container {
            padding: 1rem;
            gap: 1.25rem !important;
          }
          .dash-card {
            padding: 1.25rem;
          }
          .dash-quick-link {
            width: 100%;
            justify-content: center;
          }
          .dash-table th, .dash-table td {
            padding: 0.6rem 0.5rem;
            font-size: 0.8rem;
          }
        }
      `}</style>

      {/* Stats Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {statCards.map((card, idx) => (
          <Link key={idx} href={card.href} className="dash-card">
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--dash-text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                {card.title}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dash-text)' }}>
                {card.value}
              </div>
            </div>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: card.bgLight,
              color: card.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {card.icon}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Action Shortcuts */}
      <div>
        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--dash-text)', fontSize: '1rem', fontWeight: 700 }}>
          ⚡ Quick Actions
        </h4>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/lms/instructor/courses" className="dash-quick-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add New Course
          </Link>
          <Link href="/lms/instructor/livesessions" className="dash-quick-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path><path d="M12 7v5l3 3"></path></svg>
            Schedule Live Class
          </Link>
          <Link href="/lms/instructor/studymaterials" className="dash-quick-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Upload Study Material
          </Link>
          <Link href="/lms/instructor/batches" className="dash-quick-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
            Create New Batch
          </Link>
        </div>
      </div>

      {/* Courses Summary List */}
      <div style={{ background: 'var(--dash-surface)', border: '1px solid var(--dash-border)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h4 style={{ margin: 0, color: 'var(--dash-text)', fontSize: '1rem', fontWeight: 700 }}>
            📖 Recent Courses
          </h4>
          <Link href="/lms/instructor/courses" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
            View All Courses →
          </Link>
        </div>

        {recentCourses.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--dash-text-muted)', fontSize: '0.9rem' }}>
            No courses created yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th style={{ width: '55px', textAlign: 'center' }}>S.No.</th>
                  <th>Course Title</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentCourses.map((c, idx) => (
                  <tr key={c.id}>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--dash-text-secondary)' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{c.title}</td>
                    <td>{c.price === 0 ? 'Free' : `₹${c.price}`}</td>
                    <td>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: c.isPublished ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.12)',
                        color: c.isPublished ? '#10b981' : '#64748b'
                      }}>
                        {c.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/lms/instructor/courses?edit=${c.id}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600, marginRight: '1rem', fontSize: '0.85rem' }}>
                        Edit Details
                      </Link>
                      <Link href={`/lms/instructor/courses/${c.id}/builder`} style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
                        Curriculum Builder
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
