'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { signIn } from 'next-auth/react';
import styles from '@/app/auth/login/login.module.css';

// Modal styling overrides inside CSS module, but we will add some inline or specific classes for the overlay
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  padding: '1rem',
  backdropFilter: 'blur(4px)'
};

const closeButtonStyle = {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
  color: 'var(--color-text-muted)'
};

function AuthModalInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const authMode = searchParams.get('auth'); // 'login' or 'register'
  
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', college: '', branch: 'CSE', year: '1', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If no auth query param, don't show the modal
  if (!authMode) return null;

  const update = (field, val) => setFormData({ ...formData, [field]: val });

  const closeModal = () => {
    // Remove query params but stay on the same page
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('auth');
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const switchMode = (mode) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('auth', mode);
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (authMode === 'login') {
      const res = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      setLoading(false);

      if (res?.error) {
        setError(res.error);
      } else {
        closeModal();
        router.refresh();
      }
    } else {
      try {
        const createRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        const data = await createRes.json();
        
        if (!data.success) {
          setError(data.error);
          setLoading(false);
          return;
        }

        // Auto login after successful signup
        const loginRes = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        setLoading(false);

        if (loginRes?.error) {
          setError(loginRes.error);
        } else {
          closeModal();
          router.refresh();
        }
      } catch (err) {
        console.error(err);
        setError('Something went wrong. Please try again.');
        setLoading(false);
      }
    }
  };

  return (
    <div style={overlayStyle} onClick={closeModal}>
      <div 
        className={styles.authCard} 
        style={{ position: 'relative', margin: 0 }}
        onClick={(e) => e.stopPropagation()} // Prevent clicking inside from closing
      >
        <button style={closeButtonStyle} onClick={closeModal} aria-label="Close">
          &times;
        </button>

        <div className={styles.authHeader}>
          <h1 style={authMode === 'register' ? { fontSize: 'var(--text-3xl)' } : {}}>
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p style={authMode === 'register' ? { color: 'var(--color-text-light)' } : {}}>
            {authMode === 'login' 
              ? 'Sign in to continue to your dashboard' 
              : 'Join 10,000+ B.Tech students at MeetMe Center'}
          </p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          {authMode === 'register' ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input type="text" className="form-input" required placeholder="Your full name" value={formData.name} onChange={e => update('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Register As</label>
                  <select className="form-select" value={formData.role} onChange={e => update('role', e.target.value)}>
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input type="email" className="form-input" required placeholder="student@meetme.center" value={formData.email} onChange={e => update('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input type="tel" className="form-input" placeholder="+91 98765 43210" value={formData.phone} onChange={e => update('phone', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input type="password" className="form-input" required placeholder="••••••••" minLength="8" value={formData.password} onChange={e => update('password', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">College Name</label>
                <input type="text" className="form-input" placeholder="Your college/university" value={formData.college} onChange={e => update('college', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Branch</label>
                  <select className="form-select" value={formData.branch} onChange={e => update('branch', e.target.value)}>
                    <option>CSE</option><option>ECE</option><option>Mechanical</option><option>Civil</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select className="form-select" value={formData.year} onChange={e => update('year', e.target.value)}>
                    <option value="1">1st Year</option><option value="2">2nd Year</option><option value="3">3rd Year</option><option value="4">4th Year</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input id="email" type="email" className="form-input" value={formData.email} onChange={e => update('email', e.target.value)} placeholder="student@example.com" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input id="password" type="password" className="form-input" value={formData.password} onChange={e => update('password', e.target.value)} placeholder="••••••••" required />
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading 
              ? (authMode === 'login' ? 'Logging in...' : 'Registering...') 
              : (authMode === 'login' ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
          <span style={{ padding: '0 1rem', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
        </div>
        
        <button
          type="button"
          className="btn btn-block"
          style={{ 
            background: 'white', 
            color: '#333', 
            border: '1px solid #ccc', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '1rem'
          }}
          onClick={() => signIn('google', { callbackUrl: '/lms' })}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {authMode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
        </button>

        <div className={styles.authFooter}>
          {authMode === 'login' ? (
            <p>Don't have an account? <button type="button" onClick={() => switchMode('register')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>Sign up</button></p>
          ) : (
            <p>Already have an account? <button type="button" onClick={() => switchMode('login')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>Log in</button></p>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrap in suspense since we use search params
export default function AuthModal() {
  return (
    <Suspense fallback={null}>
      <AuthModalInner />
    </Suspense>
  );
}
