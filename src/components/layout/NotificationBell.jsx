'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

// ── Notification type icon mapping ──
function NotifIcon({ type }) {
  const icons = {
    enrollment:   { emoji: '🎓', bg: '#ede9fe', color: '#7c3aed' },
    payment:      { emoji: '💳', bg: '#fef3c7', color: '#d97706' },
    course_update:{ emoji: '📚', bg: '#dbeafe', color: '#2563eb' },
    new_course:   { emoji: '🚀', bg: '#d1fae5', color: '#059669' },
    certificate:  { emoji: '🏆', bg: '#fef3c7', color: '#d97706' },
    announcement: { emoji: '📢', bg: '#fee2e2', color: '#dc2626' },
    reminder:     { emoji: '⏰', bg: '#fef3c7', color: '#d97706' },
    system:       { emoji: '⚙️', bg: '#f3f4f6', color: '#6b7280' },
    login:        { emoji: '🔐', bg: '#dbeafe', color: '#2563eb' },
    otp_verified: { emoji: '✅', bg: '#d1fae5', color: '#059669' },
  };
  const { emoji, bg, color } = icons[type] || icons.system;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 36, height: 36, borderRadius: '50%',
      backgroundColor: bg, color, fontSize: 16, flexShrink: 0,
    }}>
      {emoji}
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

  // ── Refresh on window focus ──
  useEffect(() => {
    const onFocus = () => { 
      if (status === 'authenticated' && document.visibilityState === 'visible') { 
        fetchRef.current(true); 
      } 
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
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
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>
                🔔 Notifications
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
                <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                <p style={{ margin: 0, fontSize: 14 }}>Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔕</div>
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
