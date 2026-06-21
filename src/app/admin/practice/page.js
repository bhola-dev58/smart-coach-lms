'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';

export default function AdminPracticeAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Modal for audit logs
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetch('/api/admin/practice/analytics')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setData(json);
        } else {
          setError(json.error || 'Failed to load analytics data');
        }
      })
      .catch(() => setError('Failed to fetch practice analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--dash-text-secondary)' }}>
        <p style={{ fontSize: '2rem' }}>⏳</p>
        <p>Loading practice analytics and telemetry database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>
        <h2>Error Loading Analytics</h2>
        <p>{error}</p>
      </div>
    );
  }

  const { sessions = [], summary = {} } = data || {};

  // Filter Logic
  const filteredSessions = sessions.filter(s => {
    const studentName = s.student?.name || '';
    const studentEmail = s.student?.email || '';
    const subject = s.subject || '';
    const query = searchTerm.toLowerCase();

    const matchesSearch = studentName.toLowerCase().includes(query) ||
      studentEmail.toLowerCase().includes(query) ||
      subject.toLowerCase().includes(query);

    const matchesSubject = selectedSubject === 'All' || s.subject === selectedSubject;
    const matchesClass = selectedClass === 'All' || s.class === selectedClass;
    const matchesDifficulty = selectedDifficulty === 'All' || s.difficulty === selectedDifficulty;

    return matchesSearch && matchesSubject && matchesClass && matchesDifficulty;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Practice Telemetry & Analytics</h2>
        <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
          Monitor student behaviors, integrity violations, and performance metrics across practice sessions.
        </p>
      </div>

      {/* Aggregated Stats Overview */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Session Runs</div>
          <div className={styles.statValue}>{summary.totalSessions || 0}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Average Performance Score</div>
          <div className={styles.statValue}>
            {summary.avgScore !== undefined ? `${Math.round((summary.avgScore / 10) * 100)}%` : '0%'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#666', marginTop: 4 }}>
            Average: {summary.avgScore || 0} / 10 correct answers
          </div>
        </div>
        <div className={styles.statCard} style={{ borderLeft: '4px solid #E74C3C' }}>
          <div className={styles.statLabel} style={{ color: '#E74C3C' }}>Security Violations Logged</div>
          <div className={styles.statValue} style={{ color: '#E74C3C' }}>{summary.totalViolations || 0}</div>
          <div style={{ fontSize: '0.78rem', color: '#666', marginTop: 4 }}>
            Includes tab switches & exiting fullscreen
          </div>
        </div>
      </div>

      {/* Subject Wise Performance */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard} style={{ gridColumn: 'span 3' }}>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700 }}>Performance by Subject</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {(summary.subjectBreakdown || []).map(sub => (
              <div key={sub._id} style={{ padding: '1rem', background: '#F8F9FB', border: '1px solid #E5E7EB', borderRadius: '10px' }}>
                <div style={{ fontWeight: 700, color: '#1B2B6B', textTransform: 'capitalize' }}>
                  {sub._id.toLowerCase()}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '6px 0' }}>
                  {Math.round((sub.avgScore / 10) * 100)}% avg
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                  {sub.count} session{sub.count !== 1 ? 's' : ''} run
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sessions History Table & Filters */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        
        {/* Filter Toolbar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              placeholder="Search student or subject..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                outline: 'none',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              style={{ padding: '0.65rem 1rem', border: '1px solid #D1D5DB', borderRadius: '8px', outline: 'none', fontSize: '0.9rem' }}
            >
              <option value="All">All Subjects</option>
              <option value="MATHS">Maths</option>
              <option value="SCIENCE">Science</option>
              <option value="COMMERCE">Commerce</option>
              <option value="ARTS">Arts</option>
              <option value="GENERAL">General Knowledge</option>
            </select>
          </div>

          <div>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              style={{ padding: '0.65rem 1rem', border: '1px solid #D1D5DB', borderRadius: '8px', outline: 'none', fontSize: '0.9rem' }}
            >
              <option value="All">All Classes</option>
              {['6', '7', '8', '9', '10', '11', '12'].map(c => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              style={{ padding: '0.65rem 1rem', border: '1px solid #D1D5DB', borderRadius: '8px', outline: 'none', fontSize: '0.9rem' }}
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E5E7EB', color: '#4B5563', fontWeight: 600 }}>
                <th style={{ padding: '0.75rem 1rem' }}>Date & Time</th>
                <th style={{ padding: '0.75rem 1rem' }}>Student</th>
                <th style={{ padding: '0.75rem 1rem' }}>Topic Target</th>
                <th style={{ padding: '0.75rem 1rem' }}>Score</th>
                <th style={{ padding: '0.75rem 1rem' }}>Time Taken</th>
                <th style={{ padding: '0.75rem 1rem' }}>Violations</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>
                    No matching practice records found.
                  </td>
                </tr>
              ) : (
                filteredSessions.map(session => {
                  const date = new Date(session.completedAt).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  });
                  const mins = Math.floor(session.timeTakenSeconds / 60);
                  const secs = session.timeTakenSeconds % 60;
                  const scorePercent = Math.round((session.score / session.totalQuestions) * 100);

                  return (
                    <tr key={session._id} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '1rem', color: '#4B5563' }}>{date}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600, color: '#1A1A1A' }}>{session.student?.name || 'Unknown User'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{session.student?.email || ''}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ fontWeight: 600, color: '#1B2B6B' }}>{session.subject}</span>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>Class {session.class} · {session.difficulty}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 700, color: scorePercent >= 70 ? '#27AE60' : scorePercent >= 40 ? '#F5A623' : '#E74C3C' }}>
                          {session.score} / {session.totalQuestions} ({scorePercent}%)
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#4B5563' }}>
                        {mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {session.violationsCount > 0 ? (
                          <span style={{ background: 'rgba(231,76,60,0.1)', color: '#E74C3C', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 700 }}>
                            ⚠️ {session.violationsCount} violations
                          </span>
                        ) : (
                          <span style={{ color: '#27AE60', fontSize: '0.78rem', fontWeight: 700 }}>✓ Secure</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedSession(session)}
                          style={{
                            padding: '0.45rem 0.85rem',
                            background: '#1B2B6B',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                          }}
                        >
                          👁️ Telemetry Logs
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TELEMETRY AUDIT TRAIL MODAL */}
      {selectedSession && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            width: '100%', maxWidth: '640px',
            maxHeight: '85vh',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Student Telemetry Audit Trail</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#6B7280' }}>
                  Student: {selectedSession.student?.name} ({selectedSession.student?.email})
                </p>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, background: '#F8F9FB' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                {/* Session specs */}
                <div style={{ background: '#FFFFFF', padding: '1rem', border: '1px solid #E5E7EB', borderRadius: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div><strong>Subject:</strong> {selectedSession.subject}</div>
                  <div><strong>Class target:</strong> {selectedSession.class}</div>
                  <div><strong>Difficulty:</strong> {selectedSession.difficulty}</div>
                  <div><strong>Total Score:</strong> {selectedSession.score} / {selectedSession.totalQuestions}</div>
                  <div><strong>Violations count:</strong> {selectedSession.violationsCount}</div>
                  <div><strong>Duration:</strong> {Math.floor(selectedSession.timeTakenSeconds / 60)}m {selectedSession.timeTakenSeconds % 60}s</div>
                </div>

                <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', color: '#4B5563', letterSpacing: '0.05em' }}>
                  Movement Timeline Logs
                </h4>

                {/* Timeline trace */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {!selectedSession.movements || selectedSession.movements.length === 0 ? (
                    <p style={{ color: '#9CA3AF', fontSize: '0.85rem', fontStyle: 'italic' }}>No movement telemetry recorded during this session.</p>
                  ) : (
                    selectedSession.movements.map((move, idx) => {
                      const isViolation = move.event.toLowerCase().includes('violation') ||
                        move.event.toLowerCase().includes('exited') ||
                        move.event.toLowerCase().includes('switch') ||
                        move.event.toLowerCase().includes('blur') ||
                        move.event.toLowerCase().includes('blocked');

                      const isImportant = move.event.toLowerCase().includes('started') ||
                        move.event.toLowerCase().includes('completed');

                      return (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem',
                          background: isViolation ? 'rgba(231,76,60,0.06)' : '#FFFFFF',
                          border: isViolation ? '1px solid rgba(231,76,60,0.2)' : '1px solid #E5E7EB',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                        }}>
                          <div style={{
                            fontSize: '1rem',
                            flexShrink: 0
                          }}>
                            {isViolation ? '⚠️' : isImportant ? '🎯' : '📝'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: (isViolation || isImportant) ? 700 : 500, color: isViolation ? '#E74C3C' : '#1F2937' }}>
                              {move.event}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '2px' }}>
                              {new Date(move.timestamp).toLocaleTimeString('en-IN')} ({new Date(move.timestamp).toLocaleDateString('en-IN')})
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '1.25rem', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', background: '#F8F9FB' }}>
              <button
                onClick={() => setSelectedSession(null)}
                style={{ padding: '0.6rem 1.5rem', background: '#1B2B6B', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
