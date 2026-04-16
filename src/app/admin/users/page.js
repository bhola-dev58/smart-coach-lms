import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Link from 'next/link';
import styles from '@/app/admin/admin.module.css';

export const metadata = { title: 'Manage Users | Admin' };

export default async function AdminUsersPage() {
  await connectDB();
  
  const users = await User.find({}).sort({ createdAt: -1 }).lean();
  
  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Manage Users</h2>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eaeaea' }}>
              <th style={{ padding: '1rem', fontWeight: '600' }}>User</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Role</th>
              <th style={{ padding: '1rem', fontWeight: '600' }}>Joined</th>
              <th style={{ padding: '1rem', fontWeight: '600', maxWidth: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id.toString()} style={{ borderBottom: '1px solid #eaeaea' }}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{user.name}</td>
                <td style={{ padding: '1rem', color: '#666' }}>{user.email}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '6px', 
                    fontSize: '0.75rem', 
                    background: user.role === 'admin' ? 'rgba(200, 16, 46, 0.1)' : 
                               user.role === 'instructor' ? 'rgba(52, 152, 219, 0.1)' : 'rgba(234, 236, 240, 1)',
                    color: user.role === 'admin' ? '#c8102e' : 
                           user.role === 'instructor' ? '#3498db' : '#475467',
                    fontWeight: 600,
                    textTransform: 'capitalize'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                   {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem' }}>
                  <Link href={`/admin/users/${user._id}/edit`} style={{ 
                    padding: '0.4rem 0.8rem', 
                    background: '#f0f0f0', 
                    color: '#333', 
                    borderRadius: '6px', 
                    textDecoration: 'none', 
                    fontSize: '0.85rem',
                    fontWeight: 500
                  }}>
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
