'use client';

import { useState } from 'react';

export default function CustomUploader({ onUploadSuccess, label = "Upload File" }) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file) => {
    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data
      });
      
      const result = await res.json();
      if (result.success && result.url) {
        onUploadSuccess(result.url);
      } else {
        alert(result.error || 'Failed to upload file');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      alert('Upload failed. Check console.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '6px', border: '1px dashed var(--dash-border)' }}>
      <label style={{ fontSize: '0.85rem', color: 'var(--dash-text-secondary)', cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        {uploading ? <span style={{ color: '#f59e0b' }}>Uploading to cloud...</span> : label}
        <input 
          type="file" 
          onChange={e => { if (e.target.files[0]) handleFileUpload(e.target.files[0]) }}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
}
