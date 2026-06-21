'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LiveClassroom from '@/components/lms/LiveClassroom';

// ============================================
// 🎥 LIVE CLASSES PAGE
// Shows both:
//   1. Zoom/External sessions (from LiveSession model)
//   2. In-app WebRTC rooms (from LiveRoom model)
// ============================================

export default function LiveClassesPage() {
  const { data: session } = useSession();
  const [rooms, setRooms] = useState([]);
  const [zoomSessions, setZoomSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null); // WebRTC Room code to join
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    maxParticipants: 100,
  });
  const [joinCode, setJoinCode] = useState('');

  const isInstructor = session?.user?.role === 'instructor' || session?.user?.role === 'admin';

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      // Fetch in-app WebRTC rooms
      const roomRes = await fetch('/api/live/room');
      const roomData = await roomRes.json();
      if (roomData.success) setRooms(roomData.rooms || []);
    } catch (err) {
      console.error('Failed to fetch live rooms:', err);
    }

    try {
      // Fetch Zoom/external live sessions scheduled by instructors
      const sessRes = await fetch('/api/lms/live-sessions');
      const sessData = await sessRes.json();
      if (sessData.success) setZoomSessions(sessData.sessions || []);
    } catch (err) {
      // Silently skip if no API yet
      console.error('Failed to fetch zoom sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    if (!createForm.title.trim()) return;
    try {
      const res = await fetch('/api/live/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', ...createForm }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateForm(false);
        setCreateForm({ title: '', description: '', maxParticipants: 100 });
        // Auto-join the created room
        setActiveRoom(data.roomCode);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const joinByCode = () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length >= 4) {
      setActiveRoom(code);
    }
  };

  // If actively in a WebRTC room, show the LiveClassroom
  if (activeRoom) {
    return (
      <LiveClassroom
        roomCode={activeRoom}
        onLeave={() => {
          setActiveRoom(null);
          fetchAll();
        }}
      />
    );
  }

  const now = new Date();
  // Show all sessions returned by API — includes sessions from past 24h (still joinable)
  // Sort: live first, then by scheduledAt
  const upcomingZoom = [...zoomSessions].sort((a, b) => {
    if (a.status === 'live' && b.status !== 'live') return -1;
    if (b.status === 'live' && a.status !== 'live') return 1;
    return new Date(a.scheduledAt) - new Date(b.scheduledAt);
  });

  return (
    <div style={{ padding: '2rem', maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--dash-text)' }}>🎥 Live Classes</h1>
          <p style={{ color: 'var(--dash-text-muted)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
            Join Zoom sessions or real-time in-app classroom sessions
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Join In-App WebRTC Room by Code — NOT for Zoom codes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <input
                type="text"
                placeholder="In-app room code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                maxLength={8}
                style={{
                  width: 130, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--dash-border)',
                  background: 'var(--dash-bg)', color: 'var(--dash-text)', fontSize: '0.9rem', textAlign: 'center',
                  fontFamily: 'monospace', letterSpacing: '2px',
                }}
                onKeyDown={(e) => e.key === 'Enter' && joinByCode()}
              />
              <button
                onClick={joinByCode}
                disabled={joinCode.trim().length < 4}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                  background: joinCode.trim().length >= 4 ? '#27ae60' : 'var(--dash-border)',
                  color: 'white', fontWeight: 600, cursor: joinCode.trim().length >= 4 ? 'pointer' : 'not-allowed',
                  fontSize: '0.85rem',
                }}
              >
                Join Room
              </button>
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--dash-text-muted)' }}>⚠️ For in-app rooms only — not Zoom codes</span>
          </div>
          {isInstructor && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={{
                padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none',
                background: 'var(--color-primary)', color: 'white', fontWeight: 600, cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              + Create Room
            </button>
          )}
        </div>
      </div>

      {/* Info Banner for "Join by Code" */}
      <div style={{
        background: 'rgba(52,152,219,0.08)', border: '1px solid rgba(52,152,219,0.25)',
        borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.5rem',
        fontSize: '0.85rem', color: 'var(--dash-text-secondary)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start'
      }}>
        <span>ℹ️</span>
        <span>
          <strong>Join by Code</strong> is for in-app WebRTC rooms only. For Zoom/Google Meet sessions,
          click <strong>"Join Zoom"</strong> on the session cards below — they open directly in your browser or Zoom app.
        </span>
      </div>

      {/* Create Room Form */}
      {showCreateForm && (
        <div style={{
          background: 'var(--dash-surface)', border: '1px solid var(--dash-border)',
          borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem',
        }}>
          <h3 style={{ margin: '0 0 1rem', color: 'var(--dash-text)' }}>Create Live Room (In-App WebRTC)</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Class title (e.g., DSA Doubt Session)"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              style={{
                padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--dash-border)',
                background: 'var(--dash-bg)', color: 'var(--dash-text)',
              }}
            />
            <textarea
              placeholder="Description (optional)"
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              rows={2}
              style={{
                padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--dash-border)',
                background: 'var(--dash-bg)', color: 'var(--dash-text)', resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label style={{ color: 'var(--dash-text-muted)', fontSize: '0.9rem' }}>Max Participants:</label>
              <input
                type="number"
                value={createForm.maxParticipants}
                onChange={(e) => setCreateForm({ ...createForm, maxParticipants: parseInt(e.target.value) || 100 })}
                min={2} max={500}
                style={{
                  width: 80, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--dash-border)',
                  background: 'var(--dash-bg)', color: 'var(--dash-text)', textAlign: 'center',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCreateForm(false)}
                style={{
                  padding: '0.5rem 1.25rem', borderRadius: '8px', border: '1px solid var(--dash-border)',
                  background: 'transparent', color: 'var(--dash-text)', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={createRoom}
                disabled={!createForm.title.trim()}
                style={{
                  padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none',
                  background: createForm.title.trim() ? 'var(--color-primary)' : 'var(--dash-border)',
                  color: 'white', fontWeight: 600, cursor: createForm.title.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                🚀 Go Live
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--dash-text-muted)', padding: '3rem 0' }}>Loading live sessions...</p>
      ) : (
        <>
          {/* ── SECTION 1: Zoom / External Sessions ── */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dash-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📡 Zoom &amp; External Sessions
              <span style={{ fontSize: '0.7rem', background: 'rgba(255,171,0,0.15)', color: '#ffab00', border: '1px solid rgba(255,171,0,0.3)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                Scheduled
              </span>
            </h2>

            {upcomingZoom.length === 0 ? (
              <div style={{
                background: 'var(--dash-surface)', border: '1px dashed var(--dash-border)',
                borderRadius: '12px', padding: '2rem', textAlign: 'center',
              }}>
                <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  No upcoming Zoom sessions. {isInstructor ? 'Go to "Live Sessions" in the instructor panel to schedule one.' : 'Check back later.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {upcomingZoom.map((s) => {
                  const isLive = s.status === 'live' || new Date(s.scheduledAt) <= now;
                  return (
                    <div
                      key={s._id}
                      style={{
                        background: 'var(--dash-surface)', border: `1px solid ${isLive ? 'rgba(231,76,60,0.4)' : 'var(--dash-border)'}`,
                        borderRadius: '12px', padding: '1.25rem',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                          <span style={{
                            background: isLive ? '#e74c3c' : 'rgba(255,171,0,0.15)',
                            color: isLive ? 'white' : '#ffab00',
                            border: isLive ? 'none' : '1px solid rgba(255,171,0,0.3)',
                            padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700,
                          }}>
                            {isLive ? '🔴 LIVE' : '⏳ Upcoming'}
                          </span>
                          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--dash-text)', fontWeight: 700 }}>{s.title}</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--dash-text-muted)', flexWrap: 'wrap' }}>
                          <span>🕐 {new Date(s.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          {s.duration && <span>⏱ {s.duration} mins</span>}
                          {s.description && <span>{s.description}</span>}
                        </div>
                      </div>
                      {s.joinUrl ? (
                        <a
                          href={s.joinUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: '0.6rem 1.5rem', borderRadius: '8px', textDecoration: 'none',
                            background: isLive ? '#e74c3c' : 'var(--color-primary)',
                            color: 'white', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap',
                            transition: 'opacity 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                          {isLive ? '🔴 Join Zoom Now' : '📅 Join Zoom'}
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--dash-text-muted)', fontStyle: 'italic' }}>No link yet</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── SECTION 2: In-App WebRTC Rooms ── */}
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dash-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🖥️ In-App Live Rooms
              <span style={{ fontSize: '0.7rem', background: 'rgba(46,213,115,0.12)', color: '#2ed573', border: '1px solid rgba(46,213,115,0.3)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                WebRTC
              </span>
            </h2>

            {rooms.length === 0 ? (
              <div style={{
                background: 'var(--dash-surface)', border: '1px dashed var(--dash-border)',
                borderRadius: '12px', padding: '2rem', textAlign: 'center',
              }}>
                <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  {isInstructor ? 'Click "+ Create Room" to start an in-app live session.' : 'No in-app live rooms active right now.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {rooms.map((room) => (
                  <div
                    key={room._id}
                    style={{
                      background: 'var(--dash-surface)', border: '1px solid var(--dash-border)',
                      borderRadius: '12px', padding: '1.25rem', display: 'flex',
                      justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{
                          background: room.status === 'live' ? '#e74c3c' : '#f39c12',
                          color: 'white', padding: '3px 10px', borderRadius: '12px',
                          fontSize: '0.7rem', fontWeight: 700,
                        }}>
                          {room.status === 'live' ? '🔴 LIVE' : '⏳ Scheduled'}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--dash-text)' }}>{room.title}</h3>
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--dash-text-muted)' }}>
                        <span>👤 Host: {room.host?.name || 'Instructor'}</span>
                        <span>👥 {room.participants?.filter(p => !p.leftAt).length || 0} / {room.maxParticipants}</span>
                        <span style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>Code: <strong>{room.roomCode}</strong></span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveRoom(room.roomCode)}
                      style={{
                        padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none',
                        background: room.status === 'live' ? '#e74c3c' : 'var(--color-primary)',
                        color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                      }}
                    >
                      {room.status === 'live' ? 'Join Live 🔴' : 'Join'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
