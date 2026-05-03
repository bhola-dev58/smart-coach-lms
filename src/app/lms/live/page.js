'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LiveClassroom from '@/components/lms/LiveClassroom';

// ============================================
// 🎥 LIVE CLASSES PAGE
// Students see available live sessions
// Instructors can create and manage rooms
// ============================================

export default function LiveClassesPage() {
  const { data: session } = useSession();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null); // Room code to join
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    maxParticipants: 100,
  });
  const [joinCode, setJoinCode] = useState('');

  const isInstructor = session?.user?.role === 'instructor' || session?.user?.role === 'admin';

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/live/room');
      const data = await res.json();
      if (data.success) setRooms(data.rooms);
    } catch (err) {
      console.error(err);
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
    if (joinCode.trim().length >= 4) {
      setActiveRoom(joinCode.trim().toUpperCase());
    }
  };

  // If actively in a room, show the LiveClassroom
  if (activeRoom) {
    return (
      <LiveClassroom
        roomCode={activeRoom}
        onLeave={() => {
          setActiveRoom(null);
          fetchRooms();
        }}
      />
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--dash-text)' }}>🎥 Live Classes</h1>
          <p style={{ color: 'var(--dash-text-muted)', margin: '0.25rem 0 0' }}>Join or create real-time classroom sessions</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {/* Join by Code */}
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <input
              type="text"
              placeholder="Room code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              style={{
                width: 100, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--dash-border)',
                background: 'var(--dash-bg)', color: 'var(--dash-text)', fontSize: '0.9rem', textAlign: 'center',
                fontFamily: 'monospace', letterSpacing: '2px',
              }}
              onKeyDown={(e) => e.key === 'Enter' && joinByCode()}
            />
            <button
              onClick={joinByCode}
              disabled={joinCode.length < 4}
              style={{
                padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                background: joinCode.length >= 4 ? '#27ae60' : 'var(--dash-border)',
                color: 'white', fontWeight: 600, cursor: joinCode.length >= 4 ? 'pointer' : 'not-allowed',
              }}
            >
              Join
            </button>
          </div>
          {isInstructor && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={{
                padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none',
                background: 'var(--color-primary)', color: 'white', fontWeight: 600, cursor: 'pointer',
              }}
            >
              + Create Room
            </button>
          )}
        </div>
      </div>

      {/* Create Room Form */}
      {showCreateForm && (
        <div style={{
          background: 'var(--dash-surface)', border: '1px solid var(--dash-border)',
          borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem',
        }}>
          <h3 style={{ margin: '0 0 1rem', color: 'var(--dash-text)' }}>Create Live Room</h3>
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
                min={2}
                max={500}
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

      {/* Room List */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--dash-text-muted)', padding: '3rem 0' }}>Loading rooms...</p>
      ) : rooms.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'var(--dash-surface)', border: '1px solid var(--dash-border)', borderRadius: '12px',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📡</div>
          <h3 style={{ color: 'var(--dash-text)', margin: '0 0 0.5rem' }}>No Live Sessions</h3>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.9rem' }}>
            {isInstructor ? 'Create a room to start a live class!' : 'No live classes available right now. Check back later!'}
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
                justifyContent: 'space-between', alignItems: 'center',
                transition: 'border-color 0.2s ease',
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
                  <span style={{ fontFamily: 'monospace' }}>Code: {room.roomCode}</span>
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
  );
}
