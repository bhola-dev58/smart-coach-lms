'use client';

import { useState, useEffect } from 'react';

export default function SchemaFormModal({ config, initialData, onClose, onSave, inline = false }) {
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [newValues, setNewValues] = useState({});
  const [totalHoursText, setTotalHoursText] = useState('');
  
  const [courseStudents, setCourseStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const [prevCourseId, setPrevCourseId] = useState(null);
  
  // Bulk Import state
  const [showBulkFaqFieldKey, setShowBulkFaqFieldKey] = useState(null);
  const [showBulkStringArrayKey, setShowBulkStringArrayKey] = useState(null);

  // Fetch enrolled students when the selected course changes (for Batch creation)
  useEffect(() => {
    const courseVal = formData.course;
    const courseId = typeof courseVal === 'object' && courseVal !== null
      ? (courseVal._id || courseVal.id)
      : courseVal;

    if (courseId) {
      setLoadingStudents(true);
      fetch(`/api/instructor/courses/${courseId}/students`)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            setCourseStudents(json.students || []);
          } else {
            setCourseStudents([]);
          }
        })
        .catch(err => {
          console.error('Failed to load course students:', err);
          setCourseStudents([]);
        })
        .finally(() => setLoadingStudents(false));
    } else {
      setCourseStudents([]);
    }

    // Only clear selected students if the course ID has changed from a previous value
    if (config.name === 'Batches' && prevCourseId && prevCourseId !== courseId) {
      handleChange('students', []);
    }
    
    setPrevCourseId(courseId);
  }, [formData.course]);


  useEffect(() => {
    if (initialData) {
      // Normalize array fields to ensure they are arrays
      const normalized = { ...initialData };
      config.fields.forEach(f => {
        if (f.type === 'stringArray' || f.type === 'faqArray') {
          if (!Array.isArray(normalized[f.key])) {
            normalized[f.key] = normalized[f.key] ? [normalized[f.key]] : [];
          }
        }
      });
      if (normalized.totalHours !== undefined && normalized.totalHours !== null && Number(normalized.totalHours) !== 0) {
        const hrs = Number(normalized.totalHours) || 0;
        const h = Math.floor(hrs);
        const m = Math.round((hrs - h) * 60).toString().padStart(2, '0');
        setTotalHoursText(`${h}:${m}`);
      } else {
        setTotalHoursText('');
      }
      setFormData(normalized);
    } else {
      // Set defaults
      const defaults = {};
      config.fields.forEach(f => {
        if (f.default !== undefined) defaults[f.key] = f.default;
        else if (f.type === 'boolean') defaults[f.key] = false;
        else if (f.type === 'stringArray') defaults[f.key] = [];
        else if (f.type === 'faqArray') defaults[f.key] = [];
        else defaults[f.key] = '';
      });
      setTotalHoursText('');
      setFormData(defaults);
    }
  }, [initialData, config]);

  // Load courses if 'course' field exists in the form configuration
  useEffect(() => {
    const hasCourseField = config.fields.some(f => f.key === 'course');
    if (hasCourseField) {
      setLoadingCourses(true);
      fetch('/api/instructor/crud/courses')
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            setCourses(json.data || []);
          }
        })
        .catch(err => console.error('Failed to load courses for selection dropdown:', err))
        .finally(() => setLoadingCourses(false));
    }
  }, [config]);

  // Load batches if 'batch' field exists in the form configuration
  useEffect(() => {
    const hasBatchField = config.fields.some(f => f.key === 'batch');
    if (hasBatchField) {
      setLoadingBatches(true);
      fetch('/api/instructor/crud/batches')
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            setBatches(json.data || []);
          }
        })
        .catch(err => console.error('Failed to load batches for selection dropdown:', err))
        .finally(() => setLoadingBatches(false));
    }
  }, [config]);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (key, file) => {
    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      // Upload using our secure server-side proxy route
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      if (result.success && result.url) {
        handleChange(key, result.url);
      } else {
        alert(result.error || 'Upload failed');
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

  const getPlaceholder = (field) => {
    if (field.placeholder) return field.placeholder;
    
    const key = field.key.toLowerCase();
    const label = field.label;
    
    if (key === 'shortdescription' || key.includes('shortdescription')) return `Enter short course subtitle (max 200 chars)...`;
    if (key.includes('title')) return `Enter ${label.toLowerCase()} (e.g. DSA in Python)`;
    if (key.includes('description')) return `Enter detailed ${label.toLowerCase()} description here...`;
    if (key.includes('price')) return `e.g. 999`;
    if (key.includes('url')) return `https://example.com/file.pdf`;
    if (key.includes('code')) return `PROMO2026`;
    if (key.includes('hours')) return `HH:MM (e.g. 40:00)`;
    
    return `Enter ${label.toLowerCase()}...`;
  };

  const getSingularName = (pluralName) => {
    if (!pluralName) return 'Item';
    const lower = pluralName.toLowerCase();
    if (lower === 'courses') return 'Course';
    if (lower === 'announcements') return 'Announcement';
    if (lower === 'assignments') return 'Assignment';
    if (lower === 'live sessions') return 'Live Session';
    if (lower === 'study materials') return 'Study Material';
    if (lower === 'practice questions') return 'Practice Question';
    if (pluralName.endsWith('s')) return pluralName.slice(0, -1);
    return pluralName;
  };

  const wrapperStyle = inline ? {
    width: '100%',
    boxSizing: 'border-box'
  } : {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
  };

  const containerStyle = inline ? {
    background: 'var(--dash-surface)',
    width: '100%',
    borderRadius: '14px',
    border: '1px solid var(--dash-border)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    overflow: 'visible',
  } : {
    background: 'var(--dash-surface) !important',
    width: '95% !important',
    maxWidth: '750px !important',
    maxHeight: '90vh !important',
    borderRadius: 'var(--dash-radius) !important',
    border: '1px solid var(--dash-border) !important',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3) !important',
    display: 'flex !important',
    flexDirection: 'column !important',
  };

  return (
    <div style={wrapperStyle}>
      <style>{`
        .modal-input, .modal-select, .modal-textarea {
          background: #ffffff !important;
          border: 2px solid var(--dash-border) !important;
          border-radius: 8px !important;
          padding: 0.75rem !important;
          color: #1f2937 !important;
          font-size: 0.9rem !important;
          font-family: inherit !important;
          outline: none !important;
          transition: all 0.2s ease !important;
          box-sizing: border-box !important;
          width: 100% !important;
        }
        .modal-input::placeholder, .modal-textarea::placeholder {
          color: #9ca3af !important;
          opacity: 1 !important;
        }
        .modal-input:hover, .modal-select:hover, .modal-textarea:hover {
          border-color: var(--dash-accent) !important;
          background: #ffffff !important;
        }
        .modal-input:focus, .modal-select:focus, .modal-textarea:focus {
          border-color: var(--dash-accent) !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 3px var(--dash-accent-light) !important;
        }
        .modal-textarea {
          resize: vertical !important;
        }
        .modal-cancel-btn {
          padding: 0.6rem 1.25rem !important;
          border-radius: 6px !important;
          border: 1px solid var(--dash-border) !important;
          background: transparent !important;
          color: var(--dash-text) !important;
          cursor: pointer !important;
          font-family: inherit !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
          outline: none !important;
        }
        .modal-cancel-btn:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: var(--dash-text-secondary) !important;
        }
        .modal-cancel-btn:active {
          background: rgba(255, 255, 255, 0.1) !important;
        }
        .modal-submit-btn {
          padding: 0.6rem 1.25rem !important;
          border-radius: 6px !important;
          border: none !important;
          background: var(--color-primary, #3b82f6) !important;
          color: white !important;
          font-weight: bold !important;
          cursor: pointer !important;
          font-family: inherit !important;
          transition: all 0.2s ease !important;
          outline: none !important;
        }
        .modal-submit-btn:hover {
          filter: brightness(1.1) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2) !important;
        }
        .modal-submit-btn:active {
          transform: translateY(0) !important;
          filter: brightness(0.9) !important;
        }
        .modal-container {
          background: var(--dash-surface) !important;
          width: 95% !important;
          max-width: 750px !important;
          max-height: 90vh !important;
          borderRadius: var(--dash-radius) !important;
          border: 1px solid var(--dash-border) !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .modal-form-grid {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 1.25rem 1rem !important;
        }
        @media (max-width: 600px) {
          .modal-form-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .modal-form-grid > div {
            grid-column: 1 / -1 !important;
          }
          .modal-container {
            max-height: 95vh !important;
          }
        }
      `}</style>
      <div className={inline ? "" : "modal-container"} style={containerStyle}>
        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--dash-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{initialData ? 'Edit' : 'Create'} {config.name}</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--dash-text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          <form id="generic-form" onSubmit={handleSubmit} className="modal-form-grid">
            {config.fields.map(field => {
              const isFullWidth = 
                field.type === 'textarea' || 
                field.type === 'faqArray' || 
                field.type === 'stringArray' || 
                field.key === 'title' || 
                field.key === 'description' || 
                field.key === 'shortDescription' || 
                field.key === 'learningOutcomes' || 
                field.key === 'prerequisites';

              const maxCharLimit = field.maxLength || (field.key === 'shortDescription' ? 200 : null);
              const currentVal = formData[field.key] || '';
              const charCount = typeof currentVal === 'string' ? currentVal.length : 0;

              return (
                <div key={field.key} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  gridColumn: isFullWidth ? '1 / span 2' : 'auto',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--dash-text-secondary)', fontWeight: 600 }}>
                      {field.label.replace(/\(comma\s+separated\)/i, '').trim()} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                    {maxCharLimit && (
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: charCount >= maxCharLimit ? '#ef4444' : charCount >= maxCharLimit * 0.85 ? '#f59e0b' : 'var(--dash-text-muted)',
                      }}>
                        {charCount} / {maxCharLimit} chars
                      </span>
                    )}
                  </div>
                  
                  {field.key === 'tags' ? (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      alignItems: 'center',
                      padding: '6px 10px',
                      background: '#ffffff',
                      border: '2px solid var(--dash-border)',
                      borderRadius: '8px',
                      minHeight: '42px',
                      cursor: 'text',
                      boxSizing: 'border-box',
                      width: '100%',
                    }}
                    onClick={() => {
                      const inputEl = document.getElementById('tags-inline-input');
                      if (inputEl) inputEl.focus();
                    }}
                    >
                      {/* Render tag chips */}
                      {(formData[field.key] || []).map((tag, idx) => (
                        <span key={idx} style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: '#1e40af',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          padding: '3px 8px',
                          borderRadius: '16px',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          lineHeight: 1,
                          userSelect: 'none',
                        }}>
                          {tag}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newTags = (formData[field.key] || []).filter((_, i) => i !== idx);
                              handleChange(field.key, newTags);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: 0,
                              fontSize: '0.8rem',
                              lineHeight: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '12px',
                              height: '12px',
                              fontWeight: 'bold',
                            }}
                          >
                            ✕
                          </button>
                        </span>
                      ))}

                      {/* Inline Input Field */}
                      <input
                        type="text"
                        id="tags-inline-input"
                        placeholder={(formData[field.key] || []).length === 0 ? "Enter tags (separated by comma or Enter)..." : ""}
                        value={newValues[field.key] || ''}
                        onChange={e => {
                          const text = e.target.value;
                          // If they typed a comma, treat as separator
                          if (text.endsWith(',')) {
                            const newTag = text.slice(0, -1).trim();
                            if (newTag) {
                              const currentTags = formData[field.key] || [];
                              if (!currentTags.includes(newTag)) {
                                handleChange(field.key, [...currentTags, newTag]);
                              }
                            }
                            setNewValues(prev => ({ ...prev, [field.key]: '' }));
                          } else {
                            setNewValues(prev => ({ ...prev, [field.key]: text }));
                          }
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (newValues[field.key] || '').trim();
                            if (val) {
                              const currentTags = formData[field.key] || [];
                              if (!currentTags.includes(val)) {
                                handleChange(field.key, [...currentTags, val]);
                              }
                            }
                            setNewValues(prev => ({ ...prev, [field.key]: '' }));
                          } else if (e.key === 'Backspace' && !newValues[field.key]) {
                            // Backspace on empty input removes the last tag chip
                            const currentTags = formData[field.key] || [];
                            if (currentTags.length > 0) {
                              handleChange(field.key, currentTags.slice(0, -1));
                            }
                          }
                        }}
                        onPaste={e => {
                          const pastedText = e.clipboardData.getData('text');
                          if (pastedText.includes(',')) {
                            e.preventDefault();
                            const parts = pastedText.split(',').map(p => p.trim()).filter(Boolean);
                            if (parts.length > 0) {
                              const currentTags = formData[field.key] || [];
                              const merged = Array.from(new Set([...currentTags, ...parts]));
                              handleChange(field.key, merged);
                              setNewValues(prev => ({ ...prev, [field.key]: '' }));
                            }
                          }
                        }}
                        style={{
                          border: 'none',
                          outline: 'none',
                          padding: '4px 0',
                          fontSize: '0.9rem',
                          color: '#1f2937',
                          background: 'transparent',
                          flex: 1,
                          minWidth: '150px',
                        }}
                      />
                    </div>
                  ) : field.key === 'language' ? (
                    <select
                      value={formData[field.key] || 'Hindi'}
                      onChange={e => handleChange(field.key, e.target.value)}
                      required={field.required}
                      className="modal-select"
                    >
                      <option value="Hindi">Hindi</option>
                      <option value="English">English</option>
                      <option value="Hinglish">Hinglish</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Malayalam">Malayalam</option>
                      <option value="Marathi">Marathi</option>
                      <option value="Gujarati">Gujarati</option>
                      <option value="Bengali">Bengali</option>
                      <option value="Punjabi">Punjabi</option>
                      <option value="Urdu">Urdu</option>
                    </select>
                  ) : field.key === 'course' ? (
                    <select 
                      value={
                        typeof formData[field.key] === 'object' && formData[field.key] !== null
                          ? (formData[field.key]._id || formData[field.key].id || '')
                          : (formData[field.key] || '')
                      }
                      onChange={e => handleChange(field.key, e.target.value)}
                      required={field.required}
                      className="modal-select"
                    >
                      <option value="">{loadingCourses ? 'Loading courses...' : 'Select a course'}</option>
                      {courses.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.title} {c.slug ? `(${c.slug})` : ''}
                        </option>
                      ))}
                    </select>
                  ) : field.key === 'batch' ? (
                    <select 
                      value={
                        typeof formData[field.key] === 'object' && formData[field.key] !== null
                          ? (formData[field.key]._id || formData[field.key].id || '')
                          : (formData[field.key] || '')
                      }
                      onChange={e => handleChange(field.key, e.target.value)}
                      required={field.required}
                      className="modal-select"
                    >
                      <option value="">{loadingBatches ? 'Loading batches...' : 'Select a batch'}</option>
                      {batches.map(b => (
                        <option key={b._id} value={b._id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea 
                      value={formData[field.key] || ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                      required={field.required}
                      rows={4}
                      placeholder={getPlaceholder(field)}
                      className="modal-textarea"
                    />
                  ) : field.type === 'select' ? (
                    <select 
                      value={formData[field.key] || ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                      required={field.required}
                      className="modal-select"
                    >
                      <option value="">Select an option</option>
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : field.type === 'boolean' ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', height: '100%', minHeight: '40px' }}>
                      <input 
                        type="checkbox" 
                        checked={formData[field.key] || false}
                        onChange={e => handleChange(field.key, e.target.checked)}
                      />
                      <span>Yes / Active</span>
                    </label>
                  ) : field.type === 'file' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {/* Hidden native input */}
                        <input 
                          type="file" 
                          id={`file-upload-${field.key}`}
                          onChange={e => { if (e.target.files[0]) handleFileUpload(field.key, e.target.files[0]) }}
                          style={{ display: 'none' }}
                          disabled={uploading}
                        />
                        
                        {/* Custom trigger button */}
                        <label 
                          htmlFor={`file-upload-${field.key}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1.25rem',
                            borderRadius: '6px',
                            border: '2px solid var(--dash-border)',
                            background: 'rgba(255,255,255,0.03)',
                            color: 'var(--dash-text)',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => {
                            if (!uploading) {
                              e.currentTarget.style.borderColor = 'var(--dash-accent)';
                              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!uploading) {
                              e.currentTarget.style.borderColor = 'var(--dash-border)';
                              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                            }
                          }}
                        >
                          {/* Inline SVG Upload icon */}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          {uploading ? 'Uploading...' : 'Choose File'}
                        </label>
                        
                        {/* File status / link */}
                        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {formData[field.key] ? (
                            <a 
                              href={formData[field.key]} 
                              target="_blank" 
                              rel="noreferrer" 
                              style={{ 
                                fontSize: '0.85rem', 
                                color: 'var(--dash-accent, #3b82f6)', 
                                textDecoration: 'none',
                                fontWeight: 500,
                              }}
                              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                            >
                              {(() => {
                                try {
                                  const url = new URL(formData[field.key]);
                                  const pathname = url.pathname;
                                  return pathname.split('/').pop() || 'View uploaded file';
                                } catch (err) {
                                  return 'View uploaded file';
                                }
                              })()}
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.85rem', color: 'var(--dash-text-muted)' }}>
                              No file selected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : field.type === 'date' ? (
                     <input 
                      type="datetime-local" 
                      value={
                        formData[field.key]
                          ? (() => {
                              const date = new Date(formData[field.key]);
                              if (isNaN(date.getTime())) return '';
                              const offset = date.getTimezoneOffset();
                              const localDate = new Date(date.getTime() - (offset * 60 * 1000));
                              return localDate.toISOString().slice(0, 16);
                            })()
                          : ''
                      }
                      onChange={e => handleChange(field.key, e.target.value)}
                      required={field.required}
                      className="modal-input"
                    />
                  ) : field.type === 'stringArray' ? (
                    config.name === 'Batches' && field.key === 'students' ? (
                      <div style={{ position: 'relative' }}>
                        {/* Backdrop to close the dropdown when clicking outside */}
                        {studentDropdownOpen && (
                          <div 
                            onClick={() => setStudentDropdownOpen(false)}
                            style={{
                              position: 'fixed',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              zIndex: 999,
                              background: 'transparent',
                            }}
                          />
                        )}
                        
                        {/* Selector Box */}
                        <div 
                          onClick={() => setStudentDropdownOpen(!studentDropdownOpen)}
                          className="modal-input"
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            userSelect: 'none',
                            minHeight: '42px',
                            background: '#ffffff',
                          }}
                        >
                          <span style={{ color: (formData.students || []).length > 0 ? '#1f2937' : '#9ca3af' }}>
                            {(formData.students || []).length > 0 
                              ? `${(formData.students || []).length} student(s) selected` 
                              : 'Select Student Emails'}
                          </span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: studentDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                        
                        {/* Dropdown Menu */}
                        {studentDropdownOpen && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '4px',
                            background: '#ffffff',
                            border: '2px solid var(--dash-border)',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            zIndex: 1000,
                            padding: '0.75rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            maxHeight: '300px',
                          }}>
                            {!formData.course ? (
                              <span style={{ fontSize: '0.85rem', color: '#ef4444', padding: '0.25rem' }}>
                                ⚠️ Please select a course first to view enrolled students.
                              </span>
                            ) : loadingStudents ? (
                              <span style={{ fontSize: '0.85rem', color: 'var(--dash-text-muted)', padding: '0.25rem' }}>
                                Loading students...
                              </span>
                            ) : courseStudents.length === 0 ? (
                              <span style={{ fontSize: '0.85rem', color: '#ef4444', padding: '0.25rem' }}>
                                No students are enrolled in the selected course yet.
                              </span>
                            ) : (
                              <>
                                {/* Search & Action Buttons */}
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                                  <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={studentSearch}
                                    onChange={e => setStudentSearch(e.target.value)}
                                    onClick={e => e.stopPropagation()}
                                    style={{
                                      flex: 1,
                                      fontSize: '0.8rem',
                                      padding: '0.4rem 0.6rem',
                                      borderRadius: '4px',
                                      border: '1px solid var(--dash-border)',
                                      outline: 'none',
                                      background: '#ffffff',
                                      color: '#1f2937',
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const filtered = courseStudents
                                        .filter(s => 
                                          s.name?.toLowerCase().includes(studentSearch.toLowerCase()) || 
                                          s.email?.toLowerCase().includes(studentSearch.toLowerCase())
                                        )
                                        .map(s => s.email);
                                      const merged = Array.from(new Set([...(formData.students || []), ...filtered]));
                                      handleChange('students', merged);
                                    }}
                                    style={{
                                      fontSize: '0.75rem',
                                      padding: '0.25rem 0.5rem',
                                      background: 'var(--dash-accent, #1B2B6B)',
                                      color: '#ffffff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                    }}
                                  >
                                    All
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const filtered = courseStudents
                                        .filter(s => 
                                          s.name?.toLowerCase().includes(studentSearch.toLowerCase()) || 
                                          s.email?.toLowerCase().includes(studentSearch.toLowerCase())
                                        )
                                        .map(s => s.email);
                                      const filteredSet = new Set(filtered);
                                      const updated = (formData.students || []).filter(email => !filteredSet.has(email));
                                      handleChange('students', updated);
                                    }}
                                    style={{
                                      fontSize: '0.75rem',
                                      padding: '0.25rem 0.5rem',
                                      background: 'transparent',
                                      color: '#ef4444',
                                      border: '1px solid #ef4444',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                    }}
                                  >
                                    Clear
                                  </button>
                                </div>
                                
                                {/* Student List */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1 }}>
                                  {(() => {
                                    const filtered = courseStudents.filter(s => 
                                      s.name?.toLowerCase().includes(studentSearch.toLowerCase()) || 
                                      s.email?.toLowerCase().includes(studentSearch.toLowerCase())
                                    );
                                    if (filtered.length === 0) {
                                      return (
                                        <div style={{ fontSize: '0.85rem', color: '#9ca3af', padding: '0.5rem', textAlign: 'center' }}>
                                          No students found matching your search.
                                        </div>
                                      );
                                    }
                                    return filtered.map(s => {
                                      const isChecked = (formData.students || []).includes(s.email);
                                      return (
                                        <label
                                          key={s.email}
                                          onClick={e => e.stopPropagation()}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '6px 8px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            background: isChecked ? 'rgba(27, 43, 107, 0.05)' : 'transparent',
                                          }}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => {
                                              if (isChecked) {
                                                handleChange('students', (formData.students || []).filter(email => email !== s.email));
                                              } else {
                                                handleChange('students', [...(formData.students || []), s.email]);
                                              }
                                            }}
                                            style={{ cursor: 'pointer' }}
                                          />
                                          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1f2937' }}>{s.name}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted)' }}>{s.email}</span>
                                          </div>
                                        </label>
                                      );
                                    });
                                  })()}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {/* Existing items */}
                        {(formData[field.key] || []).map((item, idx) => (
                          <div key={idx} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                              type="text"
                              placeholder={`${field.label.replace(/\(comma\s+separated\)/i, '').trim()} #${idx + 1}`}
                              value={item}
                              onChange={e => {
                                const newArr = [...(formData[field.key] || [])];
                                newArr[idx] = e.target.value;
                                handleChange(field.key, newArr);
                              }}
                              className="modal-input"
                              style={{ paddingRight: '2.5rem', flex: 1 }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newArr = [...(formData[field.key] || [])];
                                newArr.splice(idx, 1);
                                handleChange(field.key, newArr);
                              }}
                              style={{
                                position: 'absolute',
                                right: '12px',
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '20px',
                                height: '20px',
                                fontSize: '1rem',
                                transition: 'color 0.2s',
                                padding: 0,
                              }}
                              title="Remove item"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        
                        {/* Bulk String Array Input Area */}
                        {showBulkStringArrayKey === field.key && (
                          <div style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid var(--dash-border)', borderRadius: '8px', padding: '0.85rem', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--dash-text)' }}>
                              Paste {field.label.replace(/\(comma\s+separated\)/i, '').trim()} List (One item per line)
                            </label>
                            <textarea
                              placeholder={`e.g.&#10;• First item&#10;• Second item&#10;• Third item`}
                              rows="4"
                              className="modal-textarea"
                              style={{ fontFamily: 'monospace', resize: 'vertical', marginBottom: '0.6rem', height: '100px' }}
                              id={`bulk-stringarray-textarea-${field.key}`}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => setShowBulkStringArrayKey(null)}
                                style={{ padding: '0.35rem 0.85rem', background: 'transparent', border: '1px solid var(--dash-border)', color: 'var(--dash-text)', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const el = document.getElementById(`bulk-stringarray-textarea-${field.key}`);
                                  if (el) {
                                    const text = el.value;
                                    if (text && text.trim()) {
                                      const parts = text.split('\n')
                                        .map(p => p.trim().replace(/^[•\-\*\u2022]\s*/, '').replace(/^\d+[\.\)]\s*/, '').trim())
                                        .filter(Boolean);
                                      if (parts.length > 0) {
                                        const currentArr = formData[field.key] || [];
                                        handleChange(field.key, [...currentArr, ...parts]);
                                        setShowBulkStringArrayKey(null);
                                      }
                                    }
                                    el.value = '';
                                  }
                                }}
                                style={{ padding: '0.35rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Import Items
                              </button>
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                              type="text"
                              placeholder={`Add single ${getSingularName(field.label.replace(/\(comma\s+separated\)/i, '').trim()).toLowerCase()}...`}
                              value={newValues[field.key] || ''}
                              onChange={e => setNewValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const val = (newValues[field.key] || '').trim();
                                  if (val) {
                                    const cleanVal = val.replace(/^[•\-\*\u2022]\s*/, '').replace(/^\d+[\.\)]\s*/, '').trim();
                                    if (cleanVal) {
                                      const newArr = [...(formData[field.key] || []), cleanVal];
                                      handleChange(field.key, newArr);
                                    }
                                    setNewValues(prev => ({ ...prev, [field.key]: '' }));
                                  }
                                }
                              }}
                              className="modal-input"
                              style={{ paddingRight: '2.5rem', flex: 1 }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const val = (newValues[field.key] || '').trim();
                                if (val) {
                                  const cleanVal = val.replace(/^[•\-\*\u2022]\s*/, '').replace(/^\d+[\.\)]\s*/, '').trim();
                                  if (cleanVal) {
                                    const newArr = [...(formData[field.key] || []), cleanVal];
                                    handleChange(field.key, newArr);
                                  }
                                  setNewValues(prev => ({ ...prev, [field.key]: '' }));
                                }
                              }}
                              style={{
                                position: 'absolute',
                                right: '12px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--dash-accent, #3b82f6)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '20px',
                                height: '20px',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                padding: 0,
                              }}
                              title="Add item"
                            >
                              ＋
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowBulkStringArrayKey(showBulkStringArrayKey === field.key ? null : field.key)}
                            style={{
                              padding: '0.65rem 1.15rem',
                              background: 'transparent',
                              border: '2px solid var(--color-primary, #3b82f6)',
                              borderRadius: '8px',
                              color: 'var(--color-primary, #3b82f6)',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              fontFamily: 'inherit',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'rgba(220, 20, 60, 0.05)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            ⚡ Bulk Add
                          </button>
                        </div>
                      </div>
                    )
                  ) : field.type === 'faqArray' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {(formData[field.key] || []).map((faq, idx) => (
                        <div key={idx} style={{
                          position: 'relative',
                          background: 'rgba(255, 255, 255, 0.02)',
                          padding: '1.25rem',
                          borderRadius: '8px',
                          border: '2px solid var(--dash-border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem',
                          transition: 'border-color 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--dash-accent)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--dash-border)'}
                        >
                          {/* Remove button (✕) on top right */}
                          <button
                            type="button"
                            onClick={() => {
                              const newFaqs = [...(formData[field.key] || [])];
                              newFaqs.splice(idx, 1);
                              handleChange(field.key, newFaqs);
                            }}
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '20px',
                              height: '20px',
                              fontSize: '1rem',
                              transition: 'color 0.2s',
                              padding: 0,
                            }}
                            title="Remove FAQ"
                          >
                            ✕
                          </button>
                          
                          {/* Question */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Question #{idx + 1}</span>
                            <input 
                              type="text" 
                              placeholder="e.g. Is prior coding experience in Python required?" 
                              value={faq.question}
                              onChange={e => {
                                const newFaqs = [...(formData[field.key] || [])];
                                newFaqs[idx].question = e.target.value;
                                handleChange(field.key, newFaqs);
                              }}
                              className="modal-input"
                              style={{ width: '100% !important' }}
                            />
                          </div>

                          {/* Answer */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Answer</span>
                            <textarea 
                              placeholder="e.g. You should know basic Python syntax like variables and loops..." 
                              value={faq.answer} 
                              rows={3}
                              onChange={e => {
                                const newFaqs = [...(formData[field.key] || [])];
                                newFaqs[idx].answer = e.target.value;
                                handleChange(field.key, newFaqs);
                              }}
                              className="modal-textarea"
                            />
                          </div>
                        </div>
                      ))}
                      
                      {/* Bulk FAQ Input Area */}
                      {showBulkFaqFieldKey === field.key && (
                        <div style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid var(--dash-border)', borderRadius: '8px', padding: '1rem', marginTop: '0.5rem' }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--dash-text)' }}>
                            Paste FAQs List
                          </label>
                          <div style={{ fontSize: '0.72rem', color: 'var(--dash-text-muted)', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                            Format: Put a blank line between each Q&A block. You can prefix them with Q: and A:, or just write Question on first line, Answer on next lines.
                          </div>
                          <textarea
                            placeholder="e.g.&#10;Q: Do I get placement support?&#10;A: Yes, we provide 100% placement assistance.&#10;&#10;Q: Is there any eligibility criteria?&#10;A: No, anyone with basic computer knowledge can join."
                            rows="5"
                            className="modal-textarea"
                            style={{ fontFamily: 'monospace', resize: 'vertical', marginBottom: '0.75rem', height: '120px' }}
                            id={`bulk-faq-textarea-${field.key}`}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => setShowBulkFaqFieldKey(null)}
                              style={{ padding: '0.35rem 0.85rem', background: 'transparent', border: '1px solid var(--dash-border)', color: 'var(--dash-text)', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const el = document.getElementById(`bulk-faq-textarea-${field.key}`);
                                if (el) {
                                  // Inlined FAQ Parser
                                  const text = el.value;
                                  if (text && text.trim()) {
                                    const parsedFaqs = [];
                                    const blocks = text.split(/\n\s*\n/);
                                    blocks.forEach(block => {
                                      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
                                      if (lines.length >= 2) {
                                        let question = '';
                                        let answer = '';
                                        const qLine = lines.find(l => /^q[:a-z]?\s+/i.test(l));
                                        const aLine = lines.find(l => /^a[:a-z]?\s+/i.test(l));
                                        if (qLine && aLine) {
                                          question = qLine.replace(/^q[:a-z]?\s+/i, '').trim();
                                          answer = aLine.replace(/^a[:a-z]?\s+/i, '').trim();
                                        } else {
                                          question = lines[0];
                                          answer = lines.slice(1).join('\n');
                                        }
                                        if (question && answer) {
                                          parsedFaqs.push({ question, answer });
                                        }
                                      }
                                    });
                                    if (parsedFaqs.length > 0) {
                                      const currentFaqs = formData[field.key] || [];
                                      handleChange(field.key, [...currentFaqs, ...parsedFaqs]);
                                      setShowBulkFaqFieldKey(null);
                                    } else {
                                      alert('Could not parse any FAQs. Check format.');
                                    }
                                  }
                                  el.value = '';
                                }
                              }}
                              style={{ padding: '0.35rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Import FAQs
                            </button>
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const newFaqs = [...(formData[field.key] || [])];
                            newFaqs.push({ question: '', answer: '' });
                            handleChange(field.key, newFaqs);
                          }}
                          style={{
                            flex: 1,
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '2px dashed var(--dash-border)',
                            borderRadius: '8px',
                            color: 'var(--dash-accent, #3b82f6)',
                            padding: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s',
                            fontFamily: 'inherit',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'var(--dash-accent)';
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.03)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--dash-border)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                          }}
                        >
                          ＋ Add Single FAQ Item
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowBulkFaqFieldKey(showBulkFaqFieldKey === field.key ? null : field.key)}
                          style={{
                            padding: '0.75rem 1.25rem',
                            background: 'transparent',
                            border: '2px solid var(--color-primary, #3b82f6)',
                            borderRadius: '8px',
                            color: 'var(--color-primary, #3b82f6)',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s',
                            fontFamily: 'inherit',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(220, 20, 60, 0.05)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          ⚡ Bulk Add FAQs
                        </button>
                      </div>
                    </div>
                  ) : field.key === 'totalHours' ? (
                    <input 
                      type="text" 
                      value={totalHoursText}
                      onChange={e => {
                        const val = e.target.value;
                        setTotalHoursText(val);
                        if (/^\d+:[0-5]\d$/.test(val)) {
                          const [h, m] = val.split(':').map(Number);
                          handleChange(field.key, h + (m / 60));
                        }
                      }}
                      onBlur={() => {
                        const val = totalHoursText.trim();
                        if (val === '') {
                          handleChange(field.key, 0);
                          setTotalHoursText('');
                        } else if (/^\d+$/.test(val)) {
                          const h = Number(val);
                          setTotalHoursText(`${h}:00`);
                          handleChange(field.key, h);
                        } else if (/^\d+:[0-5]\d$/.test(val)) {
                          const [h, m] = val.split(':').map(Number);
                          handleChange(field.key, h + (m / 60));
                        } else {
                          const hrs = Number(formData[field.key]) || 0;
                          if (hrs === 0) {
                            setTotalHoursText('');
                          } else {
                            const h = Math.floor(hrs);
                            const m = Math.round((hrs - h) * 60).toString().padStart(2, '0');
                            setTotalHoursText(`${h}:${m}`);
                          }
                        }
                      }}
                      placeholder={getPlaceholder(field)}
                      required={field.required}
                      className="modal-input"
                    />
                  ) : (
                    <input 
                      type={field.type === 'number' ? 'number' : 'text'}
                      maxLength={maxCharLimit || undefined}
                      value={
                        (formData[field.key] === 0 || formData[field.key] === '0') && !initialData
                          ? ''
                          : (formData[field.key] === undefined || formData[field.key] === null ? '' : formData[field.key])
                      }
                      onChange={e => {
                        let val = e.target.value;
                        if (field.type === 'number') {
                          val = val === '' ? '' : Number(val);
                        } else if (maxCharLimit && typeof val === 'string' && val.length > maxCharLimit) {
                          val = val.slice(0, maxCharLimit);
                        }
                        handleChange(field.key, val);
                      }}
                      required={field.required}
                      placeholder={getPlaceholder(field)}
                      className="modal-input"
                    />
                  )}
                </div>
              );
            })}
          </form>
        </div>

        {/* Footer */}
        <div style={{ padding: '1.25rem', borderTop: '1px solid var(--dash-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'rgba(0,0,0,0.1)' }}>
          <button 
            type="button" 
            onClick={onClose} 
            className="modal-cancel-btn"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="generic-form" 
            disabled={uploading} 
            className="modal-submit-btn"
            style={{ opacity: uploading ? 0.7 : 1 }}
          >
            {initialData ? 'Save Changes' : `Create ${getSingularName(config.name)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
