'use client';

import { useState } from 'react';
import { createAssignment } from '@/app/actions/assignmentActions';

export default function AssignmentDashboardClient({ courses, activeAssignments, pastAssignments }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const res = await createAssignment(formData);

    if (res.success) {
      setIsModalOpen(false);
      e.target.reset();
    } else {
      setError(res.error || 'Failed to create assignment');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--dash-text)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            Assignments & Grading
          </h1>
          <p style={{ color: 'var(--dash-text-secondary)', fontSize: '0.9rem' }}>
            Create written tasks, set deadlines, and evaluate student submissions.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{
            background: 'var(--color-primary)', color: 'white', border: 'none',
            padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
          }}
        >
          + Create Assignment
        </button>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ background: 'var(--dash-surface)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid var(--dash-border)' }}>
            <h2 style={{ color: 'var(--dash-text)', marginBottom: '1.5rem' }}>Create Assignment</h2>
            {error && <div style={{ color: 'white', background: '#e74c3c', padding: '0.5rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
            
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Assignment Title</label>
                <input type="text" name="title" required placeholder="e.g., Chapter 2 End Exercise" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Target Course</label>
                <select name="courseId" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)' }}>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Due Date</label>
                  <input type="datetime-local" name="dueDate" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Total Marks</label>
                  <input type="number" name="totalMarks" defaultValue="100" min="10" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.75rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  {loading ? 'Publishing...' : 'Assign to Students'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: 'var(--dash-text)', border: '1px solid var(--dash-border)', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENDER LIST */}
      <h2 style={{ color: 'var(--dash-text)', fontSize: '1.2rem', marginBottom: '1rem' }}>Active Assignments</h2>
      {activeAssignments.length === 0 ? (
        <div style={{ background: 'var(--dash-surface)', border: '1px dashed var(--dash-border)', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', margin: '0 0 1rem 0', opacity: 0.8 }}>📝</div>
          <h3 style={{ color: 'var(--dash-text)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Active Assignments</h3>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.9rem' }}>You haven't assigned any active tasks.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {activeAssignments.map((a, idx) => (
            <div key={idx} style={{ background: 'var(--dash-surface)', border: '1px solid var(--dash-border)', borderRadius: '12px', padding: '1.5rem', boxShadow: 'var(--dash-shadow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <h3 style={{ color: 'var(--dash-text)', fontSize: '1.1rem', marginBottom: '0.2rem' }}>{a.title}</h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f39c12', background: 'rgba(243,156,18,0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                  ACTIVE
                </span>
              </div>
              <p style={{ color: 'var(--dash-text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Course: <strong>{a.courseTitle}</strong><br/>
                Due Date: <strong style={{ color: 'var(--dash-text)' }}>{new Date(a.dueDate).toLocaleDateString('en-IN')}</strong><br/>
                Max Marks: <strong>{a.totalMarks}</strong>
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', background: 'var(--dash-bg)', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--dash-text)' }}>{a.totalSubmissions}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--dash-text-muted)' }}>SUBMITTED</div>
                </div>
                <div style={{ width: '1px', height: '30px', background: 'var(--dash-border)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2ed573' }}>{a.gradedSubmissions}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--dash-text-muted)' }}>GRADED</div>
                </div>
                <div style={{ width: '1px', height: '30px', background: 'var(--dash-border)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>{a.totalSubmissions - a.gradedSubmissions}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--dash-text-muted)' }}>PENDING</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button style={{ flex: 1, padding: '0.6rem', background: 'var(--dash-accent-light)', color: 'var(--dash-accent)', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                  Grade Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pastAssignments.length > 0 && (
        <>
          <h2 style={{ color: 'var(--dash-text)', fontSize: '1.2rem', marginBottom: '1rem' }}>Past Assignments</h2>
          <div style={{ overflowX: 'auto', background: 'var(--dash-surface)', borderRadius: '12px', border: '1px solid var(--dash-border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--dash-border)', background: 'var(--dash-bg)' }}>
                  <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Title</th>
                  <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Course</th>
                  <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Due Date</th>
                  <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>Graded</th>
                </tr>
              </thead>
              <tbody>
                {pastAssignments.map((a, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--dash-border)' }}>
                    <td style={{ padding: '1rem', color: 'var(--dash-text)', fontSize: '0.9rem', fontWeight: 500 }}>{a.title}</td>
                    <td style={{ padding: '1rem', color: 'var(--dash-text-muted)', fontSize: '0.85rem' }}>{a.courseTitle}</td>
                    <td style={{ padding: '1rem', color: 'var(--dash-text-muted)', fontSize: '0.85rem' }}>{new Date(a.dueDate).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center', color: a.totalSubmissions === a.gradedSubmissions && a.totalSubmissions > 0 ? '#2ed573' : 'var(--dash-text)' }}>
                      {a.gradedSubmissions} / {a.totalSubmissions}
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
