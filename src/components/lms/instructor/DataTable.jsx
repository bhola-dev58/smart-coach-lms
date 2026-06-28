import { useState, useEffect } from 'react';

// A dynamic table component capable of taking dynamic columns and rows
export default function DataTable({ columns, data = [], onEdit, onDelete, onAdd, resourceName }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    setSelectedCourse('all');
    setSelectedBatch('all');
    setSelectedStatus('all');
    setSearchTerm('');
  }, [resourceName]);

  const uniqueCourses = Array.from(new Set(data.map(row => {
    if (row.course) {
      return typeof row.course === 'object' ? (row.course.title || '') : String(row.course);
    }
    return '';
  }).filter(Boolean)));

  const uniqueBatches = Array.from(new Set(data.map(row => {
    if (row.batch) {
      return typeof row.batch === 'object' ? (row.batch.name || '') : String(row.batch);
    }
    return '';
  }).filter(Boolean)));

  const uniqueStatuses = Array.from(new Set(data.map(row => {
    return row.status ? String(row.status) : '';
  }).filter(Boolean)));

  // Enhanced search and select filters
  const filteredData = data.filter(row => {
    // 1. Course Filter
    if (selectedCourse !== 'all') {
      const courseVal = row.course;
      const courseTitle = typeof courseVal === 'object' && courseVal !== null ? (courseVal.title || '') : String(courseVal || '');
      if (courseTitle !== selectedCourse) return false;
    }

    // 2. Batch Filter
    if (selectedBatch !== 'all') {
      const batchVal = row.batch;
      const batchName = typeof batchVal === 'object' && batchVal !== null ? (batchVal.name || '') : String(batchVal || '');
      if (batchName !== selectedBatch) return false;
    }

    // 3. Status Filter
    if (selectedStatus !== 'all') {
      const statusVal = row.status ? String(row.status) : '';
      if (statusVal !== selectedStatus) return false;
    }

    // 4. Deep search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      
      const matchField = (val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === 'object') {
          return Object.values(val).some(nestedVal => {
            if (typeof nestedVal === 'object') return false; // max 1 level recursion
            return String(nestedVal).toLowerCase().includes(term);
          });
        }
        return String(val).toLowerCase().includes(term);
      };

      return Object.values(row).some(matchField);
    }

    return true;
  });

  return (
    <div style={{ background: 'var(--dash-surface)', borderRadius: 'var(--dash-radius)', border: '1px solid var(--dash-border)', overflow: 'hidden' }}>
      <style>{`
        .table-filter-group {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          flex-wrap: wrap;
        }
        @media (max-width: 768px) {
          .table-filter-group {
            width: 100%;
          }
          .table-filter-group select, 
          .table-filter-group input {
            flex: 1;
            min-width: 130px !important;
            width: 100% !important;
          }
          .table-filter-group button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      {/* Header and Actions */}
      <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--dash-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ margin: 0, textTransform: 'capitalize', fontSize: '1.1rem', color: 'var(--dash-text)', fontWeight: 700 }}>
          {resourceName}
        </h3>
        
        <div className="table-filter-group">
          {/* Course Filter */}
          {uniqueCourses.length > 0 && (
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.06)',
                border: '1px solid var(--dash-border)',
                padding: '0.5rem 1.75rem 0.5rem 0.75rem',
                borderRadius: '6px',
                color: 'var(--dash-text)',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1rem',
              }}
            >
              <option value="all" style={{ background: 'var(--dash-surface)', color: 'var(--dash-text)' }}>All Courses</option>
              {uniqueCourses.map(c => (
                <option key={c} value={c} style={{ background: 'var(--dash-surface)', color: 'var(--dash-text)' }}>{c}</option>
              ))}
            </select>
          )}

          {/* Batch Filter */}
          {uniqueBatches.length > 0 && (
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.06)',
                border: '1px solid var(--dash-border)',
                padding: '0.5rem 1.75rem 0.5rem 0.75rem',
                borderRadius: '6px',
                color: 'var(--dash-text)',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1rem',
              }}
            >
              <option value="all" style={{ background: 'var(--dash-surface)', color: 'var(--dash-text)' }}>All Batches</option>
              {uniqueBatches.map(b => (
                <option key={b} value={b} style={{ background: 'var(--dash-surface)', color: 'var(--dash-text)' }}>{b}</option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          {uniqueStatuses.length > 0 && (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.06)',
                border: '1px solid var(--dash-border)',
                padding: '0.5rem 1.75rem 0.5rem 0.75rem',
                borderRadius: '6px',
                color: 'var(--dash-text)',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1rem',
              }}
            >
              <option value="all" style={{ background: 'var(--dash-surface)', color: 'var(--dash-text)' }}>All Statuses</option>
              {uniqueStatuses.map(s => (
                <option key={s} value={s} style={{ background: 'var(--dash-surface)', color: 'var(--dash-text)' }}>{s}</option>
              ))}
            </select>
          )}

          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.06)',
              border: '1px solid var(--dash-border)',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              color: 'var(--dash-text)',
              fontSize: '0.85rem',
              outline: 'none',
              minWidth: '180px',
            }}
          />
          <button 
            onClick={onAdd}
            style={{
              padding: '0.55rem 1rem',
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add New
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
              <th style={{ 
                padding: '0.65rem 1rem', 
                color: 'var(--dash-text-secondary)', 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                borderBottom: '1px solid var(--dash-border)',
                borderRight: '1px solid var(--dash-border)',
                width: '55px',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}>
                S.No.
              </th>
              {columns.map(col => {
                const isLongText = ['question', 'optionA', 'optionB', 'optionC', 'optionD', 'description', 'content'].includes(col.key);
                return (
                  <th key={col.key} style={{ 
                    padding: '0.65rem 1rem', 
                    color: 'var(--dash-text-secondary)', 
                    fontSize: '0.8rem', 
                    fontWeight: 600, 
                    borderBottom: '1px solid var(--dash-border)',
                    borderRight: '1px solid var(--dash-border)',
                    whiteSpace: 'nowrap',
                    minWidth: isLongText ? '240px' : 'auto',
                    maxWidth: isLongText ? '380px' : 'none',
                  }}>
                    {col.label}
                  </th>
                );
              })}
              <th style={{ 
                padding: '0.65rem 1rem', 
                color: 'var(--dash-text-secondary)', 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                borderBottom: '1px solid var(--dash-border)', 
                width: '100px', 
                textAlign: 'right',
                whiteSpace: 'nowrap'
              }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} style={{ padding: '3rem', textAlign: 'center', color: 'var(--dash-text-muted)', fontSize: '0.9rem' }}>
                  No {resourceName} found.
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => (
                <tr key={row._id || idx} style={{ borderBottom: '1px solid var(--dash-border)' }}>
                  <td style={{ 
                    padding: '0.65rem 1rem', 
                    color: 'var(--dash-text-secondary)', 
                    fontSize: '0.85rem',
                    borderRight: '1px solid var(--dash-border)',
                    textAlign: 'center',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    verticalAlign: 'top'
                  }}>
                    {idx + 1}
                  </td>
                  {columns.map(col => {
                    const isLongText = ['question', 'optionA', 'optionB', 'optionC', 'optionD', 'description', 'content'].includes(col.key);
                    return (
                      <td key={col.key} style={{ 
                        padding: '0.65rem 1rem', 
                        color: 'var(--dash-text)', 
                        fontSize: '0.85rem',
                        borderRight: '1px solid var(--dash-border)',
                        whiteSpace: isLongText ? 'normal' : 'nowrap',
                        minWidth: isLongText ? '240px' : 'auto',
                        maxWidth: isLongText ? '380px' : 'none',
                        wordBreak: 'break-word',
                        verticalAlign: 'top',
                        lineHeight: 1.5,
                      }}>
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    );
                  })}
                  <td style={{ padding: '0.65rem 1rem', textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                    <button onClick={() => onEdit(row)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '0.75rem', padding: '0.2rem' }} title="Edit">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button onClick={() => onDelete(row._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }} title="Delete">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
