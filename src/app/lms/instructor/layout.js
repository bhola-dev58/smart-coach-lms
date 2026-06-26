'use client';

import { useState } from 'react';
import InstructorSidebar from '@/components/lms/instructor/InstructorSidebar';
import UiIcon from '@/components/common/UiIcon';

export default function InstructorLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 64px)', // Adjust based on Topbar height
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Overlay backdrop for mobile */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 9990,
          }}
        />
      )}

      {/* Left Sidebar (Desktop permanent, Mobile sliding drawer) */}
      <div 
        className="instructor-sidebar-container"
        style={{
          flexShrink: 0,
          zIndex: 9995,
        }}
      >
        <InstructorSidebar onClose={() => setMobileSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        position: 'relative'
      }}>
        {/* Floating Mobile Toggle Button */}
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="instructor-mobile-toggle"
          aria-label="Toggle sidebar"
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 9980,
            background: 'var(--dash-accent, #1B2B6B)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'none', // Hidden on desktop, shown on mobile
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
            transition: 'transform 0.2s ease'
          }}
        >
          <UiIcon name="layers" size={20} color="white" />
        </button>

        {children}
      </div>

      {/* Responsive Inline CSS overrides */}
      <style>{`
        @media (max-width: 768px) {
          .instructor-sidebar-container {
            position: fixed !important;
            top: 0;
            left: 0;
            bottom: 0;
            height: 100vh !important;
            transform: translateX(${mobileSidebarOpen ? '0' : '-100%'});
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .instructor-mobile-toggle {
            display: flex !important;
          }
          .instructor-mobile-toggle:active {
            transform: scale(0.92);
          }
        }
      `}</style>
    </div>
  );
}
