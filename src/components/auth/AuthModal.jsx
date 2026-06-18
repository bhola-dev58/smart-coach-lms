'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import styles from '@/app/auth/login/login.module.css';

// ── Google-user OTP step (shown inside modal after Google OAuth) ──
function GoogleOtpModal({ onClose }) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const email = session?.user?.email || '';
  const name = session?.user?.name?.split(' ')[0] || 'there';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

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
      setSuccessMsg('Verified! Redirecting…');
      await update({ needsOtpVerification: false });
      setTimeout(() => { router.replace('/lms'); router.refresh(); }, 800);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(''); setResendCooldown(60);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) setError(data.error);
    } catch { setError('Failed to resend. Try again.'); }
  };

  return (
    <>
      <div className={styles.authHeader} style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>📧</div>
        <h1 style={{ fontSize: 'var(--text-2xl)' }}>Verify Your Email</h1>
        <p>
          Hi <strong style={{ color: 'var(--color-primary)' }}>{name}</strong>! We sent a 6-digit code to
          <br />
          <strong style={{ color: 'var(--color-primary)' }}>{email}</strong>
        </p>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(39,174,96,0.1)', color: '#166534', borderLeft: '4px solid #27AE60', padding: '10px 14px', marginBottom: 16, borderRadius: 6, fontSize: '0.875rem', fontWeight: 500 }}>
          ✅ {successMsg}
        </div>
      )}
      {error && <div className={styles.errorBox}>⚠ {error}</div>}

      <form onSubmit={handleVerify} className={styles.authForm}>
        <div className="form-group">
          <label className="form-label" htmlFor="google-otp-input">One-Time Password (OTP)</label>
          <input
            id="google-otp-input"
            type="text" inputMode="numeric" pattern="[0-9]*"
            maxLength={6} value={otp}
            onChange={e => { setError(''); setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); }}
            placeholder="Enter 6-digit OTP"
            className="form-input"
            style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '0.5rem', fontFamily: 'monospace' }}
            autoFocus required
          />
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
            Expires in 10 minutes · Check spam if not found
          </p>
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading || otp.length !== 6}>
          {loading ? 'Verifying…' : 'Verify & Continue'}
        </button>
      </form>

      <div className={styles.authFooter}>
        <p>
          Didn&apos;t receive the code?{' '}
          {resendCooldown > 0
            ? <span style={{ color: 'var(--color-text-muted)' }}>Resend in {resendCooldown}s</span>
            : <button type="button" onClick={handleResend} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', fontSize: 'inherit' }}>Resend OTP</button>}
        </p>
      </div>
    </>
  );
}

// ── Eye icons ──
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

function PasswordInput({ id, value, onChange, placeholder = '••••••••', required = false, minLength }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id} type={show ? 'text' : 'password'} className="form-input"
        value={value} onChange={onChange} placeholder={placeholder}
        required={required} minLength={minLength}
        style={{ paddingRight: '2.8rem', width: '100%', boxSizing: 'border-box' }}
      />
      <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute', right: '0.75rem', top: '50%',
          transform: 'translateY(-50%)', background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--color-text-muted)', padding: '0',
          display: 'flex', alignItems: 'center',
        }}>
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

