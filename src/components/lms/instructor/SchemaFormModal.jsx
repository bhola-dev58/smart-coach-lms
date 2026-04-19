'use client';

import { useState, useEffect } from 'react';

export default function SchemaFormModal({ config, initialData, onClose, onSave }) {
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Set defaults
      const defaults = {};
      config.fields.forEach(f => {
        if (f.default !== undefined) defaults[f.key] = f.default;
        else if (f.type === 'boolean') defaults[f.key] = false;
        else defaults[f.key] = '';
      });
      setFormData(defaults);
    }
  }, [initialData, config]);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (key, file) => {
    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'ml_default'); // Must match user's Cloudinary preset config later

    try {
      // Use standard cloudinary upload via the browser directly or our own endpoint
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) { throw new Error('Cloudinary not configured'); }
      
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      if (result.secure_url) {
        handleChange(key, result.secure_url);
      }
    } catch (err) {
      console.error('Upload Error:', err);
      alert('Upload failed. Check console.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        background: 'var(--dash-surface)',
        width: '100%', maxWidth: '600px',
        maxHeight: '90vh',
        borderRadius: 'var(--dash-radius)',
        border: '1px solid var(--dash-border)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--dash-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{initialData ? 'Edit' : 'Create'} {config.name}</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--dash-text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          <form id="generic-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {config.fields.map(field => (
              <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--dash-text-secondary)', fontWeight: 500 }}>
                  {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                
                {field.type === 'textarea' ? (
                  <textarea 
                    value={formData[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    required={field.required}
                    rows={4}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dash-border)', borderRadius: '6px', padding: '0.75rem', color: 'var(--dash-text)', fontSize: '0.9rem', outline: 'none' }}
                  />
                ) : field.type === 'select' ? (
                  <select 
                    value={formData[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    required={field.required}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dash-border)', borderRadius: '6px', padding: '0.75rem', color: 'var(--dash-text)', fontSize: '0.9rem', outline: 'none' }}
                  >
                    <option value="">Select an option</option>
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : field.type === 'boolean' ? (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={formData[field.key] || false}
                      onChange={e => handleChange(field.key, e.target.checked)}
                    />
                    <span>Yes / Active</span>
                  </label>
                ) : field.type === 'file' ? (
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input 
                      type="file" 
                      onChange={e => { if (e.target.files[0]) handleFileUpload(field.key, e.target.files[0]) }}
                      style={{ flex: 1 }}
                    />
                    {uploading && <span style={{ fontSize: '0.8rem', color: '#f59e0b' }}>Uploading...</span>}
                    {formData[field.key] && !uploading && (
                      <a href={formData[field.key]} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#3b82f6' }}>View File</a>
                    )}
                  </div>
                ) : field.type === 'date' ? (
                   <input 
                    type="datetime-local" 
                    value={formData[field.key] ? new Date(formData[field.key]).toISOString().slice(0, 16) : ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    required={field.required}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dash-border)', borderRadius: '6px', padding: '0.75rem', color: 'var(--dash-text)', fontSize: '0.9rem', outline: 'none' }}
                  />
                ) : (
                  <input 
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={formData[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    required={field.required}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dash-border)', borderRadius: '6px', padding: '0.75rem', color: 'var(--dash-text)', fontSize: '0.9rem', outline: 'none' }}
                  />
                )}
              </div>
            ))}
          </form>
        </div>

        {/* Footer */}
        <div style={{ padding: '1.25rem', borderTop: '1px solid var(--dash-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'rgba(0,0,0,0.1)' }}>
          <button type="button" onClick={onClose} style={{ padding: '0.6rem 1.25rem', borderRadius: '6px', border: '1px solid var(--dash-border)', background: 'transparent', color: 'var(--dash-text)', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" form="generic-form" disabled={uploading} style={{ padding: '0.6rem 1.25rem', borderRadius: '6px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: 'bold', cursor: 'pointer', opacity: uploading ? 0.7 : 1 }}>
            {initialData ? 'Save Changes' : 'Create Item'}
          </button>
        </div>
      </div>
    </div>
  );
}
