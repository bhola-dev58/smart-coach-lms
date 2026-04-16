'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import styles from '@/app/admin/admin.module.css';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊', roles: ['admin', 'instructor'] },
  { href: '/admin/courses', label: 'Manage Courses', icon: '📚', roles: ['admin', 'instructor'] },
  { href: '/admin/users', label: 'Manage Users', icon: '👥', roles: ['admin'] },
  { href: '/admin/enrollments', label: 'Enrollments', icon: '📝', roles: ['admin', 'instructor'] },
  { href: '/admin/payments', label: 'Financials', icon: '💳', roles: ['admin'] },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️', roles: ['admin'] },
];

export default function AdminSidebar({ userRole }) {
  const pathname = usePathname();

  const filteredNav = navItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logoBox}>MC</div>
        <div className={styles.brandText}>MeetMe Admin</div>
      </div>
      
      <nav className={styles.navConfig}>
        {filteredNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin') ? styles.active : ''}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <Link href="/" className={styles.navItem}>
           <span className={styles.icon}>🌐</span>
           Main Website
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/' })} className={styles.logoutBtn}>
          <span className={styles.icon}>🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
