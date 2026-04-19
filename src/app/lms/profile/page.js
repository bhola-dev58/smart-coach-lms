'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import styles from '../lms.module.css';

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const fileInputRef = useRef(null);
  const kycFileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [kycUploading, setKycUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [editMode, setEditMode] = useState(false);
  const [kycDocType, setKycDocType] = useState('student_id');

  // Form state (matches DB whitelist in API)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    college: '',
    branch: '',
    year: '',
    bio: '',
    socialLinks: { linkedin: '', youtube: '', website: '' },
    payoutInfo: { upiId: '', bankAccount: '', ifscCode: '', bankName: '' },
  });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      if (data.success) {
        setProfile(data.user);
        setForm({
          name: data.user.name || '',
          phone: data.user.phone || '',
          college: data.user.college || '',
          branch: data.user.branch || '',
          year: data.user.year || '',
          bio: data.user.bio || '',
          socialLinks: data.user.socialLinks || { linkedin: '', youtube: '', website: '' },
          payoutInfo: data.user.payoutInfo || { upiId: '', bankAccount: '', ifscCode: '', bankName: '' },
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const handleSocialChange = (field, value) => setForm(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [field]: value } }));
  const handlePayoutChange = (field, value) => setForm(prev => ({ ...prev, payoutInfo: { ...prev.payoutInfo, [field]: value } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(prev => ({ ...prev, ...data.user }));
        showMsg('✅ Profile updated successfully!');
        setEditMode(false);
        if (form.name !== session?.user?.name) updateSession({ name: form.name });
      } else {
        showMsg(`❌ ${data.error}`, 'error');
      }
    } catch {
      showMsg('❌ Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/user/avatar', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: data.url }),
        });
        setProfile(prev => ({ ...prev, avatar: data.url }));
        showMsg('✅ Avatar updated!');
      } else {
        showMsg(`❌ ${data.error}`, 'error');
      }
    } catch {
      showMsg('❌ Avatar upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleKycUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setKycUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('documentType', kycDocType);
      const res = await fetch('/api/user/kyc', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        setProfile(prev => ({
          ...prev,
          verification: { ...prev.verification, status: 'pending', documentType: kycDocType, submittedAt: new Date() }
        }));
        showMsg('✅ Document submitted! Our team will verify it shortly.');
      } else {
        showMsg(`❌ ${data.error}`, 'error');
      }
    } catch {
      showMsg('❌ Document upload failed', 'error');
    } finally {
      setKycUploading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--dash-text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  const isInstructor = profile?.role === 'instructor';
  const isStudent = profile?.role === 'student';
  const vStatus = profile?.verification?.status || 'unverified';

  // Verification badge config
  const verificationConfig = {
    unverified: { label: 'Not Verified', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: '○' },
    pending:    { label: 'Under Review', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: '⏳' },
    approved:   { label: 'Verified',     color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '✓' },
    rejected:   { label: 'Rejected',     color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   icon: '✕' },
  };
  const vc = verificationConfig[vStatus];

  return (
    <div style={{ padding: '0 1.5rem 3rem', maxWidth: '900px' }}>
      {/* Toast */}
      {message.text && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          padding: '0.85rem 1.5rem', borderRadius: '12px',
          background: message.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
          color: message.type === 'success' ? '#10b981' : '#ef4444',
          fontSize: '0.9rem', fontWeight: 600, backdropFilter: 'blur(12px)',
          animation: 'slideIn 0.3s ease',
        }}>
          {message.text}
        </div>
      )}

      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--dash-text)' }}>
        My Profile
      </h2>
      <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Manage your personal information, verification & account settings
      </p>

      {/* ── Avatar + Header ── */}
      <div style={{
        background: 'var(--dash-surface)', borderRadius: 'var(--dash-radius)',
        border: '1px solid var(--dash-border)', padding: '2rem',
        marginBottom: '1.5rem', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: 'linear-gradient(90deg, var(--dash-accent), #ff6b6b, var(--dash-accent))' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              title="Click to update photo"
              style={{
                width: '100px', height: '100px', borderRadius: '50%',
                background: profile?.avatar ? 'transparent' : 'linear-gradient(135deg, var(--dash-accent), #ff6b6b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.5rem', fontWeight: 700, color: '#fff',
                overflow: 'hidden', border: '3px solid var(--dash-border)',
                cursor: 'pointer', transition: 'transform 0.3s, box-shadow 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(200,16,46,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {profile?.avatar
                ? <img src={profile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : profile?.name?.charAt(0).toUpperCase()}
            </div>
            <div onClick={() => fileInputRef.current?.click()} title="Upload photo"
              style={{
                position: 'absolute', bottom: 0, right: 0, width: '32px', height: '32px', borderRadius: '50%',
                background: 'var(--dash-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', border: '2px solid var(--dash-surface)',
              }}>
              {uploading
                ? <div style={{ width: '14px', height: '14px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>}
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleAvatarUpload} style={{ display: 'none' }} />
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--dash-text)', margin: 0 }}>{profile?.name}</h3>
              {/* Verified badge next to name */}
              {vStatus === 'approved' && (
                <span title="Identity Verified" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  VERIFIED
                </span>
              )}
            </div>
            <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{profile?.email}</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{
                padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                background: profile?.role === 'admin' ? 'rgba(139,92,246,0.15)' : profile?.role === 'instructor' ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)',
                color: profile?.role === 'admin' ? '#8b5cf6' : profile?.role === 'instructor' ? '#3b82f6' : '#10b981',
              }}>{profile?.role}</span>
              <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: 'var(--dash-text-muted)' }}>
                Since {formatDate(profile?.createdAt)}
              </span>
            </div>
          </div>

          <button onClick={() => setEditMode(!editMode)} style={{
            padding: '0.6rem 1.25rem', borderRadius: '10px', border: 'none',
            background: editMode ? 'rgba(239,68,68,0.15)' : 'rgba(200,16,46,0.12)',
            color: editMode ? '#ef4444' : 'var(--dash-accent)',
            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {editMode ? '✕ Cancel' : '✏️ Edit Profile'}
          </button>
        </div>
      </div>

      {/* ── Personal Info ── */}
      <SectionCard title="Personal Information" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--dash-accent)" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.25rem' }}>
          <FieldGroup label="Full Name" required>
            {editMode ? <StyledInput value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Your full name" /> : <FieldValue>{profile?.name || '—'}</FieldValue>}
          </FieldGroup>
          <FieldGroup label="Email" badge="Email">
            <FieldValue>{profile?.email}</FieldValue>
          </FieldGroup>
          <FieldGroup label="Phone Number">
            {editMode ? <StyledInput value={form.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+91 9876543210" /> : <FieldValue>{profile?.phone || 'Not provided'}</FieldValue>}
          </FieldGroup>
          <FieldGroup label="Login Method">
            <FieldValue>{profile?.provider === 'google' ? '🔗 Google' : '🔐 Email & Password'}</FieldValue>
          </FieldGroup>
        </div>
      </SectionCard>

      {/* ── Academic Details (Student only) ── */}
      {isStudent && (
        <SectionCard title="Academic Details" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--dash-accent)" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.25rem' }}>
            <FieldGroup label="College / University">
              {editMode ? <StyledInput value={form.college} onChange={e => handleChange('college', e.target.value)} placeholder="e.g. IIT Delhi" /> : <FieldValue>{profile?.college || 'Not provided'}</FieldValue>}
            </FieldGroup>
            <FieldGroup label="Branch / Stream">
              {editMode ? <StyledInput value={form.branch} onChange={e => handleChange('branch', e.target.value)} placeholder="e.g. Computer Science" /> : <FieldValue>{profile?.branch || 'Not provided'}</FieldValue>}
            </FieldGroup>
            <FieldGroup label="Year">
              {editMode ? (
                <select value={form.year} onChange={e => handleChange('year', e.target.value)} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)', fontSize: '0.9rem', outline: 'none' }}>
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              ) : (
                <FieldValue>{profile?.year ? `${profile.year}${[,'st','nd','rd'][profile.year] || 'th'} Year` : 'Not specified'}</FieldValue>
              )}
            </FieldGroup>
            <FieldGroup label="Enrolled Courses">
              <FieldValue>{profile?.enrolledCourses?.length || 0} Courses</FieldValue>
            </FieldGroup>
          </div>
        </SectionCard>
      )}

      {/* ── Instructor Bio & Social ── */}
      {isInstructor && (
        <SectionCard title="Bio & Social Links" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--dash-accent)" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>}>
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <FieldGroup label="Bio / About You">
              {editMode ? (
                <textarea value={form.bio} onChange={e => handleChange('bio', e.target.value)} maxLength={500} placeholder="Tell students about yourself..." rows={4}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
              ) : <FieldValue>{profile?.bio || 'No bio yet'}</FieldValue>}
            </FieldGroup>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.25rem' }}>
              {['linkedin', 'youtube', 'website'].map(s => (
                <FieldGroup key={s} label={s.charAt(0).toUpperCase() + s.slice(1)}>
                  {editMode ? <StyledInput value={form.socialLinks[s]} onChange={e => handleSocialChange(s, e.target.value)} placeholder={`https://${s}.com/...`} /> : <FieldValue>{profile?.socialLinks?.[s] || '—'}</FieldValue>}
                </FieldGroup>
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {/* ── Instructor Payout Info ── */}
      {isInstructor && (
        <SectionCard title="Payout Details" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--dash-accent)" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
          badge={<span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '8px', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontWeight: 600 }}>🔒 Encrypted</span>}>
          <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
            Add your bank/UPI details to receive course revenue payouts. This information is stored securely and never shared.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.25rem' }}>
            <FieldGroup label="UPI ID">
              {editMode ? <StyledInput value={form.payoutInfo.upiId} onChange={e => handlePayoutChange('upiId', e.target.value)} placeholder="yourname@upi" /> : <FieldValue>{profile?.payoutInfo?.upiId || 'Not set'}</FieldValue>}
            </FieldGroup>
            <FieldGroup label="Bank Name">
              {editMode ? <StyledInput value={form.payoutInfo.bankName} onChange={e => handlePayoutChange('bankName', e.target.value)} placeholder="e.g. SBI, HDFC" /> : <FieldValue>{profile?.payoutInfo?.bankName || 'Not set'}</FieldValue>}
            </FieldGroup>
            <FieldGroup label="Account Number">
              {editMode ? <StyledInput value={form.payoutInfo.bankAccount} onChange={e => handlePayoutChange('bankAccount', e.target.value)} placeholder="Account number" /> : <FieldValue>{profile?.payoutInfo?.bankAccount ? '••••••' + profile?.payoutInfo?.bankAccount?.slice(-4) : 'Not set'}</FieldValue>}
            </FieldGroup>
            <FieldGroup label="IFSC Code">
              {editMode ? <StyledInput value={form.payoutInfo.ifscCode} onChange={e => handlePayoutChange('ifscCode', e.target.value.toUpperCase())} placeholder="e.g. SBIN0001234" /> : <FieldValue>{profile?.payoutInfo?.ifscCode || 'Not set'}</FieldValue>}
            </FieldGroup>
          </div>
        </SectionCard>
      )}

      {/* ── KYC / Identity Verification ── */}
      <SectionCard title="Identity Verification (KYC)" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--dash-accent)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}>
        {/* Status Banner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.85rem 1.25rem', borderRadius: '12px',
          background: vc.bg, border: `1px solid ${vc.color}33`,
          marginBottom: '1.5rem',
        }}>
          <span style={{ fontSize: '1.1rem', color: vc.color, fontWeight: 700 }}>{vc.icon}</span>
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: vc.color, fontSize: '0.9rem' }}>
              Status: {vc.label}
            </p>
            {vStatus === 'pending' && (
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--dash-text-muted)' }}>
                Submitted: {formatDate(profile?.verification?.submittedAt)} · Document: {profile?.verification?.documentType?.replace('_', ' ')}
              </p>
            )}
            {vStatus === 'rejected' && profile?.verification?.rejectionReason && (
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#ef4444' }}>
                Reason: {profile.verification.rejectionReason}
              </p>
            )}
            {vStatus === 'approved' && (
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--dash-text-muted)' }}>
                Verified on {formatDate(profile?.verification?.reviewedAt)} · Your profile shows a verified badge ✓
              </p>
            )}
          </div>
        </div>

        {/* Upload Section — only if not approved */}
        {vStatus !== 'approved' && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <FieldGroup label="Document Type">
              <select
                value={kycDocType}
                onChange={e => setKycDocType(e.target.value)}
                style={{ width: '100%', maxWidth: '360px', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)', fontSize: '0.9rem', outline: 'none' }}
              >
                <option value="student_id">Student ID Card</option>
                <option value="college_id">College ID</option>
                <option value="aadhaar">Aadhaar Card</option>
                <option value="pan">PAN Card</option>
                <option value="passport">Passport</option>
              </select>
            </FieldGroup>

            <div>
              <p style={{ color: 'var(--dash-text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                Upload a clear photo of your document. Accepted: JPEG, PNG, WebP, PDF · Max 10MB
              </p>
              <label
                onClick={() => kycFileInputRef.current?.click()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.7rem 1.5rem', borderRadius: '10px', cursor: 'pointer',
                  border: `1px dashed ${kycUploading ? 'var(--dash-text-muted)' : 'var(--dash-accent)'}`,
                  background: kycUploading ? 'rgba(255,255,255,0.02)' : 'rgba(200,16,46,0.06)',
                  color: kycUploading ? 'var(--dash-text-muted)' : 'var(--dash-accent)',
                  fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.2s',
                }}>
                {kycUploading
                  ? <><div style={{ width: '16px', height: '16px', border: '2px solid currentColor', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Uploading...</>
                  : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Upload Document</>}
              </label>
              <input ref={kycFileInputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={handleKycUpload} style={{ display: 'none' }} />
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── Save Button ── */}
      {editMode && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            onClick={() => {
              setEditMode(false);
              setForm({
                name: profile?.name || '', phone: profile?.phone || '',
                college: profile?.college || '', branch: profile?.branch || '',
                year: profile?.year || '', bio: profile?.bio || '',
                socialLinks: profile?.socialLinks || { linkedin: '', youtube: '', website: '' },
                payoutInfo: profile?.payoutInfo || { upiId: '', bankAccount: '', ifscCode: '', bankName: '' },
              });
            }}
            style={{ padding: '0.7rem 1.5rem', borderRadius: '10px', border: '1px solid var(--dash-border)', background: 'transparent', color: 'var(--dash-text-muted)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
          >
            Discard
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            padding: '0.7rem 2rem', borderRadius: '10px', border: 'none',
            background: saving ? 'var(--dash-text-muted)' : 'var(--dash-accent)',
            color: '#fff', fontWeight: 600, fontSize: '0.9rem',
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'all 0.2s',
          }}>
            {saving ? '⏳ Saving...' : '💾 Save Changes'}
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Reusable Sub-components ──
function SectionCard({ title, icon, badge, children }) {
  return (
    <div style={{ background: 'var(--dash-surface)', borderRadius: 'var(--dash-radius)', border: '1px solid var(--dash-border)', padding: '2rem', marginBottom: '1.5rem' }}>
      <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--dash-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {icon}{title}{badge}
      </h4>
      {children}
    </div>
  );
}

function FieldGroup({ label, required, badge, children }) {
  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--dash-text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
        {required && <span style={{ color: 'var(--dash-accent)' }}>*</span>}
        {badge && <span style={{ padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.65rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 600 }}>{badge}</span>}
      </label>
      {children}
    </div>
  );
}

function StyledInput({ ...props }) {
  return (
    <input type="text" {...props} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid var(--dash-border)', background: 'var(--dash-bg)', color: 'var(--dash-text)', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s', ...props.style }}
      onFocus={e => e.target.style.borderColor = 'var(--dash-accent)'}
      onBlur={e => e.target.style.borderColor = 'var(--dash-border)'} />
  );
}

function FieldValue({ children, style = {} }) {
  return <div style={{ padding: '0.6rem 0', fontSize: '0.95rem', color: 'var(--dash-text)', ...style }}>{children}</div>;
}
