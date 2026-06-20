'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminUsersTable({ initialUsers }) {
  const [activeTab, setActiveTab] = useState('all');

  const students = initialUsers.filter(u => u.role === 'student');
  const instructors = initialUsers.filter(u => u.role === 'instructor');
  const admins = initialUsers.filter(u => u.role === 'admin');

  const getFilteredUsers = () => {
    switch (activeTab) {
      case 'student': return students;
      case 'instructor': return instructors;
      case 'admin': return admins;
      default: return initialUsers;
    }
  };

  const filteredUsers = getFilteredUsers();

  const tabs = [
    { id: 'all', label: 'All Users', count: initialUsers.length },
    { id: 'student', label: 'Students', count: students.length },
    { id: 'instructor', label: 'Instructors', count: instructors.length },
    { id: 'admin', label: 'Admins', count: admins.length }
  ];

  return (
    <div>
      {/* Premium Tabs Selection */}
      <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '2px solid #eaeaea', marginBottom: '2rem', paddingBottom: '0.2rem' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.8rem 0.5rem',
              fontSize: '0.95rem',
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? 'var(--color-primary)' : '#666',
              borderBottom: activeTab === tab.id ? '3px solid var(--color-primary)' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '-3px',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
            <span style={{
              background: activeTab === tab.id ? 'rgba(27, 43, 107, 0.1)' : '#f0f0f0',
              color: activeTab === tab.id ? 'var(--color-primary)' : '#666',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Users Count Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          Showing <strong>{filteredUsers.length}</strong> of <strong>{initialUsers.length}</strong> registered accounts
        </p>
      </div>

      {/* Table Container */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #eaeaea', overflowX: 'auto' }}>
        {filteredUsers.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
            No users found with this role.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eaeaea' }}>
                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>User Details</th>
                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>Email</th>
                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>Role Badge</th>
                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>Joined Date</th>
                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.9rem', color: '#333', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id} style={{ borderBottom: '1px solid #eaeaea' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: '#1a1a1a' }}>
                    {user.name}
                  </td>
                  <td style={{ padding: '1rem', color: '#555', fontSize: '0.9rem' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      background: user.role === 'admin' ? 'rgba(200, 16, 46, 0.1)' : 
                                 user.role === 'instructor' ? 'rgba(52, 152, 219, 0.1)' : 'rgba(234, 236, 240, 1)',
                      color: user.role === 'admin' ? '#c8102e' : 
                             user.role === 'instructor' ? '#3498db' : '#475467',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#666' }}>
                     {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <Link href={`/admin/users/${user._id}/edit`} style={{ 
                      padding: '0.45rem 1rem', 
                      background: 'var(--color-primary-light)', 
                      color: 'var(--color-primary)', 
                      borderRadius: '8px', 
                      textDecoration: 'none', 
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      display: 'inline-block'
                    }}>
                      Manage Account
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
