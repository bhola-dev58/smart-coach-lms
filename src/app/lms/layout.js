'use client';

import { useState } from 'react';
import DashboardSidebar from '@/components/lms/DashboardSidebar';
import styles from './lms.module.css';

export default function LMSLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.lmsWrapper}>
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={styles.mainContent}>
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
