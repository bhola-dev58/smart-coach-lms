'use client';

import { useState } from 'react';
import { scheduleLiveSession, deleteLiveSession } from '@/app/actions/liveActions';

export default function LiveDashboardClient({ upcoming, past, courses }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSchedule = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const res = await scheduleLiveSession(formData);

    if (res.success) {
      setIsModalOpen(false);
      e.target.reset();
    } else {
      setError(res.error || 'Failed to schedule');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to cancel this scheduled session?")) {
      await deleteLiveSession(id);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--dash-text)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            Live Sessions (Zoom Integration)
          </h1>
          <p style={{ color: 'var(--dash-text-secondary)', fontSize: '0.9rem' }}>
            Schedule and manage your live broadcasts and doubt classes. Real-time mapping to Student Dashboard.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{
            background: 'var(--dash-accent)', color: 'white', border: 'none',
            padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
          }}
        >
          + Schedule New Session
        </button>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ background: 'var(--dash-surface)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid var(--dash-border)' }}>
            <h2 style={{ color: 'var(--dash-text)', marginBottom: '1.5rem' }}>Schedule Live Class</h2>
            {error && <div style={{ color: 'white', background: '#e74c3c', padding: '0.5rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
            
            <form onSubmit={handleSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Topic / Title</label>
                <input type="text" name="title" required placeholder="e.g., Kinematics Doubt Solving" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Target Course</label>
                <select name="courseId" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)' }}>
                  <option value="general">General Session (All Students)</option>
                  {courses.map(c => (
                    <option key={c._id.toString()} value={c._id.toString()}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Date & Time</label>
                  <input type="datetime-local" name="scheduledAt" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Duration (mins)</label>
                  <input type="number" name="duration" defaultValue="60" required min="15" max="180" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.75rem', background: 'var(--dash-accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  {loading ? 'Generating Zoom Link...' : 'Schedule & Publish'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: 'var(--dash-text)', border: '1px solid var(--dash-border)', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rendering logic mapped from Server payload */}
      <h2 style={{ color: 'var(--dash-text)', fontSize: '1.2rem', marginBottom: '1rem' }}>Upcoming Broadcasts</h2>
      {upcoming.length === 0 ? (
        <div style={{ background: 'var(--dash-surface)', border: '1px dashed var(--dash-border)', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', margin: '0 0 1rem 0', opacity: 0.8 }}>🎥</div>
          <h3 style={{ color: 'var(--dash-text)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Upcoming Sessions</h3>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>Schedule a session to instantly notify students and generate Zoom links.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {upcoming.map((s, idx) => (
            <div key={idx} style={{ background: 'var(--dash-surface)', border: '1px solid var(--dash-accent)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(220,53,69,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white', background: 'var(--dash-accent)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>UPCOMING</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--dash-text-secondary)' }}>{s.duration} mins</span>
              </div>
              <h3 style={{ color: 'var(--dash-text)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{s.title}</h3>
              <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Course: <strong>{s.courseTitle}</strong><br/>
                Time: <strong>{new Date(s.scheduledAt).toLocaleString('en-IN')}</strong><br/>
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <a href={s.joinUrl} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '0.6rem', background: 'var(--dash-accent)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>
                  Open Zoom Host Room
                </a>
                <button onClick={() => handleDelete(s._id)} style={{ padding: '0.6rem 1rem', background: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>
                  Cancel
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
                    <td style={{ padding: '1rem', color: 'var(--dash-text-muted)', fontSize: '0.85rem' }}>{s.courseTitle}</td>
                    <td style={{ padding: '1rem', color: 'var(--dash-text-muted)', fontSize: '0.85rem' }}>{new Date(s.scheduledAt).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>
                      <span style={{ background: s.status === 'completed' ? 'rgba(46,213,115,0.1)' : 'rgba(243,156,18,0.1)', color: s.status === 'completed' ? '#2ed573' : '#f39c12', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
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
