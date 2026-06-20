'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [config, setConfig] = useState({
    maintenanceMode: false,
    allowRegistrations: true,
    supportEmail: 'contact@gradify.academy',
    paymentGateway: 'Razorpay / UPI Apps',
    appVersion: 'v2.1.0-stable'
  });

  useEffect(() => {
    let active = true;
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (active) {
          if (data.success && data.settings) {
            setConfig({
              maintenanceMode: data.settings.maintenanceMode ?? false,
              allowRegistrations: data.settings.allowRegistrations ?? true,
              supportEmail: data.settings.supportEmail || 'contact@gradify.academy',
              paymentGateway: data.settings.paymentGateway || 'Razorpay / UPI Apps',
              appVersion: data.settings.appVersion || 'v2.1.0-stable'
            });
          } else {
            setError(data.error || 'Failed to load system settings');
          }
          setLoading(false);
        }
      })
      .catch(err => {
        if (active) {
          console.error(err);
          setError('Failed to fetch configurations.');
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintenanceMode: config.maintenanceMode,
          allowRegistrations: config.allowRegistrations,
          supportEmail: config.supportEmail
        })
      });
      const data = await res.json();
      setSaving(false);
      if (data.success) {
        alert('System settings updated successfully!');
      } else {
        setError(data.error || 'Failed to save changes.');
      }
    } catch {
      setError('A network error occurred. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>System Settings</h2>
        </div>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '12px', border: '1px solid #eaeaea', textAlign: 'center' }}>
          <p style={{ color: '#666' }}>⏳ Loading configurations from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>System Settings</h2>
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #eaeaea', maxWidth: '800px' }}>
        <form onSubmit={handleSave}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eaeaea', paddingBottom: '0.5rem', color: '#1a1a1a' }}>Global Configuration</h3>
          
          {error && (
            <div style={{ background: 'rgba(200,16,46,0.1)', color: '#c8102e', borderLeft: '4px solid #c8102e', padding: '10px 14px', marginBottom: '1.5rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 500 }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            {/* Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={config.maintenanceMode}
                  onChange={handleChange}
                  style={{ width: '20px', height: '20px' }}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>Maintenance Mode</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>Disable public access (admins can still login).</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="allowRegistrations"
                  checked={config.allowRegistrations}
                  onChange={handleChange}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>Allow New Registrations</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>Students can sign up via popup modal.</div>
                </div>
              </label>
            </div>

            {/* General Inputs */}
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: '#555' }}>Support Email</label>
                <input
                  type="email"
                  name="supportEmail"
                  value={config.supportEmail}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '6px', fontSize: '1rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: '#555' }}>Payment Gateway Integrations</label>
                <input
                  type="text"
                  value={config.paymentGateway}
                  disabled
                  style={{ width: '100%', padding: '0.8rem', border: '1px solid #eaeaea', borderRadius: '6px', fontSize: '1rem', background: '#f8f9fa', color: '#666' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eaeaea', paddingTop: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#888' }}>
              System Build: <span style={{ fontFamily: 'monospace' }}>{config.appVersion}</span>
            </div>
            <button
              type="submit"
              disabled={saving}
              style={{ background: 'var(--color-primary)', color: 'white', padding: '0.8rem 2.5rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: saving ? 'wait' : 'pointer' }}
            >
              {saving ? 'Saving Constants...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
