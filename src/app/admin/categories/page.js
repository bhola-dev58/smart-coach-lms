'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import UiIcon from '@/components/common/UiIcon';
import CategoryIcon from '@/components/courses/CategoryIcon';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('default');
  const [color, setColor] = useState('#3b82f6');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Icon options matching CategoryIcon mapping keys
  const iconOptions = [
    { value: 'maths', label: 'Mathematics / Compass' },
    { value: 'science', label: 'Science / Flask' },
    { value: 'commerce', label: 'Commerce / Bar Chart' },
    { value: 'arts', label: 'Arts & Humanities / Palette' },
    { value: 'computerscience', label: 'Computer Science / Coding' },
    { value: 'general', label: 'General Knowledge / Globe' },
    { value: 'default', label: 'Default book icon' }
  ];

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/categories');
      const json = await res.json();
      if (json.success) {
        setCategories(json.categories || []);
      } else {
        setError(json.error || 'Failed to fetch categories');
      }
    } catch (err) {
      setError('Network error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    if (!name.trim() || !label.trim()) {
      setError('Key code and Display label are required.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.toUpperCase().replace(/[^A-Z0-9_]/g, ''),
          label,
          icon,
          color,
          isActive
        })
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Category created successfully!');
        // Reset form
        setName('');
        setLabel('');
        setIcon('default');
        setColor('#3b82f6');
        setIsActive(true);
        // Refresh list
        fetchCategories();
      } else {
        setError(json.error || 'Failed to create category');
      }
    } catch (err) {
      setError('Network error submitting category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Course Categories Manager</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--dash-text-muted)', marginTop: '4px' }}>
            Dynamically add, list, and configure course categories. Newly added categories immediately propagate to course builders, practice fields, and navigation.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Creation Form Card */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: '#1B2B6B', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UiIcon name="plus" size={16} color="#1B2B6B" />
            <span>Create New Category</span>
          </h3>

          {error && (
            <div style={{ padding: '0.75rem', background: '#FDF2F2', border: '1px solid #FDE8E8', borderRadius: '8px', color: '#EC4899', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {successMsg && (
            <div style={{ padding: '0.75rem', background: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '8px', color: '#15803D', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                Category Code Key (Capitalized, alphanumeric only)
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. COMPUTER_SCIENCE"
                required
                style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.9rem', textTransform: 'uppercase' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                Used internally as DB lookup key (e.g. "ARTS", "DATA_SCIENCE").
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                Display Label
              </label>
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="e.g. Computer Science"
                required
                style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                  SVG Icon Theme
                </label>
                <select
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.9rem', background: '#FFF' }}
                >
                  {iconOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                  Preview
                </label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '42px', border: '1px solid #E5E7EB', borderRadius: '8px', background: '#F9FAFB' }}>
                  <CategoryIcon name={icon} color={color} size={24} />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                Brand Accent Color
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  style={{ width: '42px', height: '42px', padding: 0, border: '1px solid #D1D5DB', borderRadius: '8px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  placeholder="#3b82f6"
                  style={{ flex: 1, padding: '0.65rem 0.85rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                />
                <span>Active & Visible to Public</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#1B2B6B',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                opacity: submitting ? 0.7 : 1,
                transition: 'opacity 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {submitting ? 'Creating...' : (
                <>
                  <UiIcon name="check" size={16} color="white" />
                  <span>Save Category</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Existing Categories Card */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: '#1B2B6B', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UiIcon name="book" size={16} color="#1B2B6B" />
            <span>Active Categories ({categories.length})</span>
          </h3>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
              <div style={{ marginBottom: '1rem', color: '#9CA3AF' }}><UiIcon name="time" size={32} /></div>
              <span>Fetching category configurations...</span>
            </div>
          ) : categories.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed #E5E7EB', borderRadius: '12px', color: '#9CA3AF' }}>
              <UiIcon name="book" size={32} style={{ marginBottom: '1rem' }} />
              <p style={{ margin: 0, fontSize: '0.88rem' }}>No categories registered in the database.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #F3F4F6', color: '#4B5563', fontWeight: 600 }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Visual Accent</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Display Label</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Key Code</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat._id} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.15s' }}>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: `${cat.color}15`,
                            border: `1px solid ${cat.color}40`
                          }}>
                            <CategoryIcon name={cat.icon} color={cat.color} size={18} />
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#6B7280', fontFamily: 'monospace' }}>
                            {cat.color}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600, color: '#111827' }}>
                        {cat.label}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#4B5563', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                        {cat.name}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '50px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: cat.isActive ? '#ECFDF5' : '#FEE2E2',
                          color: cat.isActive ? '#059669' : '#DC2626',
                          border: `1px solid ${cat.isActive ? '#A7F3D0' : '#FECACA'}`
                        }}>
                          {cat.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
