'use client';

import { useState, useEffect } from 'react';

export default function SchemaFormModal({ config, initialData, onClose, onSave }) {
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [newValues, setNewValues] = useState({});
  const [totalHoursText, setTotalHoursText] = useState('');

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

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
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
      <div className="modal-container">
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
                field.key === 'learningOutcomes' || 
                field.key === 'prerequisites';

              return (
                <div key={field.key} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  gridColumn: isFullWidth ? '1 / span 2' : 'auto',
                }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--dash-text-secondary)', fontWeight: 600 }}>
                    {field.label.replace(/\(comma\s+separated\)/i, '').trim()} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                  </label>
                  
                  {field.key === 'language' ? (
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
                      
                      {/* Blank toggle/add input box */}
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder={`Add new ${getSingularName(field.label.replace(/\(comma\s+separated\)/i, '').trim()).toLowerCase()}...`}
                          value={newValues[field.key] || ''}
                          onChange={e => {
                            const text = e.target.value;
                            if (text.includes(',')) {
                              const parts = text.split(',');
                              const newItems = parts.slice(0, -1).map(p => p.trim()).filter(Boolean);
                              if (newItems.length > 0) {
                                const newArr = [...(formData[field.key] || []), ...newItems];
                                handleChange(field.key, newArr);
                              }
                              setNewValues(prev => ({ ...prev, [field.key]: parts[parts.length - 1] }));
                            } else {
                              setNewValues(prev => ({ ...prev, [field.key]: text }));
                            }
                          }}
                          onPaste={e => {
                            const pastedText = e.clipboardData.getData('text');
                            if (pastedText.includes(',')) {
                              e.preventDefault();
                              const parts = pastedText.split(',').map(p => p.trim()).filter(Boolean);
                              if (parts.length > 0) {
                                const newArr = [...(formData[field.key] || []), ...parts];
                                handleChange(field.key, newArr);
                                setNewValues(prev => ({ ...prev, [field.key]: '' }));
                              }
                            }
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = (newValues[field.key] || '').trim();
                              if (val) {
                                const newArr = [...(formData[field.key] || []), val];
                                handleChange(field.key, newArr);
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
                              const newArr = [...(formData[field.key] || []), val];
                              handleChange(field.key, newArr);
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
                    </div>
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
                      
                      <button
                        type="button"
                        onClick={() => {
                          const newFaqs = [...(formData[field.key] || [])];
                          newFaqs.push({ question: '', answer: '' });
                          handleChange(field.key, newFaqs);
                        }}
                        style={{
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
                        ＋ Add FAQ Item
                      </button>
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
                      value={
                        (formData[field.key] === 0 || formData[field.key] === '0') && !initialData
                          ? ''
                          : (formData[field.key] === undefined || formData[field.key] === null ? '' : formData[field.key])
                      }
                      onChange={e => {
                        const val = e.target.value === '' ? '' : (field.type === 'number' ? Number(e.target.value) : e.target.value);
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
