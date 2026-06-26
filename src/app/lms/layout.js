'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import DashboardSidebar from '@/components/lms/DashboardSidebar';
import NotificationBell from '@/components/layout/NotificationBell';
import UiIcon from '@/components/common/UiIcon';
import styles from './lms.module.css';

function CategorySelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'All';
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let active = true;
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (active && data.success) {
          setCategories(data.categories || []);
        }
      })
      .catch((err) => console.error('Failed to load categories:', err));
    return () => {
      active = false;
    };
  }, []);

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    if (val === 'All') {
      router.push('/lms/browse');
    } else {
      router.push(`/lms/browse?category=${val}`);
    }
  };

  return (
    <select 
      className={styles.filterSelect}
      value={currentCategory}
      onChange={handleCategoryChange}
    >
      <option value="All">All Courses</option>
      {categories.map((cat) => (
        <option key={cat._id} value={cat.name}>
          {cat.label}
        </option>
      ))}
    </select>
  );
}

export default function LMSLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const userName = session?.user?.name || 'Student';
  const userInitial = userName.charAt(0).toUpperCase();
  const userImageUrl = session?.user?.image || session?.user?.avatar;

  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse
  const [theme, setTheme] = useState('light');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [enrolledCount, setEnrolledCount] = useState(null);
  const [isUnderMaintenance, setIsUnderMaintenance] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    let active = true;
    if (session && session.user?.role !== 'admin') {
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
          if (active && data.success && data.settings?.maintenanceMode) {
            setIsUnderMaintenance(true);
          }
        })
        .catch(err => console.error('[Maintenance check error]', err));
    } else if (session && session.user?.role === 'admin') {
      if (active) setIsUnderMaintenance(false);
    }
    return () => { active = false; };
  }, [session]);

  useEffect(() => {
    // Check saved theme or system preference
    const saved = localStorage.getItem('lmsTheme');
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  useEffect(() => {
    const handleCloseDropdown = () => setDropdownOpen(false);
    window.addEventListener('click', handleCloseDropdown);
    return () => window.removeEventListener('click', handleCloseDropdown);
  }, []);

  useEffect(() => {
    if (pathname === '/lms/courses') {
      fetch('/api/lms/my-courses')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setEnrolledCount(data.courses?.length || 0);
          }
        })
        .catch(err => console.error(err));
    }
  }, [pathname]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('lmsTheme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const getHeaderContent = () => {
    if (pathname === '/lms') {
      return {
        title: `Welcome back, ${userName}!`,
        subtitle: "Let's conquer new heights today."
      };
    }
    if (pathname === '/lms/courses') {
      const countText = enrolledCount === null 
        ? "Loading your courses..." 
        : enrolledCount > 0 
          ? `You have ${enrolledCount} enrolled course${enrolledCount > 1 ? 's' : ''}`
          : "No enrolled courses yet";
      return {
        title: "My Courses",
        subtitle: countText
      };
    }
    if (pathname === '/lms/browse') {
      return {
        title: "Browse Courses",
        subtitle: "Explore our catalog and start learning online from home."
      };
    }
    if (pathname === '/lms/materials') {
      return {
        title: "Study Materials",
        subtitle: "Downloadable resources, cheatsheets, and question banks provided by your instructors."
      };
    }
    if (pathname === '/lms/profile') {
      return {
        title: "My Profile",
        subtitle: "Manage your personal details, academic preferences, and credentials."
      };
    }
    if (pathname === '/lms/practice') {
      return {
        title: "Practice Arena",
        subtitle: "Sharpen your skills with mock questions and tests."
      };
    }
    if (pathname === '/lms/certificates') {
      return {
        title: "My Certificates",
        subtitle: "View and share your earned course certificates."
      };
    }
    if (pathname === '/lms/tests') {
      return {
        title: "Assignments & Tests",
        subtitle: "Complete required tasks to earn a certificate of completion."
      };
    }
    if (pathname?.startsWith('/lms/instructor')) {
      return {
        title: "Instructor Panel",
        subtitle: "Manage your courses, assignments, and student reviews."
      };
    }
    
    if (pathname === '/lms/notifications') {
      return {
        title: 'Notifications',
        subtitle: 'Stay updated on your enrollments, announcements, and course activity.',
      };
    }
    
    // Fallback/Default
    return {
      title: "LMS Portal",
      subtitle: "Gradify Academy — India's Premier Online Coaching."
    };
  };

  if (isUnderMaintenance) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100vh', width: '100vw', background: '#f8f9fb', padding: '2rem', textAlign: 'center',
        fontFamily: 'var(--font-body)'
      }}>
        <div style={{ marginBottom: '1.5rem', color: '#1B2B6B' }}>
          <UiIcon name="maintenance" size={64} />
        </div>
        <h1 style={{ fontSize: '2.2rem', color: '#1B2B6B', fontWeight: 800, marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
          System Under Maintenance
        </h1>
        <p style={{ color: '#4A4A6A', fontSize: '1.1rem', maxWidth: '520px', lineHeight: 1.6, marginBottom: '2rem' }}>
          Gradify Academy is currently undergoing scheduled maintenance to improve our systems and services. We will be back online shortly. Thank you for your patience!
        </p>
        <Link href="/" style={{
          background: '#1B2B6B', color: 'white', padding: '0.8rem 2rem', borderRadius: '8px',
          fontWeight: 600, fontSize: '0.95rem', transition: 'background 0.2s', display: 'inline-block'
        }}>
          Go back to Home Page
        </Link>
      </div>
    );
  }

  const header = getHeaderContent();

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
            <h1>{header.title}</h1>
            <p>{header.subtitle}</p>
          </div>
          <div className={styles.topBarActions}>
            <Suspense fallback={<select className={styles.filterSelect}><option>All Courses</option></select>}>
              <CategorySelect />
            </Suspense>
            <div className={styles.searchBox}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  onClick={() => {
                    const q = searchQuery.trim();
                    if (q) router.push(`/lms/browse?q=${encodeURIComponent(q)}`);
                    else router.push('/lms/browse');
                  }}
                  aria-label="Search courses"
                >
                  <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const q = searchQuery.trim();
                      if (q) router.push(`/lms/browse?q=${encodeURIComponent(q)}`);
                      else router.push('/lms/browse');
                    }
                  }}
                  style={{ width: 150 }}
                />
              </div>

            <button className={styles.notifBtn} onClick={toggleTheme} aria-label="Toggle Theme" title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
            
            {/* 🔔 Live Notification Bell */}
            <NotificationBell />

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
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
    </div>
  );
}
