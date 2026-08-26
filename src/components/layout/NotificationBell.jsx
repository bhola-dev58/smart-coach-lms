'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

// ── Notification type icon mapping ──
function NotifIcon({ type }) {
  const configs = {
    enrollment:           { bg: '#ede9fe', color: '#7c3aed', icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
    payment:              { bg: '#fef3c7', color: '#d97706', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    course_update:        { bg: '#dbeafe', color: '#2563eb', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    new_course:           { bg: '#d1fae5', color: '#059669', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    certificate:          { bg: '#fef3c7', color: '#d97706', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
    announcement:         { bg: '#fee2e2', color: '#dc2626', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
    reminder:             { bg: '#fef3c7', color: '#d97706', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    system:               { bg: '#f3f4f6', color: '#6b7280', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    login:                { bg: '#dbeafe', color: '#2563eb', icon: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1' },
    otp_verified:         { bg: '#d1fae5', color: '#059669', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    assignment_submitted: { bg: '#fef3c7', color: '#d97706', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    assignment_graded:    { bg: '#d1fae5', color: '#059669', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  };
  const { bg, color, icon } = configs[type] || configs.system;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 36, height: 36, borderRadius: '50%',
      backgroundColor: bg, color, flexShrink: 0,
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={icon} />
      </svg>
    </span>
  );
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell({ className = '' }) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const pollRef = useRef(null);

  // ── Fetch notifications ──
  const fetchNotifications = useCallback(async (silent = false) => {
    if (!session?.user?.id) return;
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/notifications?limit=8', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // silently fail
    } finally {
      if (!silent) setLoading(false);
    }
  }, [session?.user?.id]);

  // ── Store callback in a stable Ref ──
  const fetchRef = useRef(fetchNotifications);
  useEffect(() => {
    fetchRef.current = fetchNotifications;
  }, [fetchNotifications]);

  // ── Initial fetch + polling every 60s (only when visible) ──
  useEffect(() => {
    if (status !== 'authenticated') return;
    
    // Initial fetch
    fetchRef.current();
    
    const handleInterval = () => {
      if (document.visibilityState === 'visible') {
        fetchRef.current(true);
      }
    };

    pollRef.current = setInterval(handleInterval, 60_000);
    return () => clearInterval(pollRef.current);
  }, [status]);

  // ── Refresh on window focus OR tab becoming visible ──
  useEffect(() => {
    const onFocus = () => { 
      if (status === 'authenticated' && document.visibilityState === 'visible') { 
        fetchRef.current(true); 
      } 
    };
    const onVisibilityChange = () => {
      if (status === 'authenticated' && document.visibilityState === 'visible') {
        fetchRef.current(true);
      }
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [status]);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Open dropdown + fetch fresh data ──
  const toggleOpen = () => {
    if (!open) fetchNotifications();
    setOpen(o => !o);
  };

  // ── Mark single as read ──
  const markRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH', credentials: 'include' });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  // ── Mark all as read ──
  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH', credentials: 'include' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  if (status !== 'authenticated') return null;

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-flex' }} className={className}>
      {/* Bell Button */}
      <button
        onClick={toggleOpen}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        style={{
          position: 'relative', background: 'none', border: 'none',
          cursor: 'pointer', padding: '6px', borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-text-muted, #6b7280)',
          transition: 'color 0.2s, background 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface-hover, rgba(79,70,229,0.08))'; e.currentTarget.style.color = 'var(--color-primary, #4f46e5)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--color-text-muted, #6b7280)'; }}
      >
        {/* Bell SVG */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          {unreadCount > 0 && (
            <circle cx="18" cy="6" r="4" fill="#ef4444" stroke="white" strokeWidth="1.5" />
          )}
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#fff', fontSize: 10, fontWeight: 700,
            borderRadius: '10px', minWidth: 18, height: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px', lineHeight: 1, border: '2px solid white',
            boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
            animation: 'bellPulse 2s infinite',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 360, maxHeight: 480,
          background: 'white', borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)',
          zIndex: 9999, overflow: 'hidden',
          animation: 'notifSlideIn 0.2s ease',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid #f3f4f6',
            background: 'linear-gradient(135deg, #f8f7ff, #f0f0ff)',
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#7c3aed' }}>
                  {unreadCount} unread
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: 'none', border: '1px solid #e5e7eb', borderRadius: 8,
                  padding: '4px 10px', fontSize: 12, color: '#4f46e5',
                  cursor: 'pointer', fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', maxHeight: 360 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px 20px', color: '#9ca3af' }}>
                <p style={{ margin: 0, fontSize: 14 }}>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px' }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#6b7280' }}>All caught up!</p>
                <p style={{ margin: '4px 0 0', fontSize: 12 }}>No notifications yet.</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  onClick={() => {
                    if (!n.isRead) markRead(n._id);
                    if (n.link) { setOpen(false); window.location.href = n.link; }
                  }}
                  style={{
                    display: 'flex', gap: 12, padding: '14px 20px',
                    borderBottom: '1px solid #f9fafb',
                    background: n.isRead ? 'white' : 'linear-gradient(135deg, #faf8ff, #f5f3ff)',
                    cursor: n.link ? 'pointer' : 'default',
                    transition: 'background 0.2s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f8f7ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = n.isRead ? 'white' : 'linear-gradient(135deg, #faf8ff, #f5f3ff)'; }}
                >
                  {/* Unread indicator */}
                  {!n.isRead && (
                    <div style={{
                      position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    }} />
                  )}
                  <NotifIcon type={n.type} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0, fontSize: 13, fontWeight: n.isRead ? 500 : 700,
                      color: '#1a1a2e', lineHeight: 1.4,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {n.title}
                    </p>
                    <p style={{
                      margin: '3px 0 0', fontSize: 12, color: '#6b7280',
                      lineHeight: 1.5, display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, display: 'block' }}>
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 20px', borderTop: '1px solid #f3f4f6',
            textAlign: 'center',
            background: '#fafafa',
          }}>
            <Link
              href="/lms/notifications"
              onClick={() => setOpen(false)}
              style={{ fontSize: 13, color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bellPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes notifSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
