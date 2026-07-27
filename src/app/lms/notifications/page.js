'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from '@/app/lms/lms.module.css';

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
      width: 44, height: 44, borderRadius: '50%',
      backgroundColor: bg, color, flexShrink: 0,
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={icon} />
      </svg>
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
        <p style={{ color: 'var(--dash-text-muted)', fontSize: 15 }}>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--dash-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            All Notifications
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
            Mark All Read
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
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--dash-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
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
