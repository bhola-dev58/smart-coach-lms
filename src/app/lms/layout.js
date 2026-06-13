'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import DashboardSidebar from '@/components/lms/DashboardSidebar';
import styles from './lms.module.css';

export default function LMSLayout({ children }) {
  const { data: session } = useSession();
  const userName = session?.user?.name || 'Student';
  const userInitial = userName.charAt(0).toUpperCase();
  const userImageUrl = session?.user?.image || session?.user?.avatar;

  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse
  const [theme, setTheme] = useState('dark');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Check saved theme or system preference
    const saved = localStorage.getItem('lmsTheme');
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  useEffect(() => {
    const handleCloseDropdown = () => setDropdownOpen(false);
    window.addEventListener('click', handleCloseDropdown);
    return () => window.removeEventListener('click', handleCloseDropdown);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('lmsTheme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className={styles.lmsWrapper}>
      <DashboardSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <div className={`${styles.mainContent} ${isCollapsed ? styles.mainContentCollapsed : ''}`}>
        
        {/* Universal Top Bar */}
        <div className={styles.topBar}>
          <div className={styles.welcomeText}>
            <h1>Welcome back, {userName}!</h1>
            <p>Let&apos;s conquer new heights today.</p>
          </div>
          <div className={styles.topBarActions}>
            <select className={styles.filterSelect}>
              <option>All Course</option>
              <option>CSE</option>
              <option>ECE</option>
              <option>Mechanical</option>
            </select>
            <div className={styles.searchBox}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Search" />
            </div>

            <button className={styles.notifBtn} onClick={toggleTheme} aria-label="Toggle Theme" title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
            
            <button className={styles.notifBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className={styles.notifBadge}>2</span>
            </button>
            <div className={styles.profileWrapper} onClick={(e) => e.stopPropagation()}>
              <button 
                className={styles.profileBtn}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div 
                  className={styles.avatar} 
                  style={{ 
                    overflow: 'hidden',
                    background: userImageUrl ? 'transparent' : 'var(--dash-accent)' 
                  }}
                >
                  {userImageUrl ? (
                    <img src={userImageUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    userInitial
                  )}
                </div>
                <span className={styles.profileName}>Profile</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownName}>{session?.user?.name || 'Student'}</div>
                    <div className={styles.dropdownEmail}>{session?.user?.email || ''}</div>
                  </div>
                  {session?.user?.role === 'admin' && (
                    <Link href="/admin" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l9 4.9V17L12 22l-9-4.9V6.9z"></path></svg>
                      Admin Panel
                    </Link>
                  )}
                  {session?.user?.role === 'instructor' && (
                    <Link href="/lms/instructor" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                      Instructor Panel
                    </Link>
                  )}
                  <button onClick={() => signOut({ callbackUrl: '/' })} className={styles.dropdownItem}>
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {children}
      </div>
      {/* Mobile toggle */}
      <button
        className={styles.mobileToggle}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>
    </div>
  );
}
