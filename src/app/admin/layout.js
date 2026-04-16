import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import styles from './admin.module.css';

export const metadata = {
  title: 'Admin Panel — MeetMe Center',
};

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  // Check if admin or instructor
  if (!session || !['admin', 'instructor'].includes(session.user?.role)) {
    redirect('/?auth=login'); // Or show an unauthorized page
  }

  return (
    <div className={styles.adminLayout}>
      <AdminSidebar userRole={session.user.role} />
      <div className={styles.adminMain}>
        <header className={styles.adminHeader}>
          <div className={styles.headerLeft}>
            <h1>Admin Control Panel</h1>
          </div>
          <div className={styles.headerRight}>
             <div className={styles.userBadge}>
                {session.user.role.toUpperCase()}
             </div>
             <div>{session.user.name}</div>
          </div>
        </header>
        <main className={styles.adminContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
