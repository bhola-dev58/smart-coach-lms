'use client';

import { useState } from 'react';
import { uploadStudyMaterial, deleteStudyMaterial } from '@/app/actions/materialActions';

export default function MaterialDashboardClient({ courses, materials }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    // Note: In real production, file URL comes from S3. Here we simulate direct DB save with a link.
    const res = await uploadStudyMaterial(formData);

    if (res.success) {
      setIsModalOpen(false);
      e.target.reset();
    } else {
      setError(res.error || 'Failed to upload material');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this material?')) {
      await deleteStudyMaterial(id);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--dash-text)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            Study Materials
          </h1>
          <p style={{ color: 'var(--dash-text-secondary)', fontSize: '0.9rem' }}>
            Upload PDFs, notes, and resources. They will instantly appear on your students' LMS dashboard.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{
            background: 'var(--dash-accent)', color: 'white', border: 'none',
            padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
          }}
        >
          + Upload Material
        </button>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ background: 'var(--dash-surface)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid var(--dash-border)' }}>
            <h2 style={{ color: 'var(--dash-text)', marginBottom: '1.5rem' }}>Upload Study Material</h2>
            {error && <div style={{ color: 'white', background: '#e74c3c', padding: '0.5rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
            
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Document Title</label>
                <input type="text" name="title" required placeholder="e.g., Chapter 1 Notes (PDF)" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)' }} />
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
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>File URL (Drive/S3 Link)</label>
                  <input type="url" name="fileUrl" required placeholder="https://..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Type</label>
                  <select name="fileType" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)' }}>
                    <option value="PDF">PDF Document</option>
                    <option value="ZIP">ZIP Archive</option>
                    <option value="IMAGE">Image</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.75rem', background: 'var(--dash-accent)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  {loading ? 'Uploading...' : 'Publish Material'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: 'var(--dash-text)', border: '1px solid var(--dash-border)', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {materials.length === 0 ? (
        <div style={{ background: 'var(--dash-surface)', border: '1px dashed var(--dash-border)', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', margin: '0 0 1rem 0', opacity: 0.8 }}>📂</div>
          <h3 style={{ color: 'var(--dash-text)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Materials Uploaded</h3>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.9rem' }}>Upload files to share them securely with your enrolled students.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'var(--dash-surface)', borderRadius: '12px', border: '1px solid var(--dash-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--dash-border)', background: 'var(--dash-bg)' }}>
                <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>File Title</th>
                <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Course</th>
                <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem' }}>Type</th>
                <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--dash-border)' }}>
                  <td style={{ padding: '1rem', color: 'var(--dash-text)', fontSize: '0.9rem', fontWeight: 500 }}>
                    <a href={m.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--dash-text)', textDecoration: 'none' }}>{m.title}</a>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--dash-text-muted)', fontSize: '0.85rem' }}>{m.courseTitle}</td>
                  <td style={{ padding: '1rem', color: 'var(--dash-text-muted)', fontSize: '0.85rem' }}>{m.fileType}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(m._id)} style={{ padding: '0.4rem 0.8rem', background: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
