'use client';

import { useState } from 'react';
import Link from 'next/link';

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
        </div>

        <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-text-light)' }}>
          Already have an account? <Link href="/auth/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Log In</Link>
        </p>
      </div>
    </section>
  );
}
