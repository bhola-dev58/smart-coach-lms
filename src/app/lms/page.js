'use client';

import { useState, useEffect } from 'react';
import DashboardContent from '@/components/lms/DashboardContent';

export default function LMSDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch('/api/lms/enrollments');
        const data = await res.json();
        if (data.success) {
          setEnrolledCourses(data.enrollments || []);
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
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardContent
      enrolledCourses={enrolledCourses}
      leaderboard={[]}
    />
  );
}
