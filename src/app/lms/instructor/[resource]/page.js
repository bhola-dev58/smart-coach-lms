'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { schemaConfig } from '@/components/lms/instructor/schemaConfig';
import DataTable from '@/components/lms/instructor/DataTable';
import SchemaFormModal from '@/components/lms/instructor/SchemaFormModal';

export default function GenericResourcePage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const resource = unwrappedParams.resource.toLowerCase();
  const config = schemaConfig[resource];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  useEffect(() => {
    if (!config) return; // Ignore if config not found
    fetchData();
  }, [resource, config]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/instructor/crud/${resource}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        console.error(json.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      const isEdit = !!formData._id;
      const method = isEdit ? 'PUT' : 'POST';
      
      const res = await fetch(`/api/instructor/crud/${resource}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json();

      if (json.success) {
        setIsModalOpen(false);
        fetchData(); // reload
      } else {
        alert(json.error || 'Failed to save');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(`Are you sure you want to delete this ${config.name} item?`)) return;
    
    try {
      const res = await fetch(`/api/instructor/crud/${resource}?id=${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (json.success) {
        setData(prev => prev.filter(r => r._id !== id));
      } else {
        alert(json.error || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!config) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>
        <h2>Resource Not Found</h2>
        <p>The system does not have an admin configuration for "{resource}".</p>
      </div>
    );
  }

  // Build columns for DataTable from config fields
  const columns = config.fields.map(f => ({
    key: f.key,
    label: f.label,
    render: (val) => {
       if (f.type === 'boolean') return val ? 'Yes' : 'No';
       if (f.type === 'file' && val) return <a href={val} target="_blank" rel="noreferrer" style={{color: '#3b82f6'}}>Link</a>;
       if (f.type === 'date' && val) return new Date(val).toLocaleDateString();
       
       if (val === null || val === undefined) return '';

       // Handle arrays (like stringArray or faqArray)
       if (Array.isArray(val)) {
         if (f.type === 'faqArray' || typeof val[0] === 'object') {
           return `${val.length} items`; // Safe summary for object arrays
         }
         return val.join(', '); // Comma separated for string arrays
       }
       
       // Handle generic objects (like nested IDs or weird DB responses)
       if (typeof val === 'object') {
         if (val._id || val.id) return String(val._id || val.id);
         return 'Object';
       }

       // Truncate long text
       const strVal = String(val);
       if (strVal.length > 50) return strVal.substring(0, 47) + '...';
       return strVal;
    }
  }));

  // Append curriculum builder action explicitly for Courses
  if (resource === 'courses') {
    columns.push({
      key: 'curriculum',
      label: 'Curriculum',
      render: (_, row) => (
        <button 
          onClick={() => router.push(`/lms/instructor/courses/${row._id}/builder`)}
          style={{
            padding: '0.4rem 0.75rem',
            background: 'var(--dash-accent)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          ⚙️ Builder
        </button>
      )
    });
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <style>{`
        .course-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
        }
        .course-card:hover {
          border-color: var(--dash-accent) !important;
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4), 0 0 12px rgba(200, 16, 46, 0.15);
        }
        .btn-edit {
          flex: 1;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          color: var(--dash-text);
          border: 1px solid rgba(255, 255, 255, 0.18) !important;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s, border-color 0.2s, transform 0.1s;
        }
        .btn-edit:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.35) !important;
        }
        .btn-builder {
          flex: 1;
          padding: 0.5rem;
          background: rgba(200, 16, 46, 0.08);
          color: var(--dash-accent);
          border: 1px solid rgba(200, 16, 46, 0.35) !important;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s, border-color 0.2s, transform 0.1s;
        }
        .btn-builder:hover {
          background: rgba(200, 16, 46, 0.16) !important;
          border-color: var(--dash-accent) !important;
        }
        .btn-delete {
          padding: 0.5rem 0.75rem;
          background: rgba(239, 68, 68, 0.06);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.25) !important;
          border-radius: 8px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: background-color 0.2s, border-color 0.2s, transform 0.1s;
        }
        .btn-delete:hover {
          background: rgba(239, 68, 68, 0.15) !important;
          border-color: #ef4444 !important;
        }
        .btn-add-course {
          padding: 0.6rem 1.25rem;
          background: var(--dash-accent);
          color: white;
          border: 1px solid var(--dash-accent);
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color 0.2s, border-color 0.2s, transform 0.1s;
        }
        .btn-add-course:hover {
          background: var(--dash-accent-hover);
          border-color: var(--dash-accent-hover);
          transform: translateY(-1px);
        }
        .btn-create-first {
          padding: 0.6rem 1.25rem;
          background: var(--dash-accent);
          color: white;
          border: 1px solid var(--dash-accent);
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s, border-color 0.2s;
        }
        .btn-create-first:hover {
          background: var(--dash-accent-hover);
          border-color: var(--dash-accent-hover);
        }

        /* ── LIGHT MODE OVERRIDES ── */
        :global([data-theme='light']) .course-card {
          background: #ffffff !important;
          border: 1px solid var(--dash-border) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04) !important;
        }
        :global([data-theme='light']) .course-card:hover {
          border-color: var(--dash-accent) !important;
          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08), 0 0 12px rgba(200, 16, 46, 0.1) !important;
        }
        :global([data-theme='light']) .btn-edit {
          background: #ffffff !important;
          color: #1a1a1a !important;
          border: 1px solid #d1d5db !important;
        }
        :global([data-theme='light']) .btn-edit:hover {
          background: #f3f4f6 !important;
          border-color: #9ca3af !important;
        }
        :global([data-theme='light']) .btn-builder {
          background: rgba(200, 16, 46, 0.04) !important;
          color: var(--dash-accent) !important;
          border: 1px solid rgba(200, 16, 46, 0.25) !important;
        }
        :global([data-theme='light']) .btn-builder:hover {
          background: rgba(200, 16, 46, 0.1) !important;
          border-color: var(--dash-accent) !important;
        }
        :global([data-theme='light']) .btn-delete {
          background: rgba(239, 68, 68, 0.03) !important;
          color: #ef4444 !important;
          border: 1px solid rgba(239, 68, 68, 0.2) !important;
        }
        :global([data-theme='light']) .btn-delete:hover {
          background: rgba(239, 68, 68, 0.08) !important;
          border-color: #ef4444 !important;
        }
      `}</style>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--dash-text-muted)' }}>
          Loading {config.name}...
        </div>

      ) : resource === 'courses' ? (
        /* ── COURSES: Card Grid View ── */
        <>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--dash-text)' }}>My Courses</h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--dash-text-muted)' }}>{data.length} course{data.length !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={() => { setEditingRow(null); setIsModalOpen(true); }}
              className="btn-add-course"
            >
              + Add New Course
            </button>
          </div>

          {/* Empty State */}
          {data.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <p style={{ color: 'var(--dash-text-muted)', marginBottom: '1rem' }}>No courses yet.</p>
              <button onClick={() => { setEditingRow(null); setIsModalOpen(true); }} className="btn-create-first">
                + Create First Course
              </button>
            </div>
          )}

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
            {data.map(course => (
              <div key={course._id} className="course-card">
                {/* Thumbnail */}
                <div style={{ position: 'relative', height: 155, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', flexShrink: 0 }}>
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>📖</div>
                  )}
                  {/* Published/Draft badge */}
                  <span style={{
                    position: 'absolute', top: 10, right: 10,
                    padding: '0.2rem 0.65rem', borderRadius: 50, fontSize: '0.7rem', fontWeight: 700,
                    background: course.isPublished ? 'rgba(46,213,115,0.15)' : 'rgba(255,171,0,0.15)',
                    color: course.isPublished ? '#2ed573' : '#ffab00',
                    border: `1px solid ${course.isPublished ? 'rgba(46,213,115,0.3)' : 'rgba(255,171,0,0.3)'}`,
                    backdropFilter: 'blur(4px)',
                  }}>
                    {course.isPublished ? '✓ Published' : '⏸ Draft'}
                  </span>
                  {/* Category badge */}
                  {course.category && (
                    <span style={{ position: 'absolute', top: 10, left: 10, padding: '0.2rem 0.6rem', borderRadius: 6, fontSize: '0.68rem', fontWeight: 700, background: 'var(--dash-accent)', color: 'white', letterSpacing: '0.04em' }}>
                      {course.category}
                    </span>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--dash-text)', lineHeight: 1.4, margin: 0 }}>
                    {course.title || 'Untitled Course'}
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--dash-text-muted)', margin: 0 }}>/{course.slug}</p>

                  {/* Meta */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: 4, fontSize: '0.75rem', color: 'var(--dash-text-muted)' }}>
                    <span>⏱ {course.totalHours || 0}h</span>
                    <span>👥 {(course.totalStudents || 0).toLocaleString()}</span>
                    <span>⭐ {course.rating || 0}</span>
                  </div>

                  {/* Price */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--dash-accent)' }}>
                      ₹{(course.price || 0).toLocaleString('en-IN')}
                    </span>
                    {course.originalPrice > 0 && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--dash-text-muted)', textDecoration: 'line-through' }}>
                        ₹{course.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => { setEditingRow(course); setIsModalOpen(true); }}
                    className="btn-edit"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => router.push(`/lms/instructor/courses/${course._id}/builder`)}
                    className="btn-builder"
                  >
                    ⚙️ Builder
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="btn-delete"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>

      ) : (
        /* ── ALL OTHER RESOURCES: DataTable ── */
        <DataTable
          resourceName={config.name}
          columns={columns}
          data={data}
          onAdd={() => { setEditingRow(null); setIsModalOpen(true); }}
          onEdit={(row) => { setEditingRow(row); setIsModalOpen(true); }}
          onDelete={handleDelete}
        />
      )}

      {isModalOpen && (
        <SchemaFormModal
          config={config}
          initialData={editingRow}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
