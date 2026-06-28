'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/app/lms/lms.module.css';
import { useSession } from 'next-auth/react';

// ── Nav Items ──
const getNavItems = (role) => {
  const isInstructorAdmin = role === 'instructor' || role === 'admin';
  let items = [];

  if (isInstructorAdmin) {
    items = [
      { href: '/lms', label: 'Dashboard', icon: 'home' },
      { href: '/lms/instructor', label: 'Instructor Panel', icon: 'briefcase' },
      { href: '/lms/browse', label: 'Browse Courses', icon: 'layers' },
    ];
  } else {
    items = [
      { href: '/lms', label: 'Dashboard', icon: 'home' },
      { href: '/lms/live', label: 'Live Classes', icon: 'video' },
      { href: '/lms/courses', label: 'My Courses', icon: 'book' },
      { href: '/lms/tests', label: 'My Test Series', icon: 'clipboard' },
      { href: '/lms/browse', label: 'Browse Courses', icon: 'layers' },
      { href: '/lms/materials', label: 'Study Materials', icon: 'file-text' },
      { href: '/lms/practice', label: 'Practice', icon: 'target' },
      { href: '/lms/certificates', label: 'Certificates', icon: 'award' },
      { href: '/lms/notifications', label: 'Notifications', icon: 'bell' },
    ];
  }
  items.push({ href: '/lms/profile', label: 'My Profile', icon: 'user' });
  return items;
};

// ── Instructor Navigation Groups ──
const menuGroups = [
  {
    title: 'Academics',
    items: [
      { id: 'courses', label: 'Courses', icon: 'book' },
      { id: 'batches', label: 'Batches', icon: 'users' },
      { id: 'enrollments', label: 'Enrollments', icon: 'document' },
      { id: 'studymaterials', label: 'Study Materials', icon: 'file' },
      { id: 'reviews', label: 'Reviews', icon: 'award' },
      { id: 'practicequestions', label: 'Practice Questions', icon: 'target' },
      { id: 'certificates', label: 'Certificates', icon: 'trophy' },
    ]
  },
  {
    title: 'Engagement',
    items: [
      { id: 'assignments', label: 'Assignments', icon: 'edit' },
      { id: 'assignmentsubmissions', label: 'Submissions', icon: 'download' },
      { id: 'discussions', label: 'Discussions', icon: 'chat' },
    ]
  },
  {
    title: 'Communication',
    items: [
      { id: 'livesessions', label: 'Live Sessions', icon: 'bell' },
      { id: 'live', label: 'Live Classes Room', icon: 'video', href: '/lms/live' },
      { id: 'announcements', label: 'Announcements', icon: 'speaker' },
    ]
  },
  {
    title: 'Finance & Ops',
    items: [
      { id: 'payments', label: 'Payments', icon: 'cash' },
      { id: 'coupons', label: 'Coupons', icon: 'tag' },
      { id: 'contacts', label: 'Contacts', icon: 'phone' },
    ]
  }
];

