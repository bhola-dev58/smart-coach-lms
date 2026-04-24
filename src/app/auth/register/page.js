'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', college: '', branch: 'CSE', year: '1' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: API call to create account
    setTimeout(() => setLoading(false), 1500);
  };

  const update = (field, val) => setFormData({ ...formData, [field]: val });

  return (
    <section className="section" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>Create Account</h1>
          <p style={{ color: 'var(--color-text-light)' }}>Join 10,000+ B.Tech students at MeetMe Center</p>
        </div>

        <div style={{ border: '1px solid var(--color-border)', padding: 'var(--space-8)', background: 'white' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className="form-input" required placeholder="Your full name" value={formData.name} onChange={e => update('name', e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-input" required placeholder="you@example.com" value={formData.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="tel" className="form-input" placeholder="+91 98765 43210" value={formData.phone} onChange={e => update('phone', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input type="password" className="form-input" required placeholder="Min. 8 characters" minLength="8" value={formData.password} onChange={e => update('password', e.target.value)} />
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
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading} style={{ marginTop: 'var(--space-4)' }}>
              {loading ? 'Creating Account...' : 'Create Free Account'}
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
            Sign up with Google
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-text-light)' }}>
          Already have an account? <Link href="/auth/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Log In</Link>
        </p>
      </div>
    </section>
  );
}
