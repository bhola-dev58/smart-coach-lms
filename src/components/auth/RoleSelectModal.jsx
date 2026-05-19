'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RoleSelectModal() {
  const { data: session, update } = useSession();
  const [selecting, setSelecting] = useState(null);
  const router = useRouter();

  // Only show for new Google users who haven't selected a role yet
  if (!session?.user?.needsRoleSelection) return null;

  const handleSelect = async (role) => {
    setSelecting(role);
    try {
      const res = await fetch('/api/auth/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();

      if (data.success) {
        // Update the session to clear the flag and set new role
        await update({ role, needsRoleSelection: false });
        if (role === 'instructor') {
          router.push('/instructor');
        } else {
          router.push('/lms');
        }
        router.refresh();
      }
    } catch {
      setSelecting(null);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)', zIndex: 9998,
      }} />

      {/* Modal */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}>
        <div style={{
          background: 'white', borderRadius: '20px',
          padding: '2.5rem', maxWidth: 560, width: '100%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          textAlign: 'center',
        }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              width: 56, height: 56,
              background: 'rgba(200,16,46,0.1)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              color: '#C8102E',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1A1A1A' }}>
              Welcome to MeetMe Center!
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
              Hi <strong>{session.user.name?.split(' ')[0]}</strong>! Please select how you want to join us.
            </p>
          </div>

          {/* Role Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Student Card */}
            <button
              onClick={() => handleSelect('student')}
              disabled={!!selecting}
              style={{
                border: `2px solid ${selecting === 'student' ? '#C8102E' : '#E2E2E2'}`,
                borderRadius: '14px', padding: '1.5rem 1rem',
                background: selecting === 'student' ? 'rgba(200,16,46,0.05)' : 'white',
                cursor: selecting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', textAlign: 'center',
                opacity: selecting && selecting !== 'student' ? 0.5 : 1,
              }}
              onMouseEnter={e => { if (!selecting) e.currentTarget.style.borderColor = '#C8102E'; }}
              onMouseLeave={e => { if (selecting !== 'student') e.currentTarget.style.borderColor = '#E2E2E2'; }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(200,16,46,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 0.75rem', color: '#C8102E',
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1A1A1A', marginBottom: 4 }}>
                {selecting === 'student' ? 'Setting up...' : 'I am a Student'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                Enroll in courses &amp; learn
              </div>
            </button>

            {/* Instructor Card */}
            <button
              onClick={() => handleSelect('instructor')}
              disabled={!!selecting}
              style={{
                border: `2px solid ${selecting === 'instructor' ? '#C8102E' : '#E2E2E2'}`,
                borderRadius: '14px', padding: '1.5rem 1rem',
                background: selecting === 'instructor' ? 'rgba(200,16,46,0.05)' : 'white',
                cursor: selecting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', textAlign: 'center',
                opacity: selecting && selecting !== 'instructor' ? 0.5 : 1,
              }}
              onMouseEnter={e => { if (!selecting) e.currentTarget.style.borderColor = '#C8102E'; }}
              onMouseLeave={e => { if (selecting !== 'instructor') e.currentTarget.style.borderColor = '#E2E2E2'; }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(200,16,46,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 0.75rem', color: '#C8102E',
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <path d="M8 21h8M12 17v4"/>
                  <path d="M7 8h10M7 12h5"/>
                </svg>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1A1A1A', marginBottom: 4 }}>
                {selecting === 'instructor' ? 'Setting up...' : 'I am an Instructor'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                Create &amp; teach courses
              </div>
            </button>
          </div>

          <p style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
            You can&apos;t change this later. Please choose carefully.
          </p>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Cancel &amp; Sign out
          </button>
        </div>
      </div>
    </>
  );
}
