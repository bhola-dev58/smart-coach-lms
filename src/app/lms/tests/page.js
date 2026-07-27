'use client';

import { useState, useEffect } from 'react';
import styles from '@/app/lms/lms.module.css';

export default function MyTestSeriesPage() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [content, setContent] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/lms/assignments/list');
      const data = await res.json();
      if (data.success) {
        setAssignments(data.assignments || []);
        setSubmissions(data.submissions || []);
      } else {
        setError(data.error || 'Failed to load assignments');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeAssignment) return;
    setSubmitting(true);
    setSuccessMsg('');
    try {
      const res = await fetch('/api/lms/assignments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: activeAssignment._id,
          fileUrl,
          content
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Assignment submitted successfully!');
        setFileUrl('');
        setContent('');
        // Refresh list
        await fetchAssignments();
        setTimeout(() => {
          setActiveAssignment(null);
          setSuccessMsg('');
        }, 1500);
      } else {
        alert(data.error || 'Submission failed');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during submission');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--dash-text-muted)' }}>
        <p style={{ fontSize: 16 }}>Loading assignments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#e74c3c' }}>
        <p>{error}</p>
      </div>
    );
  }

  // Map submissions by assignment ID
  const subMap = {};
  submissions.forEach(s => {
    if (s.assignment) {
      subMap[s.assignment.toString()] = s;
    }
  });

  const now = new Date();

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      {assignments.length === 0 ? (
        <div style={{ background: 'var(--dash-surface)', border: '1px dashed var(--dash-border)', borderRadius: '12px', padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>📝</div>
          <h3 style={{ color: 'var(--dash-text)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>No pending assignments</h3>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.9rem' }}>
            Instructors haven't assigned any tests for your enrolled courses yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {assignments.map(a => {
            const sub = subMap[a._id.toString()];
            const isLate = new Date(a.dueDate) < now;
            
            const isAccepted = sub && (sub.status === 'graded' || sub.status === 'accepted' || (sub.marksAwarded !== null && sub.marksAwarded !== undefined));
            const isRejected = sub && sub.status === 'rejected';
            const isPendingReview = sub && !isAccepted && !isRejected;

            let statusLabel = 'PENDING';
            let statusColor = '#f39c12'; // default amber/orange

            if (sub) {
              if (isAccepted) {
                statusLabel = 'ACCEPTED & GRADED';
                statusColor = '#2ed573'; // Green
              } else if (isRejected) {
                statusLabel = 'REJECTED';
                statusColor = '#ef4444'; // Red
              } else {
                statusLabel = 'REVIEW PENDING';
                statusColor = '#f59e0b'; // Amber / Yellow
              }
            } else if (isLate) {
              statusLabel = 'OVERDUE';
              statusColor = '#ef4444'; // Red
            }

            return (
              <div key={a._id.toString()} style={{ background: 'var(--dash-surface)', border: `1px solid ${statusColor}`, borderRadius: '12px', padding: '1.5rem', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.4rem 0.8rem', background: statusColor, color: 'white', fontSize: '0.7rem', fontWeight: 700, borderBottomLeftRadius: '8px', letterSpacing: '0.03em' }}>
                  {statusLabel}
                </div>
                
                <div style={{ fontSize: '0.8rem', color: 'var(--dash-text-muted)', marginBottom: '0.5rem', paddingRight: '60px' }}>{a.course?.title}</div>
                <h3 style={{ color: 'var(--dash-text)', fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 700 }}>{a.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-secondary)', marginBottom: '0.75rem', flex: 1 }}>{a.description}</p>
                
                {a.fileUrl && (
                  <a
                    href={a.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: 'var(--dash-accent, #3b82f6)',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      marginBottom: '1rem',
                      width: 'fit-content',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    📄 Open Assignment PDF / File
                  </a>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--dash-text-secondary)', marginBottom: '1.25rem', borderTop: '1px dashed var(--dash-border)', paddingTop: '0.75rem' }}>
                  <span>Due: {new Date(a.dueDate).toLocaleDateString('en-IN')}</span>
                  <span>Marks: {a.totalMarks}</span>
                </div>

                {isAccepted ? (
                  <div style={{ background: 'rgba(46, 213, 115, 0.12)', border: '1px solid rgba(46, 213, 115, 0.35)', padding: '0.9rem', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#2ed573', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                      <span>✅</span> Assignment Accepted & Graded
                    </div>
                    {sub.marksAwarded !== null && sub.marksAwarded !== undefined && (
                      <div style={{ fontSize: '1rem', color: 'var(--dash-text)', fontWeight: 800, marginTop: '0.3rem' }}>
                        Score: {sub.marksAwarded} / {a.totalMarks || 100}
                      </div>
                    )}
                    {sub.feedback && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--dash-text-secondary)', marginTop: '0.4rem', fontStyle: 'italic', background: 'rgba(255,255,255,0.04)', padding: '0.4rem 0.6rem', borderRadius: '6px' }}>
                        💬 Instructor Feedback: "{sub.feedback}"
                      </div>
                    )}
                  </div>
                ) : isPendingReview ? (
                  <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '0.9rem', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                      <span>⏳</span> Review Pending
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--dash-text-muted)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                      Your submission has been received. Waiting for instructor evaluation.
                    </div>
                    <button
                      onClick={() => {
                        setFileUrl(sub.fileUrl || '');
                        setContent(sub.content || '');
                        setActiveAssignment(a);
                      }}
                      style={{
                        marginTop: '0.6rem',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        background: 'transparent',
                        color: '#f59e0b',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ✏️ Update Submission
                    </button>
                  </div>
                ) : isRejected ? (
                  <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', padding: '0.9rem', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                      <span>❌</span> Revision Required / Rejected
                    </div>
                    {sub.feedback && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--dash-text-secondary)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                        Feedback: "{sub.feedback}"
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setFileUrl(sub.fileUrl || '');
                        setContent(sub.content || '');
                        setActiveAssignment(a);
                      }}
                      style={{
                        marginTop: '0.6rem',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#ef4444',
                        color: 'white',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      🔄 Resubmit Assignment
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setActiveAssignment(a)}
                    style={{ width: '100%', padding: '0.75rem', background: statusColor, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = 0.9; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = 1; }}
                  >
                    {isLate ? 'Submit Late' : 'Start Task'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modern Dialog/Modal for Submission */}
      {activeAssignment && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          backdropFilter: 'blur(4px)', animation: 'fadeIn 0.25s ease'
        }}>
          <div style={{
            background: 'var(--dash-surface)', width: '100%', maxWidth: '500px',
            borderRadius: '16px', border: '1px solid var(--dash-border)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', padding: '2rem',
            position: 'relative', animation: 'slideUp 0.3s ease'
          }}>
            <button 
              onClick={() => setActiveAssignment(null)}
              style={{
                position: 'absolute', top: '1.25rem', right: '1.25rem',
                background: 'none', border: 'none', fontSize: '1.5rem',
                color: 'var(--dash-text-muted)', cursor: 'pointer', padding: '4px'
              }}
            >
              ×
            </button>

            <h3 style={{ color: 'var(--dash-text)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Submit Assignment
            </h3>
            <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
              {activeAssignment.course?.title}
            </p>

            <div style={{ background: 'var(--dash-bg)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--dash-text)', marginBottom: '0.25rem' }}>
                {activeAssignment.title}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--dash-text-secondary)', margin: '0 0 0.75rem 0' }}>
                {activeAssignment.description}
              </p>
              {activeAssignment.fileUrl && (
                <a
                  href={activeAssignment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    background: 'var(--color-primary, #3b82f6)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.82rem',
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                    marginTop: '0.25rem',
                  }}
                >
                  📄 View / Download Task PDF
                </a>
              )}
            </div>

            {successMsg ? (
              <div style={{ background: 'rgba(46,213,115,0.1)', color: '#2ed573', padding: '1rem', borderRadius: '8px', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
                🎉 {successMsg}
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--dash-text-secondary)', marginBottom: '0.4rem' }}>
                    Submission Content / Text Notes (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Write your explanation or notes here..."
                    style={{
                      width: '100%', padding: '0.75rem', borderRadius: '8px',
                      border: '1px solid var(--dash-border)', background: 'var(--dash-bg)',
                      color: 'var(--dash-text)', fontSize: '0.85rem', outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--dash-text-secondary)', marginBottom: '0.4rem' }}>
                    File URL (e.g. Google Drive Link) <span style={{ color: '#e74c3c' }}>*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={fileUrl}
                    onChange={e => setFileUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    style={{
                      width: '100%', padding: '0.75rem', borderRadius: '8px',
                      border: '1px solid var(--dash-border)', background: 'var(--dash-bg)',
                      color: 'var(--dash-text)', fontSize: '0.85rem', outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setActiveAssignment(null)}
                    style={{
                      flex: 1, padding: '0.75rem', border: '1px solid var(--dash-border)',
                      borderRadius: '8px', background: 'transparent', color: 'var(--dash-text)',
                      fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      flex: 1, padding: '0.75rem', border: 'none', borderRadius: '8px',
                      background: 'var(--color-primary)', color: 'white',
                      fontWeight: 600, cursor: 'pointer', opacity: submitting ? 0.7 : 1
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Inline styles for modal animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
