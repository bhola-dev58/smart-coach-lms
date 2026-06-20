import { connectDB } from '@/lib/db';
import User from '@/models/User';
import AdminUsersTable from '@/components/admin/AdminUsersTable';
import styles from '@/app/admin/admin.module.css';

export const metadata = { title: 'Manage Users | Admin' };

export default async function AdminUsersPage() {
  await connectDB();
  
  const rawUsers = await User.find({}).sort({ createdAt: -1 }).lean();
  
  // Convert _id and date objects to clean strings to prevent Next.js serialization warnings
  const serializedUsers = rawUsers.map(user => ({
    ...user,
    _id: user._id.toString(),
    createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString()
  }));
  
  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Manage Users</h2>
      </div>

      <AdminUsersTable initialUsers={serializedUsers} />
    </div>
  );
}
