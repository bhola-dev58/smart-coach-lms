'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import styles from '@/app/lms/lms.module.css';

// ── Simple SVG Icons ──
function NavIcon({ name }) {
  const icons = {
    home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    video: <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></>,
    money: <><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></>,
    clipboard: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></>,
  };
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.navIcon}>
      {icons[name]}
    </svg>
  );
}

export default function InstructorSidebar({ isOpen, onClose, isCollapsed, onToggle }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/instructor', label: 'Dashboard', icon: 'home' },
    { href: '/instructor/courses', label: 'My Courses', icon: 'book' },
    { href: '/instructor/live', label: 'Live Sessions', icon: 'video' },
    { href: '/instructor/materials', label: 'Study Materials', icon: 'clipboard' },
    { href: '/instructor/students', label: 'Students', icon: 'users' },
    { href: '/instructor/assignments', label: 'Assignments', icon: 'clipboard' },
    { href: '/instructor/earnings', label: 'Earnings', icon: 'money' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`} 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
        
        {/* Logo */}
        <div className={styles.sidebarLogo}>
          <div className={styles.logoIcon} style={{ background: 'var(--dash-accent)', color: 'white' }}>IN</div>
          {!isCollapsed && <span className={styles.logoText}>Instructor</span>}
          {/* Desktop Collapse Toggle */}
          <button className={styles.collapseBtn} onClick={onToggle} aria-label="Toggle Sidebar">
            {isCollapsed ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>
            )}
          </button>
        </div>

        {/* Plan CTA (Optional, but let's match the student one) */}
        {!isCollapsed && <button className={styles.planBtn} style={{ background: 'rgba(200,16,46,0.1)', color: 'var(--dash-accent)' }}>🎙️ Start Broadcast</button>}

        {/* Navigation */}
        <nav className={styles.navSection}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
              onClick={onClose}
              title={isCollapsed ? item.label : ''}
            >
              <NavIcon name={item.icon} />
              {!isCollapsed && item.label}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div style={{ padding: isCollapsed ? '1.5rem 0.6rem' : '1.5rem 1.25rem', marginTop: 'auto' }}>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            title={isCollapsed ? 'Logout' : ''}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '0.75rem',
              padding: isCollapsed ? '0.75rem 0' : '0.75rem 1rem',
              background: 'transparent',
              border: '1px solid var(--dash-border)',
              borderRadius: '8px',
              color: 'var(--dash-text)',
              fontSize: '0.9rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => { 
              e.currentTarget.style.background = 'rgba(200,16,46,0.1)'; 
              e.currentTarget.style.color = 'var(--dash-accent)'; 
              e.currentTarget.style.borderColor = 'var(--dash-accent)'; 
            }}
            onMouseOut={(e) => { 
              e.currentTarget.style.background = 'transparent'; 
              e.currentTarget.style.color = 'var(--dash-text)'; 
              e.currentTarget.style.borderColor = 'var(--dash-border)'; 
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: isCollapsed ? '0' : '' }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            {!isCollapsed && 'Logout'}
          </button>
        </div>
      </aside>
    </>
  );
}
