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
