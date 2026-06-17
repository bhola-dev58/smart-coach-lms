'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', college: '', branch: 'CSE', year: '1', role: 'student', country: '', state: '', city: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPass, setShowPass] = useState(false);

  const update = (field, val) => setFormData(prev => ({ ...prev, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          location: { country: formData.country, state: formData.state, city: formData.city },
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error);
      } else {
        setSuccess('Account created! Logging you in...');
        // Auto-login after successful registration
        const loginRes = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });
        if (loginRes?.error) {
          router.push('/auth/login');
        } else {
          router.push('/lms');
          router.refresh();
        }
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>Create Account</h1>
          <p style={{ color: 'var(--color-text-light)' }}>Join 10,000+ students at Gradify Academy</p>
        </div>

        <div style={{ border: '1px solid var(--color-border)', padding: 'var(--space-8)', background: 'white', borderRadius: 'var(--radius-lg)' }}>

          {/* Google Sign Up */}
          <button
            type="button"
            className="btn btn-block"
            style={{ background: 'white', color: '#333', border: '1px solid #ccc', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}
            onClick={() => signIn('google', { callbackUrl: '/lms' })}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 1.5rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
            <span style={{ padding: '0 1rem', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div style={{ background: 'rgba(200,16,46,0.08)', border: '1px solid rgba(200,16,46,0.3)', color: '#C8102E', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              ⚠ {error}
            </div>
          )}
          {success && (
            <div style={{ background: 'rgba(46,213,115,0.08)', border: '1px solid rgba(46,213,115,0.3)', color: '#2ed573', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className="form-input" required placeholder="Your full name" value={formData.name} onChange={e => update('name', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Register As</label>
              <select className="form-select" value={formData.role} onChange={e => update('role', e.target.value)}>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-input" required placeholder="you@example.com" value={formData.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91 xxxxxxxxxx"
                  value={formData.phone}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 10) {
                      update('phone', val);
                    }
                  }}
                  maxLength={10}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  required
                  placeholder="Min. 8 characters"
                  minLength="8"
                  value={formData.password}
                  onChange={e => update('password', e.target.value)}
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)', fontSize: '0.85rem' }}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {formData.password.length > 0 && formData.password.length < 8 && (
                <p style={{ fontSize: '0.78rem', color: '#C8102E', marginTop: '0.25rem' }}>Password too short</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">School / College Name</label>
              <input type="text" className="form-input" placeholder="Your school or college" value={formData.college} onChange={e => update('college', e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Country</label>
                <select className="form-select" value={formData.country} onChange={e => update('country', e.target.value)}>
                  <option value="">Select Country</option>
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
              <div className="form-group">
                <label className="form-label">State</label>
                <input type="text" className="form-input" placeholder="e.g. Maharashtra" value={formData.state} onChange={e => update('state', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input type="text" className="form-input" placeholder="e.g. Mumbai" value={formData.city} onChange={e => update('city', e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Stream / Subject</label>
                <select className="form-select" value={formData.branch} onChange={e => update('branch', e.target.value)}>
                  <option value="CSE">Science (PCM/PCB)</option>
                  <option value="ECE">Commerce</option>
                  <option value="Mechanical">Arts/Humanities</option>
                  <option value="Civil">Class 8-10 General</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Class</label>
                <select className="form-select" value={formData.year} onChange={e => update('year', e.target.value)}>
                  <option value="1">Class 8</option>
                  <option value="2">Class 9</option>
                  <option value="3">Class 10</option>
                  <option value="4">Class 11 & 12</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading} style={{ marginTop: 'var(--space-4)' }}>
              {loading ? 'Creating Account...' : 'Create Free Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-text-light)' }}>
          Already have an account? <Link href="/auth/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Log In</Link>
        </p>
      </div>
    </section>
  );
}
