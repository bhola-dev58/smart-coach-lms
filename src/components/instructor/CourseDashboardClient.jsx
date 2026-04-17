'use client';

import { useState } from 'react';
import { createCourseDraft, updateCourse } from '@/app/actions/courseActions';
import Link from 'next/link';

export default function CourseDashboardClient({ courses }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const res = await createCourseDraft(formData);

    if (res.success) {
      setIsModalOpen(false);
      e.target.reset();
      // Optionally redirect to edit page `/instructor/courses/${res.courseId}/edit`
      // but for now, the list simply re-renders from server action revalidatePath.
    } else {
      setError(res.error || 'Failed to create course');
    }
    setLoading(false);
  };

  const handlePublishToggle = async (courseId, currentStatus) => {
    await updateCourse(courseId, { isPublished: !currentStatus });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--dash-text)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            Course Management
          </h1>
          <p style={{ color: 'var(--dash-text-secondary)', fontSize: '0.9rem' }}>
            Manage your courses, edit curriculum, and sync with the Student Store.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{
            background: 'var(--color-primary)', color: 'white', border: 'none',
            padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
          }}
        >
          + Create New Course
        </button>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)',
          zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'
        }}>
          <div style={{ background: 'var(--dash-surface)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '600px', border: '1px solid var(--dash-border)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ color: 'var(--dash-text)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Create New Course Draft</span>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--dash-text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </h2>
            {error && <div style={{ color: 'white', background: '#e74c3c', padding: '0.5rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
            
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Course Title</label>
                <input type="text" name="title" required placeholder="e.g., Advanced JavaScript Algorithms" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)' }} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Category</label>
                  <select name="category" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)' }}>
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="ECE">Electronics (ECE)</option>
                    <option value="MECH">Mechanical Eng.</option>
                    <option value="CIVIL">Civil Eng.</option>
                    <option value="GATE">GATE Prep</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Price (₹)</label>
                  <input type="number" name="price" defaultValue="999" required min="0" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Short Subtitle</label>
                <input type="text" name="shortDescription" required placeholder="A 2-line catchy subtitle for the store card..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.75rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  {loading ? 'Setting up...' : 'Create Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {courses.length === 0 ? (
        <div style={{ 
          background: 'var(--dash-surface)', border: '1px dashed var(--dash-border)', 
          borderRadius: '12px', padding: '4rem 2rem', textAlign: 'center' 
        }}>
          <div style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>📂</div>
          <h3 style={{ color: 'var(--dash-text)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Courses Yet</h3>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            You haven't created any courses. Start tracking your syllabus and upload videos.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {courses.map(course => (
            <div key={course._id.toString()} style={{
              background: 'var(--dash-surface)', border: '1px solid var(--dash-border)',
              borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--dash-shadow)'
            }}>
              <div style={{
                height: '160px', background: 'linear-gradient(135deg, var(--dash-surface), var(--dash-bg))',
                position: 'relative'
              }}>
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--dash-text-muted)', fontSize: '2rem' }}>📺</div>
                )}
                
                {/* Publish Toggle Button */}
                <button 
                  onClick={() => handlePublishToggle(course._id, course.isPublished)}
                  style={{
                    position: 'absolute', top: '0.75rem', right: '0.75rem',
                    background: course.isPublished ? '#2ed573' : '#f39c12',
                    color: 'white', padding: '0.3rem 0.8rem', border: 'none',
                    borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                  }}>
                  {course.isPublished ? '🔴 REVOKE' : '🟢 PUBLISH NOW'}
                </button>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--dash-accent)', fontSize: '0.75rem', fontWeight: 700 }}>{course.category}</span>
                  <span style={{ color: course.isPublished ? '#2ed573' : '#f39c12', fontSize: '0.75rem', fontWeight: 700 }}>
                    {course.isPublished ? 'IN STORE' : 'DRAFT'}
                  </span>
                </div>
                
                <h3 style={{ color: 'var(--dash-text)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {course.title}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--dash-text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                   <span>{course.totalStudents || 0} Students</span>
                   <span style={{ fontWeight: 600 }}>₹{course.price.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{ 
                    flex: 1, padding: '0.5rem', background: 'var(--dash-bg)', color: 'var(--dash-text)',
                    border: '1px solid var(--dash-border)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                  }}>
                    Add Lessons
                  </button>
                  <button style={{ 
                    flex: 1, padding: '0.5rem', background: 'var(--dash-bg)', color: 'var(--dash-text)',
                    border: '1px solid var(--dash-border)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                  }}>
                    Upload Thumbnail
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
