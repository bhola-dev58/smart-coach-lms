'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';

// ============================================
// 🎥 LIVE CLASSROOM COMPONENT (WebRTC)
// Browser-based live video class with
// screen sharing, chat, and participant list
// ============================================

export default function LiveClassroom({ roomCode, onLeave }) {
  const { data: session } = useSession();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const [participants, setParticipants] = useState([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(true);

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const chatEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Join the room
  useEffect(() => {
    joinRoom();
    // Poll for updates every 3 seconds
    pollIntervalRef.current = setInterval(fetchRoomState, 3000);

    return () => {
      leaveRoom();
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      stopAllStreams();
    };
  }, []);

  const joinRoom = async () => {
    try {
      const res = await fetch('/api/live/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', roomCode }),
      });
      const data = await res.json();
      if (data.success) {
        setRoom(data.room);
        setMessages(data.room.messages || []);
        setParticipants(data.room.participants?.filter(p => !p.leftAt) || []);
        setLoading(false);
      } else {
        setError(data.error);
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to join room');
      setLoading(false);
    }
  };

  const fetchRoomState = async () => {
    try {
      const res = await fetch(`/api/live/room?roomCode=${roomCode}`);
      const data = await res.json();
      if (data.success) {
        setRoom(data.room);
        setMessages(data.room.messages || []);
        setParticipants(data.room.participants?.filter(p => !p.leftAt) || []);
      }
    } catch (err) { /* silent */ }
  };

  const leaveRoom = async () => {
    try {
      await fetch('/api/live/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'leave', roomCode }),
      });
    } catch (err) { /* silent */ }
  };

  const sendMessage = async () => {
    if (!chatText.trim()) return;
    try {
      await fetch('/api/live/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'chat', roomCode, message: chatText }),
      });
      setChatText('');
      fetchRoomState();
    } catch (err) { /* silent */ }
  };

  const stopAllStreams = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = async () => {
    if (isVideoOff) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsVideoOff(false);
      } catch (err) {
        console.error('Camera access denied:', err);
      }
    } else {
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(t => t.stop());
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      setIsVideoOff(true);
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false,
        });
        screenStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsScreenSharing(true);

        stream.getVideoTracks()[0].addEventListener('ended', () => {
          setIsScreenSharing(false);
          if (localStreamRef.current && localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
        });
      } catch (err) {
        console.error('Screen share denied:', err);
      }
    }
  };

  const endRoom = async () => {
    try {
      await fetch('/api/live/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end', roomCode }),
      });
      stopAllStreams();
      onLeave?.();
    } catch (err) {
      console.error('Failed to end room:', err);
    }
  };

  const handleLeave = () => {
    stopAllStreams();
    leaveRoom();
    onLeave?.();
  };

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isHost = room?.host?.toString() === session?.user?.id || room?.host?._id?.toString() === session?.user?.id;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'var(--dash-text)' }}>
        <p>⏳ Joining live class...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ color: '#e74c3c' }}>❌ {error}</p>
        <button onClick={onLeave} style={{ padding: '0.5rem 1.5rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: showChat ? '1fr 320px' : '1fr', height: 'calc(100vh - 80px)', background: 'var(--dash-bg)' }}>
      {/* Main Video Area */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Video Display */}
        <div style={{ flex: 1, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px' }}
          />
          {isVideoOff && !isScreenSharing && (
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'rgba(255,255,255,0.5)' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                {session?.user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <p>{room?.title || 'Live Class'}</p>
              <p style={{ fontSize: '0.8rem' }}>Room: {roomCode}</p>
            </div>
          )}

          {/* Room Status Badge */}
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{
              background: room?.status === 'live' ? '#e74c3c' : '#f39c12',
              color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
              animation: room?.status === 'live' ? 'pulse 2s infinite' : 'none',
            }}>
              {room?.status === 'live' ? '🔴 LIVE' : '⏳ Scheduled'}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
              👥 {participants.length} participants
            </span>
          </div>
        </div>

        {/* Controls Bar */}
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem',
          padding: '1rem', background: 'var(--dash-surface)', borderTop: '1px solid var(--dash-border)',
        }}>
          <button
            onClick={toggleMute}
            style={{
              width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: isMuted ? '#e74c3c' : 'rgba(255,255,255,0.1)',
              color: 'white', fontSize: '1.2rem',
            }}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🎤'}
          </button>

          <button
            onClick={toggleVideo}
            style={{
              width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: isVideoOff ? '#e74c3c' : 'rgba(255,255,255,0.1)',
              color: 'white', fontSize: '1.2rem',
            }}
            title={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
          >
            {isVideoOff ? '📷' : '🎥'}
          </button>

          {(isHost || room?.allowScreenShare) && (
            <button
              onClick={toggleScreenShare}
              style={{
                width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: isScreenSharing ? '#27ae60' : 'rgba(255,255,255,0.1)',
                color: 'white', fontSize: '1.2rem',
              }}
              title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
            >
              {isScreenSharing ? '🖥️' : '📺'}
            </button>
          )}

          <button
            onClick={() => setShowChat(!showChat)}
            style={{
              width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: showChat ? 'rgba(52, 152, 219, 0.3)' : 'rgba(255,255,255,0.1)',
              color: 'white', fontSize: '1.2rem',
            }}
            title="Toggle Chat"
          >
            💬
          </button>

          <button
            onClick={isHost ? endRoom : handleLeave}
            style={{
              width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: '#e74c3c', color: 'white', fontSize: '1.2rem',
            }}
            title={isHost ? 'End Class' : 'Leave'}
          >
            📴
          </button>
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div style={{
          display: 'flex', flexDirection: 'column',
          borderLeft: '1px solid var(--dash-border)', background: 'var(--dash-surface)',
        }}>
          {/* Participants */}
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--dash-border)' }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--dash-text)' }}>
              👥 Participants ({participants.length})
            </h4>
            <div style={{ marginTop: '0.5rem', maxHeight: '80px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {participants.map((p, i) => (
                <span key={i} style={{
                  fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px',
                  background: p.role === 'host' ? 'rgba(200,16,46,0.2)' : 'rgba(255,255,255,0.05)',
                  color: p.role === 'host' ? '#C8102E' : 'var(--dash-text-muted)',
                }}>
                  {p.name || 'User'} {p.role === 'host' ? '👑' : ''}
                </span>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {messages.length === 0 ? (
              <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
                No messages yet. Start the conversation! 💬
              </p>
            ) : (
              messages.slice(-100).map((msg, i) => (
                <div key={i} style={{ fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{msg.userName}: </span>
                  <span style={{ color: 'var(--dash-text)' }}>{msg.message}</span>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div style={{ padding: '0.75rem', borderTop: '1px solid var(--dash-border)', display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder="Type a message..."
              style={{
                flex: 1, padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem',
                border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)',
              }}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={!chatText.trim()}
              style={{
                padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', fontSize: '0.85rem',
                background: chatText.trim() ? 'var(--color-primary)' : 'var(--dash-border)',
                color: 'white', fontWeight: 600, cursor: chatText.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
