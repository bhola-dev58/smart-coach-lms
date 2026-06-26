'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import styles from '@/app/admin/admin.module.css';
import UiIcon from '@/components/common/UiIcon';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard', roles: ['admin', 'instructor'] },
  { href: '/admin/courses', label: 'Manage Courses', icon: 'book', roles: ['admin', 'instructor'] },
  { href: '/admin/categories', label: 'Course Categories', icon: 'tag', roles: ['admin'] },
  { href: '/admin/users', label: 'Manage Users', icon: 'users', roles: ['admin'] },
  { href: '/admin/enrollments', label: 'Enrollments', icon: 'document', roles: ['admin', 'instructor'] },
  { href: '/admin/payments', label: 'Financials', icon: 'card', roles: ['admin'] },
  { href: '/admin/practice', label: 'Practice Analytics', icon: 'target', roles: ['admin'] },
  { href: '/admin/settings', label: 'Settings', icon: 'gear', roles: ['admin'] },
];

export default function AdminSidebar({ userRole }) {
  const pathname = usePathname();

  const filteredNav = navItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <img src="/images/logo-only.png" alt="Gradify Academy" style={{ height: '40px', width: 'auto' }} />
      </div>
      
      <nav className={styles.navConfig}>
        {filteredNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin') ? styles.active : ''}`}
          >
            <span className={styles.icon} style={{ display: 'flex', alignItems: 'center' }}>
              <UiIcon name={item.icon} size={18} color="currentColor" />
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <Link href="/" className={styles.navItem}>
           <span className={styles.icon} style={{ display: 'flex', alignItems: 'center' }}>
             <UiIcon name="website" size={18} color="currentColor" />
           </span>
           Main Website
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/' })} className={styles.logoutBtn}>
          <span className={styles.icon} style={{ display: 'flex', alignItems: 'center' }}>
            <UiIcon name="logout" size={18} color="currentColor" />
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
}

