'use client';

import { useState, useEffect } from 'react';
import DashboardContent from '@/components/lms/DashboardContent';

export default function LMSDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch('/api/lms/enrollments');
        const data = await res.json();
        if (data.success) {
          setEnrolledCourses(data.enrollments || []);
        }

        const sessRes = await fetch('/api/lms/live-sessions');
        const sessData = await sessRes.json();
        if (sessData.success) {
          setLiveSessions(sessData.sessions || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', color: '#a0a0a0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardContent
      enrolledCourses={enrolledCourses}
      leaderboard={[]}
      liveSessions={liveSessions}
    />
  );
}
