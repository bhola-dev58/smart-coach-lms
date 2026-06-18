'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from '@/app/lms/lms.module.css';

function NotifIcon({ type }) {
  const icons = {
    enrollment:    { emoji: '🎓', bg: '#ede9fe', color: '#7c3aed' },
    payment:       { emoji: '💳', bg: '#fef3c7', color: '#d97706' },
    course_update: { emoji: '📚', bg: '#dbeafe', color: '#2563eb' },
    new_course:    { emoji: '🚀', bg: '#d1fae5', color: '#059669' },
    certificate:   { emoji: '🏆', bg: '#fef3c7', color: '#d97706' },
    announcement:  { emoji: '📢', bg: '#fee2e2', color: '#dc2626' },
    reminder:      { emoji: '⏰', bg: '#fef3c7', color: '#d97706' },
    system:        { emoji: '⚙️', bg: '#f3f4f6', color: '#6b7280' },
    login:         { emoji: '🔐', bg: '#dbeafe', color: '#2563eb' },
    otp_verified:  { emoji: '✅', bg: '#d1fae5', color: '#059669' },
  };
  const { emoji, bg, color } = icons[type] || icons.system;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 44, height: 44, borderRadius: '50%',
      backgroundColor: bg, color, fontSize: 20, flexShrink: 0,
    }}>
      {emoji}
    </span>
  );
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?page=${p}&limit=20`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setNotifications(p === 1 ? data.notifications : prev => [...prev, ...data.notifications]);
        setUnreadCount(data.unreadCount || 0);
        setTotalPages(data.totalPages || 1);
        setPage(p);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/');
    if (status === 'authenticated') fetchNotifications(1);
  }, [status]);

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH', credentials: 'include' });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const markRead = async (id) => {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH', credentials: 'include' });
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  if (status === 'loading' || loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔔</div>
        <p style={{ color: 'var(--dash-text-muted)', fontSize: 15 }}>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--dash-text)' }}>
            🔔 All Notifications
          </h2>
          {unreadCount > 0 && (
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--dash-accent)' }}>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '10px 20px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
            }}
          >
            ✅ Mark All Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--dash-card)', borderRadius: 20,
          border: '1px solid var(--dash-border)',
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔕</div>
          <h3 style={{ margin: '0 0 8px', color: 'var(--dash-text)', fontSize: 18 }}>All caught up!</h3>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: 14, margin: 0 }}>
            No notifications yet. Start exploring courses to see activity here.
          </p>
        </div>
      ) : (
        <div style={{
          background: 'var(--dash-card)', borderRadius: 20,
          border: '1px solid var(--dash-border)', overflow: 'hidden',
        }}>
          {notifications.map((n, i) => (
            <div
              key={n._id}
              onClick={() => { if (!n.isRead) markRead(n._id); if (n.link) router.push(n.link); }}
              style={{
                display: 'flex', gap: 16, padding: '18px 24px',
                borderBottom: i < notifications.length - 1 ? '1px solid var(--dash-border)' : 'none',
                background: n.isRead ? 'transparent' : 'linear-gradient(135deg, rgba(79,70,229,0.04), rgba(124,58,237,0.03))',
                cursor: n.link ? 'pointer' : 'default',
                transition: 'background 0.2s',
                position: 'relative',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,70,229,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = n.isRead ? 'transparent' : 'linear-gradient(135deg, rgba(79,70,229,0.04), rgba(124,58,237,0.03))'; }}
            >
              {/* Unread dot */}
              {!n.isRead && (
                <div style={{
                  position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                }} />
              )}
              <NotifIcon type={n.type} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <p style={{
                    margin: 0, fontSize: 15, fontWeight: n.isRead ? 500 : 700,
                    color: 'var(--dash-text)', lineHeight: 1.4,
                  }}>
                    {n.title}
                  </p>
                  <span style={{ fontSize: 12, color: 'var(--dash-text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
                <p style={{
                  margin: '6px 0 0', fontSize: 13, color: 'var(--dash-text-muted)',
                  lineHeight: 1.6,
                }}>
                  {n.message}
                </p>
                {n.link && (
                  <span style={{
                    display: 'inline-block', marginTop: 8, fontSize: 12,
                    color: '#4f46e5', fontWeight: 600,
                  }}>
                    View →
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {page < totalPages && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            onClick={() => fetchNotifications(page + 1)}
            style={{
              background: 'var(--dash-card)', border: '1px solid var(--dash-border)',
              borderRadius: 10, padding: '12px 32px', fontSize: 14,
              color: 'var(--dash-text)', cursor: 'pointer', fontWeight: 600,
            }}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