// ── Simple SVG Icons ──
function NavIcon({ name }) {
  const icons = {
    home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    video: <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>,
    clipboard: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    award: <><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></>,
    layers: <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
    'file-text': <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
    target: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    briefcase: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
    'check-square': <><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    trophy: <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34M12 2a7 7 0 0 1 7 7c0 4.18-3.07 7.6-7 7.97V2z"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    chat: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
    speaker: <><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></>,
    cash: <><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></>,
    tag: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>,
    phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.11 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></>,
  };
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.navIcon}>
      {icons[name] || icons.home}
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
export default function DashboardSidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const role = session?.user?.role || 'student';
  const isAdmin = role === 'admin';
  const currentNavItems = getNavItems(role);
  const isInstructorAdmin = role === 'instructor' || role === 'admin';

  const renderNavItems = () => {
    if (status === 'loading') {
      const isInstructorPath = pathname?.startsWith('/lms/instructor');
      return (
        <div style={{ padding: '0.5rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <style>{`
            @keyframes sidebar-pulse {
              0% { opacity: 0.4; }
              50% { opacity: 0.85; }
              100% { opacity: 0.4; }
            }
            .skeleton-item {
              height: 34px;
              background: rgba(0,0,0,0.06);
              border-radius: 6px;
              animation: sidebar-pulse 1.5s infinite ease-in-out;
            }
            [data-theme='dark'] .skeleton-item {
              background: rgba(255,255,255,0.04) !important;
            }
          `}</style>
          {isInstructorPath ? (
            <>
              <div className="skeleton-item" style={{ width: '85%' }} />
              <div className="skeleton-item" style={{ width: '90%' }} />
              <div className="skeleton-item" style={{ width: '75%' }} />
              <div style={{ borderBottom: '1px solid var(--dash-border)', margin: '0.4rem 0' }} />
              <div className="skeleton-item" style={{ width: '40%', height: '14px', marginBottom: '0.2rem' }} />
              <div className="skeleton-item" style={{ width: '80%' }} />
              <div className="skeleton-item" style={{ width: '85%' }} />
              <div className="skeleton-item" style={{ width: '70%' }} />
            </>
          ) : (
            <>
              <div className="skeleton-item" style={{ width: '85%' }} />
              <div className="skeleton-item" style={{ width: '90%' }} />
              <div className="skeleton-item" style={{ width: '75%' }} />
              <div className="skeleton-item" style={{ width: '80%' }} />
              <div className="skeleton-item" style={{ width: '85%' }} />
              <div className="skeleton-item" style={{ width: '70%' }} />
            </>
          )}
        </div>
      );
    }

    if (!isInstructorAdmin) {
      return (
        <nav className={styles.navSection} style={{ flex: 'none', overflowY: 'visible' }}>
          {currentNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={onClose}
                title={isCollapsed ? item.label : ''}
              >
                <NavIcon name={item.icon} />
                {!isCollapsed && item.label}
              </Link>
            );
          })}
        </nav>
      );
    }

    const instructorTopNavItems = [
      { href: '/lms', label: 'Dashboard', icon: 'home' },
      { href: '/lms/instructor', label: 'Instructor Panel', icon: 'briefcase' },
      { href: '/lms/browse', label: 'Browse Courses', icon: 'layers' },
      { href: '/lms/profile', label: 'My Profile', icon: 'user' },
    ];

    // Instructor Mode: Unified Hybrid Sidebar View (Matches user screenshot)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '1rem' }}>
        {/* Top level links */}
        <nav className={styles.navSection} style={{ flex: 'none', overflowY: 'visible', marginBottom: 0 }}>
          {instructorTopNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/lms/instructor' && pathname.startsWith('/lms/instructor') && !menuGroups.some(g => g.items.some(sub => pathname.startsWith(`/lms/instructor/${sub.id}`))));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={onClose}
                title={isCollapsed ? item.label : ''}
              >
                <NavIcon name={item.icon} />
                {!isCollapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {!isCollapsed && <div style={{ borderBottom: '1px solid var(--dash-border)', margin: '0 1.25rem' }} />}

        {/* Academics, Engagement, Communication Groups */}
        {menuGroups
          .filter(group => group.title !== 'Finance & Ops' || isAdmin)
          .map((group, idx) => (
            <div key={idx}>
              {!isCollapsed && (
                <h4 style={{
                  fontSize: '0.68rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--dash-text-muted)',
                  marginBottom: '0.45rem',
                  paddingLeft: '1.25rem',
                  fontWeight: 700
                }}>
                  {group.title}
                </h4>
              )}
              <nav className={styles.navSection} style={{ flex: 'none', overflowY: 'visible', gap: '0.2rem', marginBottom: 0 }}>
                {group.items.map((item) => {
                  const href = item.href || `/lms/instructor/${item.id}`;
                  const isActive = pathname === href || pathname.startsWith(href + '/');
                  return (
                    <Link
                      key={item.id}
                      href={href}
                      className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                      onClick={onClose}
                      title={isCollapsed ? item.label : ''}
                      style={{ height: '36px' }}
                    >
                      <NavIcon name={item.icon} />
                      {!isCollapsed && item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
        onClick={onClose}
      />

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
        {/* Logo */}
        <div className={styles.sidebarLogo}>
          <Link href="/" title="Back to Home" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {!isCollapsed
              ? <img src="/images/logo-only.png" alt="Gradify Academy" style={{ height: '38px', width: 'auto' }} />
              : <img src="/images/logo-during-collision.png" alt="GA" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
            }
          </Link>
        </div>

        {/* Desktop Collapse Toggle / Mobile Close Toggle */}
        <button
          className={styles.collapseBtn}
          onClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth <= 768) {
              onClose();
            } else {
              onToggleCollapse();
            }
          }}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>
          )}
        </button>

        {/* Plan CTA */}
        {!isCollapsed && <button className={styles.planBtn}>📋 Plan Your Day</button>}

        {/* Navigation scroll wrapper */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
            {renderNavItems()}
          </div>

          {/* Calendar */}
          {!isCollapsed && (
            <div style={{ marginTop: 'auto', paddingTop: '1rem', paddingBottom: '0.75rem', flexShrink: 0 }}>
              <CalendarWidget />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
