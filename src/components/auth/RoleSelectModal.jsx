'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RoleSelectModal() {
  const { data: session, update } = useSession();
  const router = useRouter();

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Only show for new Google users who haven't completed onboarding
  if (!session?.user?.needsRoleSelection) return null;

  // Pre-fill name from Google on first render
  if (!fullName && session?.user?.name) {
    // We use a ref-like pattern: set once
    // Actually let's use a different approach — check in handleSelect
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ── Client-side validation ──
    const trimmedName = fullName.trim() || (session?.user?.name || '').trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }

    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setError('Phone number is required.');
      return;
    }
    // Basic phone validation: 10+ digits
    const phoneDigits = trimmedPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits).');
      return;
    }

    if (!role) {
      setError('Please select your role (Student or Instructor).');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/auth/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, name: trimmedName, phone: trimmedPhone }),
      });
      const data = await res.json();

      if (data.success) {
        // Update session to clear the flag, set new role & name
        await update({ role, needsRoleSelection: false, name: trimmedName });
        if (role === 'instructor') {
          router.push('/lms/instructor');
        } else {
          router.push('/lms');
        }
        router.refresh();
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
        setSaving(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setSaving(false);
    }
  };

  // Default name from Google
  const defaultName = session?.user?.name || '';

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
        padding: '1rem', overflowY: 'auto',
      }}>
        <div style={{
          background: 'white', borderRadius: '20px',
          padding: '2.5rem', maxWidth: 520, width: '100%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: 56, height: 56,
              background: 'rgba(200,16,46,0.1)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem', color: '#C8102E',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.4rem', color: '#1A1A1A' }}>
              Complete Your Profile
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              Hi <strong>{defaultName.split(' ')[0]}</strong>! Please fill in the details below to get started.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(200,16,46,0.08)', border: '1px solid rgba(200,16,46,0.3)',
              color: '#C8102E', padding: '0.65rem 1rem', borderRadius: '10px',
              marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 500,
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                Full Name <span style={{ color: '#C8102E' }}>*</span>
              </label>
              <input
                type="text"
                value={fullName || defaultName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                style={{
                  width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px',
                  border: '1.5px solid #E2E2E2', fontSize: '0.92rem', color: '#1A1A1A',
                  outline: 'none', transition: 'border-color 0.2s', background: '#FAFAFA',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#C8102E'}
                onBlur={e => e.target.style.borderColor = '#E2E2E2'}
              />
            </div>

            {/* Phone Number */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                Phone Number <span style={{ color: '#C8102E' }}>*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
                style={{
                  width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px',
                  border: '1.5px solid #E2E2E2', fontSize: '0.92rem', color: '#1A1A1A',
                  outline: 'none', transition: 'border-color 0.2s', background: '#FAFAFA',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#C8102E'}
                onBlur={e => e.target.style.borderColor = '#E2E2E2'}
              />
            </div>

            {/* Register As (Role Selection) */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                Register As <span style={{ color: '#C8102E' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {/* Student Card */}
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  style={{
                    border: `2px solid ${role === 'student' ? '#C8102E' : '#E2E2E2'}`,
                    borderRadius: '12px', padding: '1.1rem 0.75rem',
                    background: role === 'student' ? 'rgba(200,16,46,0.05)' : 'white',
                    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                  }}
                  onMouseEnter={e => { if (role !== 'student') e.currentTarget.style.borderColor = '#C8102E80'; }}
                  onMouseLeave={e => { if (role !== 'student') e.currentTarget.style.borderColor = '#E2E2E2'; }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: role === 'student' ? 'rgba(200,16,46,0.15)' : 'rgba(200,16,46,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 0.5rem', color: '#C8102E',
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1A1A1A', marginBottom: 2 }}>
                    Student
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                    Enroll &amp; learn courses
                  </div>
                </button>

                {/* Instructor Card */}
                <button
                  type="button"
                  onClick={() => setRole('instructor')}
                  style={{
                    border: `2px solid ${role === 'instructor' ? '#C8102E' : '#E2E2E2'}`,
                    borderRadius: '12px', padding: '1.1rem 0.75rem',
                    background: role === 'instructor' ? 'rgba(200,16,46,0.05)' : 'white',
                    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                  }}
                  onMouseEnter={e => { if (role !== 'instructor') e.currentTarget.style.borderColor = '#C8102E80'; }}
                  onMouseLeave={e => { if (role !== 'instructor') e.currentTarget.style.borderColor = '#E2E2E2'; }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: role === 'instructor' ? 'rgba(200,16,46,0.15)' : 'rgba(200,16,46,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 0.5rem', color: '#C8102E',
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2"/>
                      <path d="M8 21h8M12 17v4"/>
                      <path d="M7 8h10M7 12h5"/>
                    </svg>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1A1A1A', marginBottom: 2 }}>
                    Instructor
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                    Create &amp; teach courses
                  </div>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%', padding: '0.8rem', borderRadius: '12px',
                border: 'none', background: saving ? '#9ca3af' : '#C8102E',
                color: 'white', fontWeight: 700, fontSize: '0.95rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', opacity: saving ? 0.8 : 1,
              }}
            >
              {saving ? '⏳ Setting up your account...' : '🚀 Complete Registration'}
            </button>
          </form>

          <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', marginTop: '0.75rem' }}>
            You can&apos;t change your role later. Please choose carefully.
          </p>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Cancel &amp; Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
