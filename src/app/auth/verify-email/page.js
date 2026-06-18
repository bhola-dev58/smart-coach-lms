'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyEmailInner() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/lms';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Redirect if already verified or not logged in
  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/');
    if (status === 'authenticated' && session?.user?.needsOtpVerification === false) {
      router.replace(callbackUrl);
    }
  }, [status, session, callbackUrl, router]);

  const email = session?.user?.email || '';
  const name = session?.user?.name?.split(' ')[0] || 'there';

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { setError('Please enter the complete 6-digit OTP.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || 'Verification failed.'); setLoading(false); return; }
      setSuccessMsg('Email verified! Taking you to your dashboard…');
      await update({ needsOtpVerification: false });
      setTimeout(() => { router.replace(callbackUrl); router.refresh(); }, 1000);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(''); setSuccessMsg(''); setResendCooldown(60);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) setError(data.error);
      else setSuccessMsg('New OTP sent — check your inbox.');
    } catch {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  if (status === 'loading') {
    return (
      <div style={pageStyle}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          <p style={{ fontSize: 15, opacity: 0.8 }}>Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {/* Decorative blobs */}
      <div style={blob1Style} />
      <div style={blob2Style} />

      <div style={cardStyle}>
        {/* Icon */}
        <div style={iconWrapStyle}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B2B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 10px', color: '#1A1A1A', letterSpacing: '-0.02em' }}>
          Verify Your Email
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#4A4A6A', margin: '0 0 24px', lineHeight: 1.7 }}>
          Hi <strong style={{ color: '#1B2B6B' }}>{name}</strong>! We sent a 6-digit code to
          <br />
          <span style={{
            display: 'inline-block', marginTop: 6, padding: '4px 14px',
            background: 'rgba(27,43,107,0.07)', borderRadius: 20,
            fontWeight: 700, color: '#1B2B6B', fontSize: '0.88rem',
          }}>
            {email}
          </span>
        </p>

        {/* Success */}
        {successMsg && (
          <div style={{
            background: 'rgba(39,174,96,0.1)', color: '#1a6b3a',
            border: '1px solid #86efac', borderLeft: '4px solid #27AE60',
            padding: '12px 16px', marginBottom: 20, borderRadius: 8,
            fontSize: '0.875rem', fontWeight: 500,
          }}>
            ✅ {successMsg}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(231,76,60,0.08)', color: '#c0392b',
            borderLeft: '4px solid #E74C3C',
            padding: '12px 16px', marginBottom: 20, borderRadius: 8,
            fontSize: '0.875rem', fontWeight: 500,
          }}>
            ⚠ {error}
          </div>
        )}

        {/* OTP Form */}
        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: 8 }}>
            <label style={{
              display: 'block', fontSize: '0.82rem', fontWeight: 600,
              color: '#4A4A6A', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              One-Time Password (OTP)
            </label>
            <input
              id="otp-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={e => { setError(''); setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); }}
              placeholder="• • • • • •"
              autoFocus
              required
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '16px 20px', border: `2px solid ${error ? '#E74C3C' : otp.length === 6 ? '#27AE60' : '#E2E6EF'}`,
                borderRadius: 12, fontSize: '2rem', fontWeight: 800,
                textAlign: 'center', letterSpacing: '0.8rem', fontFamily: 'monospace',
                background: '#F8F9FB', color: '#1A1A1A', outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
            <p style={{ fontSize: '0.78rem', color: '#8A8A9A', marginTop: 8, textAlign: 'center' }}>
              OTP expires in 10 minutes · Check spam if not found
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            style={{
              width: '100%', padding: '15px',
              background: otp.length === 6 ? 'linear-gradient(135deg, #1B2B6B, #27AE60)' : '#E2E6EF',
              color: otp.length === 6 ? '#fff' : '#8A8A9A',
              border: 'none', borderRadius: 12, fontSize: '1rem',
              fontWeight: 700, cursor: otp.length === 6 ? 'pointer' : 'not-allowed',
              marginTop: 16,
              boxShadow: otp.length === 6 ? '0 8px 24px rgba(27,43,107,0.25)' : 'none',
              transition: 'all 0.2s',
              letterSpacing: '0.02em',
            }}
          >
            {loading ? '⏳ Verifying…' : '✅ Verify & Continue'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ height: 1, background: '#E2E6EF', margin: '24px 0' }} />

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#8A8A9A' }}>
          <p style={{ margin: '0 0 10px' }}>
            Didn&apos;t receive the code?{' '}
            {resendCooldown > 0 ? (
              <span style={{ color: '#4A4A6A' }}>Resend in {resendCooldown}s</span>
            ) : (
              <button
                onClick={handleResend}
                type="button"
                style={{
                  background: 'none', border: 'none', padding: 0,
                  color: '#1B2B6B', fontWeight: 700, cursor: 'pointer',
                  fontSize: '0.85rem', textDecoration: 'underline',
                }}
              >
                Resend OTP
              </button>
            )}
          </p>
          <p style={{ margin: 0 }}>
            Wrong account?{' '}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              type="button"
              style={{
                background: 'none', border: 'none', padding: 0,
                color: '#1B2B6B', fontWeight: 700, cursor: 'pointer',
                fontSize: '0.85rem', textDecoration: 'underline',
              }}
            >
              Sign out
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Styles ──
const pageStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  zIndex: 9999,
  background: 'linear-gradient(135deg, #1B2B6B 0%, #162357 40%, #0d4f2e 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
  overflow: 'hidden',
};

const blob1Style = {
  position: 'absolute', top: '-15%', right: '-10%',
  width: 400, height: 400, borderRadius: '50%',
  background: 'rgba(39,174,96,0.18)',
  filter: 'blur(60px)', pointerEvents: 'none',
};

const blob2Style = {
  position: 'absolute', bottom: '-15%', left: '-10%',
  width: 350, height: 350, borderRadius: '50%',
  background: 'rgba(245,166,35,0.15)',
  filter: 'blur(60px)', pointerEvents: 'none',
};

const cardStyle = {
  position: 'relative', zIndex: 1,
  background: 'white',
  borderRadius: 20,
  padding: '2.5rem',
  width: '100%', maxWidth: 480,
  boxShadow: '0 32px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
};

const iconWrapStyle = {
  width: 68, height: 68, borderRadius: '50%', margin: '0 auto 20px',
  background: 'linear-gradient(135deg, rgba(27,43,107,0.08), rgba(39,174,96,0.1))',
  border: '2px solid rgba(27,43,107,0.12)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div style={pageStyle}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: 40 }}>⏳</div>
        </div>
      </div>
    }>
      <VerifyEmailInner />
    </Suspense>
  );
}
