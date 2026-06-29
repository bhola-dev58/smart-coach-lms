'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import LiveClassroom from '@/components/lms/LiveClassroom';

// ============================================
// 🎥 LIVE CLASSES PAGE
// Shows both:
//   1. YouTube/Scheduled sessions (embedded iframe player — no external redirect)
//   2. In-app WebRTC rooms (from LiveRoom model)
// ============================================

// ── Helper: Convert any YouTube URL → embeddable URL ──
function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  try {
    // youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&rel=0`;

    // youtube.com/live/VIDEO_ID
    const liveMatch = url.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
    if (liveMatch) return `https://www.youtube.com/embed/${liveMatch[1]}?autoplay=1&rel=0`;

    // Already an embed URL
    if (url.includes('youtube.com/embed/')) return url;

    return null;
  } catch {
    return null;
  }
}

export default function LiveClassesPage() {
  const { data: session } = useSession();
  const [rooms, setRooms] = useState([]);
  const [zoomSessions, setZoomSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null);       // WebRTC Room code
  const [activeEmbed, setActiveEmbed] = useState(null);     // { title, embedUrl, isLive }
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    maxParticipants: 100,
  });
  const [joinCode, setJoinCode] = useState('');

  const isInstructor = session?.user?.role === 'instructor' || session?.user?.role === 'admin';

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const roomRes = await fetch('/api/live/room');
      const roomData = await roomRes.json();
      if (roomData.success) setRooms(roomData.rooms || []);
    } catch (err) {
      console.error('Failed to fetch live rooms:', err);
    }

    try {
      const sessRes = await fetch('/api/lms/live-sessions');
      const sessData = await sessRes.json();
      if (sessData.success) setZoomSessions(sessData.sessions || []);
    } catch (err) {
      console.error('Failed to fetch live sessions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

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
        setActiveRoom(data.roomCode);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const joinByCode = () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length >= 4) setActiveRoom(code);
  };

  // ── Inline embed player for YouTube live/recorded sessions ──
  if (activeEmbed) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        {/* Back button */}
        <button
          onClick={() => setActiveEmbed(null)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: 'var(--dash-surface)', border: '1px solid var(--dash-border)',
            color: 'var(--dash-text)', padding: '0.5rem 1rem', borderRadius: '8px',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.25rem',
          }}
        >
          ← Back to Live Classes
        </button>

        {/* Session Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          {activeEmbed.isLive && (
            <span style={{
              background: '#e74c3c', color: 'white',
              padding: '3px 12px', borderRadius: '20px',
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%', background: 'white',
                display: 'inline-block', animation: 'pulse 1.5s infinite',
              }} />
              LIVE
            </span>
          )}
          <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--dash-text)', fontWeight: 700 }}>
            {activeEmbed.title}
          </h2>
        </div>

        {/* Embedded YouTube Player */}
        <div style={{
          position: 'relative', width: '100%', paddingTop: '56.25%', /* 16:9 */
          background: '#000', borderRadius: '14px', overflow: 'hidden',
          border: '1px solid var(--dash-border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          <iframe
            src={activeEmbed.embedUrl}
            title={activeEmbed.title}
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%', border: 'none',
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Security notice */}
        <p style={{
          fontSize: '0.75rem', color: 'var(--dash-text-muted)', marginTop: '0.75rem',
          textAlign: 'center',
        }}>
          🔒 This session is only accessible to enrolled students via the LMS portal.
        </p>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </div>
    );
  }

  // ── WebRTC In-App Room ──
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
  const upcomingZoom = [...zoomSessions].sort((a, b) => {
    if (a.status === 'live' && b.status !== 'live') return -1;
    if (b.status === 'live' && a.status !== 'live') return 1;
    return new Date(a.scheduledAt) - new Date(b.scheduledAt);
  });

  return (
    <div style={{ padding: '2rem', maxWidth: 960, margin: '0 auto' }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--dash-text)' }}>
            Live Classes
          </h1>
          <p style={{ color: 'var(--dash-text-muted)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
            Watch live sessions or join real-time in-app classroom sessions
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Join In-App WebRTC Room by Code */}
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
            <span style={{ fontSize: '0.65rem', color: 'var(--dash-text-muted)' }}>
              For in-app WebRTC rooms only
            </span>
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

      {/* ── Create Room Form ── */}
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
                Go Live
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--dash-text-muted)', padding: '3rem 0' }}>Loading live sessions...</p>
      ) : (
        <>
          {/* ── SECTION 1: Scheduled / YouTube Sessions ── */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dash-text)', marginBottom: '1rem' }}>
              Scheduled Live Sessions
              <span style={{
                fontSize: '0.7rem', background: 'rgba(255,171,0,0.15)', color: '#ffab00',
                border: '1px solid rgba(255,171,0,0.3)', padding: '2px 8px', borderRadius: '12px',
                fontWeight: 600, marginLeft: '0.5rem',
              }}>
                Scheduled
              </span>
            </h2>

            {upcomingZoom.length === 0 ? (
              <div style={{
                background: 'var(--dash-surface)', border: '1px dashed var(--dash-border)',
                borderRadius: '12px', padding: '2rem', textAlign: 'center',
              }}>
                <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  No upcoming live sessions.{' '}
                  {isInstructor
                    ? 'Go to "Live Sessions" in the instructor panel to schedule one.'
                    : 'Check back later or make sure you are enrolled in the course.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {upcomingZoom.map((s) => {
                  const isLive = s.status === 'live' || new Date(s.scheduledAt) <= now;
                  const embedUrl = getYouTubeEmbedUrl(s.joinUrl);
                  const hasEmbed = !!embedUrl;

                  return (
                    <div
                      key={s._id}
                      style={{
                        background: 'var(--dash-surface)',
                        border: `1px solid ${isLive ? 'rgba(231,76,60,0.4)' : 'var(--dash-border)'}`,
                        borderRadius: '12px', padding: '1.25rem',
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
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
                            {isLive ? '🔴 LIVE' : '⏰ Upcoming'}
                          </span>
                          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--dash-text)', fontWeight: 700 }}>
                            {s.title}
                          </h3>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--dash-text-muted)', flexWrap: 'wrap' }}>
                          <span>🕐 {new Date(s.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          {s.duration && <span>⏱ {s.duration} mins</span>}
                          {s.description && <span>{s.description}</span>}
                        </div>
                      </div>

                      {/* ── Action Button ── */}
                      {hasEmbed ? (
                        // YouTube link → open embedded player inside LMS (no redirect)
                        <button
                          onClick={() => setActiveEmbed({ title: s.title, embedUrl, isLive })}
                          style={{
                            padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none',
                            background: isLive ? '#e74c3c' : 'var(--color-primary)',
                            color: 'white', fontWeight: 600, fontSize: '0.9rem',
                            cursor: 'pointer', whiteSpace: 'nowrap',
                            transition: 'opacity 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                          {isLive ? '▶ Watch Live' : '▶ Watch'}
                        </button>
                      ) : s.joinUrl ? (
                        // Non-YouTube link (e.g. Zoom, Meet) — show disabled for security
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <button
                            disabled
                            title="External links are disabled for security. Contact your instructor."
                            style={{
                              padding: '0.6rem 1.5rem', borderRadius: '8px', border: '1px solid var(--dash-border)',
                              background: 'var(--dash-border)', color: 'var(--dash-text-muted)',
                              fontWeight: 600, fontSize: '0.9rem', cursor: 'not-allowed', whiteSpace: 'nowrap',
                            }}
                          >
                            🔒 Restricted
                          </button>
                          <span style={{ fontSize: '0.65rem', color: 'var(--dash-text-muted)' }}>
                            External links are disabled
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--dash-text-muted)', fontStyle: 'italic' }}>
                          No link yet
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── SECTION 2: In-App WebRTC Rooms ── */}
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dash-text)', marginBottom: '1rem' }}>
              In-App Live Rooms
              <span style={{
                fontSize: '0.7rem', background: 'rgba(46,213,115,0.12)', color: '#2ed573',
                border: '1px solid rgba(46,213,115,0.3)', padding: '2px 8px', borderRadius: '12px',
                fontWeight: 600, marginLeft: '0.5rem',
              }}>
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
                          {room.status === 'live' ? 'LIVE' : 'Scheduled'}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--dash-text)' }}>{room.title}</h3>
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--dash-text-muted)', flexWrap: 'wrap' }}>
                        <span>Host: {room.host?.name || 'Instructor'}</span>
                        <span>Participants: {room.participants?.filter(p => !p.leftAt).length || 0} / {room.maxParticipants}</span>
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
                      {room.status === 'live' ? 'Join Live' : 'Join'}
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
