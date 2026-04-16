'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserRoleForm({ user }) {
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: user._id, role }),
      });
      const data = await res.json();
      
      if (!data.success) throw new Error(data.error);
      
      alert('User role updated successfully');
      router.push('/admin/users');
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #eaeaea', maxWidth: '600px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{user.name}</h3>
        <div style={{ color: '#666', fontSize: '0.9rem' }}>{user.email}</div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#555' }}>Access Role</label>
        <select 
          value={role} 
          onChange={(e) => setRole(e.target.value)}
          style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem', background: '#f8f9fa' }}
        >
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Administrator</option>
        </select>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
          * Instructors can manage courses but not users or financial settings. Admins have full access.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          onClick={handleUpdate} 
          disabled={loading || role === user.role}
          style={{ 
            background: 'var(--color-primary)', color: 'white', padding: '0.8rem 2rem', 
            borderRadius: '8px', border: 'none', fontWeight: 600, cursor: (loading || role === user.role) ? 'not-allowed' : 'pointer',
            opacity: (loading || role === user.role) ? 0.7 : 1
          }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button onClick={() => router.back()} style={{ background: 'transparent', color: '#555', padding: '0.8rem 2rem', borderRadius: '8px', border: '1px solid #ccc', fontWeight: 600, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
