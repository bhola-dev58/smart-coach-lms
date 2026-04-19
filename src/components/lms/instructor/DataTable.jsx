'use client';

import { useState } from 'react';

// A dynamic table component capable of taking dynamic columns and rows
export default function DataTable({ columns, data, onEdit, onDelete, onAdd, resourceName }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Very basic search filter
  const filteredData = data.filter(row => {
    return Object.values(row).some(
      val => String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div style={{ background: 'var(--dash-surface)', borderRadius: 'var(--dash-radius)', border: '1px solid var(--dash-border)', overflow: 'hidden' }}>
      {/* Header and Actions */}
      <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--dash-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ margin: 0, textTransform: 'capitalize', fontSize: '1.1rem', color: 'var(--dash-text)' }}>
          {resourceName}
        </h3>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--dash-border)',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              color: 'var(--dash-text)',
              fontSize: '0.85rem',
              outline: 'none',
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
              {columns.map(col => (
                <th key={col.key} style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.8rem', fontWeight: 600, borderBottom: '1px solid var(--dash-border)' }}>
                  {col.label}
                </th>
              ))}
              <th style={{ padding: '1rem', color: 'var(--dash-text-secondary)', fontSize: '0.8rem', fontWeight: 600, borderBottom: '1px solid var(--dash-border)', width: '100px', textAlign: 'right' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={{ padding: '3rem', textAlign: 'center', color: 'var(--dash-text-muted)' }}>
                  No {resourceName} found.
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => (
                <tr key={row._id || idx} style={{ borderBottom: '1px solid var(--dash-border)' }}>
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: '1rem', color: 'var(--dash-text)', fontSize: '0.9rem' }}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => onEdit(row)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '0.75rem' }} title="Edit">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button onClick={() => onDelete(row._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Delete">
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
