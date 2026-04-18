'use client';

import { useState, useEffect } from 'react';

export default function AssignmentDropzone({ lesson, courseId, onComplete }) {
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState('pending'); // pending, submitted, graded
  const [marks, setMarks] = useState(null);
  
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // Fetch existing submission on mount
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        // We can fetch via general submissions API (assuming GET /api/lms/assignments?courseId=X&lessonSlug=Y exists or we use a custom fetch)
        // Since we only built POST, I will add GET handling in the route if needed. 
        // For now, if we don't have GET, it will just show pending until submitted.
        const res = await fetch(`/api/lms/assignments?courseId=${courseId}&lessonSlug=${lesson.slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.submission) {
            setStatus(data.submission.status);
            setSubmissionUrl(data.submission.fileUrl);
            setMarks(data.submission.marksAwarded);
          }
        }
      } catch (err) {
        console.error('Failed to fetch assignment submission', err);
      }
    };
    fetchSubmission();
  }, [courseId, lesson.slug]);

  const submitAssignment = async () => {
    if (!submissionUrl.trim()) return;
    setIsUploading(true);

    try {
      // Submit URL to our Database
      const res = await fetch('/api/lms/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId,
          lessonSlug: lesson.slug,
          fileUrl: submissionUrl, // we renamed fileUrl to store string URL
          content: 'Submitted via URL'
        })
      });

      const data = await res.json();
      if (data.success) {
        setStatus('submitted');
        setShowSubmitModal(false);
        if (onComplete) onComplete();
      } else {
        alert('Failed to submit assignment');
      }
    } catch (error) {
      console.error(error);
      alert('Error submitting');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{
      padding: '0.75rem 1rem 1rem 1rem',
      backgroundColor: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: status === 'pending' ? '#f1c40f' : '#2ecc71', fontWeight: 600 }}>
        <span>{status === 'pending' ? '🟡' : '🟢'}</span>
        <span>{status === 'pending' ? 'Pending' : (status === 'graded' ? 'Completed' : 'Under Review')}</span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
        <button 
          onClick={(e) => { e.stopPropagation(); setShowViewModal(true); }}
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '20px',
            border: '1px solid var(--color-primary)',
            background: 'transparent',
            color: 'var(--color-primary)',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            flex: 1
          }}
        >
          View Task
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); setShowSubmitModal(true); }}
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '20px',
            border: 'none',
            background: 'var(--color-primary)',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            flex: 1
          }}
        >
          {status === 'pending' ? 'Submit' : 'Update'}
        </button>
      </div>

      {/* --- View Task Modal --- */}
      {showViewModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'white', color: '#333', width: '90%', maxWidth: '600px',
            borderRadius: '12px', padding: '2rem', position: 'relative', textAlign: 'left'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-primary)' }}>{lesson.title} - Description</h3>
            <div dangerouslySetInnerHTML={{ __html: lesson.content }} style={{ lineHeight: 1.6, marginBottom: '2rem' }} />
            <div style={{ textAlign: 'right' }}>
              <button 
                onClick={() => setShowViewModal(false)}
                style={{ padding: '0.6rem 1.5rem', border: 'none', background: '#e0e0e0', color: '#333', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Submit Task Modal --- */}
      {showSubmitModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'white', color: '#333', width: '90%', maxWidth: '500px',
            borderRadius: '12px', padding: '2rem', position: 'relative', textAlign: 'left'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', color: 'var(--color-primary)' }}>{lesson.title} (Submission)</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: status === 'pending' ? '#e67e22' : '#2ecc71', fontWeight: 600 }}>
              <span>{status === 'pending' ? '⚠️' : '✅'}</span>
              <span>{status === 'pending' ? 'Pending' : (status === 'graded' ? 'Completed' : 'Submitted')}</span>
            </div>

            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.95rem', color: '#555', lineHeight: 1.5 }}>
              {status === 'pending' 
                ? "You haven't submitted this assignment yet. Please submit the link as per the process mentioned in the assignment. Make sure the link is publicly accessible."
                : "You have already submitted this assignment. You can update the link below if your instructor hasn't graded it yet."}
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#555' }}>
                Submission URL
              </label>
              <input 
                type="text" 
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                placeholder="https://github.com/..."
                disabled={status === 'graded'}
                style={{
                  width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #ccc',
                  background: status === 'graded' ? '#f5f5f5' : 'white', fontSize: '1rem', color: '#333'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={() => setShowSubmitModal(false)}
                style={{ padding: '0.6rem 1.5rem', border: 'none', background: 'rgba(142,68,173,0.1)', color: 'var(--color-primary)', borderRadius: '25px', cursor: 'pointer', fontWeight: 600 }}
              >
                Close
              </button>
              <button 
                onClick={submitAssignment}
                disabled={!submissionUrl.trim() || isUploading || status === 'graded'}
                style={{ 
                  padding: '0.6rem 1.5rem', border: 'none', background: 'var(--color-primary)', color: 'white', 
                  borderRadius: '25px', cursor: (!submissionUrl.trim() || status === 'graded') ? 'not-allowed' : 'pointer', fontWeight: 600,
                  opacity: (!submissionUrl.trim() || status === 'graded') ? 0.6 : 1
                }}
              >
                {isUploading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