// ── OTP Input Step ──
function OtpStep({ email, onSuccess, onClose }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { setError('Please enter the 6-digit OTP.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error); setLoading(false); return; }
      onSuccess();
    } catch {
      setError('Verification failed. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(''); setResendCooldown(60);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) setError(data.error);
    } catch {
      setError('Failed to resend OTP.');
    }
  };

  return (
    <>
      {/* Header — matches authHeader style */}
      <div className={styles.authHeader} style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>📧</div>
        <h1 style={{ fontSize: 'var(--text-2xl)' }}>Verify Your Email</h1>
        <p>
          We sent a 6-digit code to{' '}
          <strong style={{ color: 'var(--color-primary)' }}>{email}</strong>
        </p>
      </div>

      {error && <div className={styles.errorBox}>⚠ {error}</div>}

      {/* OTP Form — same structure as login/register form */}
      <form onSubmit={handleVerify} className={styles.authForm}>
        <div className="form-group">
          <label className="form-label" htmlFor="modal-otp-input">
            One-Time Password (OTP)
          </label>
          <input
            id="modal-otp-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit OTP"
            className="form-input"
            style={{
              textAlign: 'center',
              fontSize: '1.6rem',
              fontWeight: 700,
              letterSpacing: '0.5rem',
              fontFamily: 'monospace',
            }}
            autoFocus
            required
          />
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
            Expires in 10 minutes. Check spam if not found.
          </p>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading || otp.length !== 6}
        >
          {loading ? 'Verifying…' : 'Verify & Continue'}
        </button>
      </form>

      {/* Footer — same class as authFooter */}
      <div className={styles.authFooter}>
        <p>
          Didn&apos;t receive the code?{' '}
          {resendCooldown > 0 ? (
            <span style={{ color: 'var(--color-text-muted)' }}>
              Resend in {resendCooldown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              style={{
                background: 'none', border: 'none', padding: 0,
                color: 'var(--color-primary)', fontWeight: 600,
                cursor: 'pointer', fontSize: 'inherit',
              }}
            >
              Resend OTP
            </button>
          )}
        </p>
        <p style={{ marginTop: 6 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none', border: 'none', padding: 0,
              color: 'var(--color-text-muted)', fontWeight: 500,
              cursor: 'pointer', fontSize: 'inherit',
            }}
          >
            ← Back to register
          </button>
        </p>
      </div>
    </>
  );
}


// ── Main Modal Component ──
function AuthModalInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const authMode = searchParams.get('auth'); // 'login', 'register', or 'verify-otp'

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    college: '', branch: 'Science', year: '1', role: 'student',
    country: '', state: '', city: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // OTP step state (for credentials registration)
  const [otpStep, setOtpStep] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  // ── Must be before early return (Rules of Hooks) ──
  const closeModal = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('auth');
    const q = newParams.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  // Auto-close when authenticated — but NOT for verify-otp mode (user must verify first)
  useEffect(() => {
    if (status === 'authenticated' && authMode && authMode !== 'verify-otp') {
      // Only close if user is fully verified
      if (!session?.user?.needsOtpVerification) {
        closeModal();
      }
    }
  }, [status, authMode, session]);

  if (!authMode) return null;

  // ── OTP verified — auto-login and close ──
  const handleOtpSuccess = async () => {
    const loginRes = await signIn('credentials', {
      redirect: false,
      email: pendingEmail,
      password: formData.password,
    });
    if (loginRes?.error) {
      setOtpStep(false);
      setError('Verification complete! Please log in.');
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('auth', 'login');
      router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
    } else {
      closeModal();
      router.refresh();
    }
  };

  const update = (field, val) => setFormData(prev => ({ ...prev, [field]: val }));

  const switchMode = (mode) => {
    setOtpStep(false);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('auth', mode);
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (authMode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match. Please try again.'); return;
      }
    }

    setLoading(true);

    if (authMode === 'login') {
      const res = await signIn('credentials', {
        redirect: false, email: formData.email, password: formData.password,
      });
      setLoading(false);
      if (res?.error) setError(res.error);
      else { closeModal(); router.refresh(); }
    } else {
      // Register flow
      try {
        const createRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            location: { country: formData.country, state: formData.state, city: formData.city },
          }),
        });
        const data = await createRes.json();
        setLoading(false);
        if (!data.success) { setError(data.error); return; }

        // Show OTP verification step
        if (data.requiresOtp) {
          setPendingEmail(data.email || formData.email);
          setOtpStep(true);
        } else {
          // Fallback: direct login if OTP not required
          const loginRes = await signIn('credentials', {
            redirect: false, email: formData.email, password: formData.password,
          });
          if (loginRes?.error) setError(loginRes.error);
          else { closeModal(); router.refresh(); }
        }
      } catch (err) {
        console.error(err);
        setError('Something went wrong. Please try again.');
        setLoading(false);
      }
    }
  };

  const isRegister = authMode === 'register';

  const isVerifyOtp = authMode === 'verify-otp';

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        display: 'flex', justifyContent: 'center',
        alignItems: isRegister ? 'flex-start' : 'center',
        overflowY: isRegister ? 'auto' : 'unset',
        zIndex: 9999, padding: isRegister ? '2rem 1rem' : '1rem',
        backdropFilter: 'blur(5px)',
      }}
      // Don't allow closing by backdrop click when OTP verification is required
      onClick={isVerifyOtp ? undefined : closeModal}
    >
      <div
        className={styles.authCard}
        style={{
          position: 'relative', margin: 'auto', width: '100%',
          padding: isRegister ? '1.5rem 2rem' : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'none', border: 'none', fontSize: '1.5rem',
            cursor: 'pointer', color: 'var(--color-text-muted)', lineHeight: 1,
            zIndex: 1,
          }}
          onClick={closeModal}
          aria-label="Close"
        >
          &times;
        </button>

        {/* Google OAuth OTP step */}
        {authMode === 'verify-otp' ? (
          <GoogleOtpModal onClose={closeModal} />
        ) : otpStep ? (
          <OtpStep
            email={pendingEmail}
            onSuccess={handleOtpSuccess}
            onClose={() => setOtpStep(false)}
          />
        ) : (
          <>
            <div className={styles.authHeader} style={isRegister ? { marginBottom: '1rem' } : {}}>
              <h1 style={isRegister ? { fontSize: '1.4rem', marginBottom: '0.2rem' } : {}}>
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-light)' }}>
                {isRegister ? 'Join 10,000+ students at Gradify Academy' : 'Sign in to continue to your dashboard'}
              </p>
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.authForm} style={isRegister ? { marginBottom: '0.75rem' } : {}}>
              {isRegister ? (
                <>
                  {/* Row 1: Name + Role + Phone */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Full Name *</label>
                      <input type="text" className="form-input" required placeholder="Full name" value={formData.name} onChange={e => update('name', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Register As</label>
                      <select className="form-select" value={formData.role} onChange={e => update('role', e.target.value)}>
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Phone</label>
                      <input
                        type="tel" className="form-input" placeholder="10-digit"
                        value={formData.phone}
                        onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 10) update('phone', v); }}
                        maxLength={10}
                      />
                    </div>
                  </div>

                  {/* Row 2: Email */}
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.72rem' }}>Email *</label>
                    <input type="email" className="form-input" required placeholder="you@example.com" value={formData.email} onChange={e => update('email', e.target.value)} />
                  </div>

                  {/* Row 3: Password */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Password *</label>
                      <PasswordInput id="reg-password" value={formData.password} onChange={e => update('password', e.target.value)} required minLength={8} placeholder="Min. 8 characters" />
                      {formData.password.length > 0 && formData.password.length < 8 && (
                        <p style={{ fontSize: '0.7rem', color: 'var(--color-primary)', margin: '0.15rem 0 0' }}>Too short</p>
                      )}
                    </div>
                    <div style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Confirm Password *</label>
                      <PasswordInput id="reg-confirm-password" value={formData.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required placeholder="Re-enter password" />
                      {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                        <p style={{ fontSize: '0.7rem', color: 'var(--color-primary)', margin: '0.15rem 0 0' }}>Passwords don't match</p>
                      )}
                    </div>
                  </div>

                  {/* Row 4: College + Year */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>School / College Name</label>
                      <input type="text" className="form-input" placeholder="Your school or college" value={formData.college} onChange={e => update('college', e.target.value)} />
                    </div>
                    <div style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Class / PUC</label>
                      <select className="form-select" value={formData.year} onChange={e => update('year', e.target.value)}>
                        <option value="1">Class 8</option>
                        <option value="2">Class 9</option>
                        <option value="3">Class 10 (SSLC)</option>
                        <option value="4">1st PUC (Class 11)</option>
                        <option value="5">2nd PUC (Class 12)</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 5: Location */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Country</label>
                      <select className="form-select" value={formData.country} onChange={e => update('country', e.target.value)}>
                        <option value="">Country</option>
                        <option value="India">🇮🇳 India</option>
                        <option value="Nepal">🇳🇵 Nepal</option>
                        <option value="USA">🇺🇸 USA</option>
                        <option value="UK">🇬🇧 UK</option>
                        <option value="Canada">🇨🇦 Canada</option>
                        <option value="Australia">🇦🇺 Australia</option>
                        <option value="Germany">🇩🇪 Germany</option>
                        <option value="UAE">🇦🇪 UAE</option>
                        <option value="Singapore">🇸🇬 Singapore</option>
                        <option value="Other">🌍 Other</option>
                      </select>
                    </div>
                    <div style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>State</label>
                      <input type="text" className="form-input" placeholder="State" value={formData.state} onChange={e => update('state', e.target.value)} />
                    </div>
                    <div style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>City</label>
                      <input type="text" className="form-input" placeholder="City" value={formData.city} onChange={e => update('city', e.target.value)} />
                    </div>
                  </div>

                  {/* Row 6: Branch */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.72rem' }}>Stream / Subject</label>
                    <select className="form-select" value={formData.branch} onChange={e => update('branch', e.target.value)}>
                      <option value="Science">Science (PCMB / PCMC)</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Arts">Arts / Humanities</option>
                      <option value="General">Class 8-10 General</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="login-email">Email Address</label>
                    <input id="login-email" type="email" className="form-input" value={formData.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="login-password">Password</label>
                    <PasswordInput id="login-password" value={formData.password} onChange={e => update('password', e.target.value)} required />
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading
                  ? (isRegister ? 'Creating Account...' : 'Logging in...')
                  : (isRegister ? 'Sign Up & Get OTP' : 'Log In')}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
              <span style={{ padding: '0 1rem', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            </div>

            <button
              type="button" className="btn btn-block"
              style={{
                background: 'white', color: '#333', border: '1px solid #ccc',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                gap: '0.5rem', marginBottom: '1rem',
              }}
              onClick={() => signIn('google', { callbackUrl: '/lms' })}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {isRegister ? 'Sign up with Google' : 'Sign in with Google'}
            </button>

            <div className={styles.authFooter}>
              {isRegister ? (
                <p>Already have an account? <button type="button" onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>Log in</button></p>
              ) : (
                <p>Don't have an account? <button type="button" onClick={() => switchMode('register')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>Sign up</button></p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthModal() {
  return (
    <Suspense fallback={null}>
      <AuthModalInner />
    </Suspense>
  );
}
