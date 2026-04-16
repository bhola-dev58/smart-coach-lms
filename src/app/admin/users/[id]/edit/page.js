import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import UserRoleForm from '@/components/admin/UserRoleForm';
import styles from '@/app/admin/admin.module.css';

export const metadata = { title: 'Manage User Role | Admin' };

export default async function EditUserPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
      redirect('/admin');
  }

  await connectDB();
  const { id } = await params;
  
  const user = await User.findById(id).lean();
  if (!user) notFound();

  const serialized = { ...user, _id: user._id.toString() };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Edit User Access</h2>
      </div>
      <UserRoleForm user={serialized} />
    </div>
  );
}
