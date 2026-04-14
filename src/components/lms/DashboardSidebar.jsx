'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import styles from '@/app/lms/lms.module.css';

// ── Nav Items ──
const navItems = [
  { href: '/lms', label: 'Dashboard', icon: 'home' },
  { href: '/lms/live', label: 'Live Classes', icon: 'video' },
  { href: '/lms/courses', label: 'My Courses', icon: 'book' },
  { href: '/lms/tests', label: 'My Test Series', icon: 'clipboard' },
  { href: '/lms/answers', label: 'Answer Writing', icon: 'edit' },
  { href: '/lms/browse', label: 'Browse Courses', icon: 'layers' },
  { href: '/lms/materials', label: 'Study Materials', icon: 'file-text' },
  { href: '/lms/practice', label: 'Practice', icon: 'target' },
];

// ── Simple SVG Icons ──
function NavIcon({ name }) {
  const icons = {
    home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    video: <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>,
    clipboard: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    layers: <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
    'file-text': <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
    target: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
  };
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.navIcon}>
      {icons[name]}
    </svg>
  );
}

// ── Calendar Widget ──
function CalendarWidget() {
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long' });
  const today = now.getDate();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(<span key={`e-${i}`}></span>);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(<span key={d} className={d === today ? styles.today : ''}>{d}</span>);
  }

  return (
    <div className={styles.calendarWidget}>
      <div className={styles.calendarHeader}>
        <button className={styles.calendarArrow}>&lt;</button>
        <span>{month}</span>
        <button className={styles.calendarArrow}>&gt;</button>
      </div>
      <div className={styles.calendarGrid}>
        {days.map(d => <span key={d} className={styles.dayLabel}>{d}</span>)}
        {cells}
      </div>
    </div>
  );
}

// ── Sidebar Component ──
export default function DashboardSidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
        onClick={onClose}
      />

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        {/* Logo */}
        <div className={styles.sidebarLogo}>
          <div className={styles.logoIcon}>MC</div>
          <span className={styles.logoText}>MeetMe Center</span>
        </div>

        {/* Plan CTA */}
        <button className={styles.planBtn}>📋 Plan Your Day</button>

        {/* Navigation */}
        <nav className={styles.navSection}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
              onClick={onClose}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Calendar */}
        <CalendarWidget />
      </aside>
    </>
  );
}
