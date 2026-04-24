'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); // Clear form
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(data.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-banner">
        <div className="container">
          <h1>Contact Us</h1>
          <nav className="breadcrumb"><Link href="/">Home</Link><span className="separator">/</span><span className="current">Contact</span></nav>
        </div>
      </div>

      {/* Info Cards */}
      <section className="section section-light" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-8)' }}>
        <div className="container">
          <div className="grid grid-4">
            {[
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8102E" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, title: 'Visit Us', text: 'Block A, Tech Park Road,\nBengaluru 560001' },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8102E" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>, title: 'Call Us', text: '+91 98765 43210\n+91 98765 43211' },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8102E" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, title: 'Email Us', text: 'info@meetmecenter.com\nsupport@meetmecenter.com' },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C8102E" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: 'Working Hours', text: 'Mon – Fri: 8AM – 8PM\nSat: 9AM – 6PM' },
            ].map((card, i) => (
              <div key={i} style={{ background: 'white', padding: 'var(--space-6)', border: '1px solid var(--color-border)', textAlign: 'center', borderTop: '4px solid var(--color-primary)' }}>
                <div style={{ width: 56, height: 56, background: 'rgba(200,16,46,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
                  {card.icon}
                </div>
                <h4 style={{ marginBottom: 'var(--space-2)' }}>{card.title}</h4>
                <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--text-sm)', whiteSpace: 'pre-line' }}>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="section section-white">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-10)', alignItems: 'start' }}>
            <div>
              <h2 style={{ marginBottom: 'var(--space-2)' }}>Send Us a Message</h2>
              <p style={{ color: 'var(--color-text-light)', marginBottom: 'var(--space-8)' }}>Have a question? Fill out the form below and we&apos;ll get back within 4 hours.</p>

              {submitted && (
                <div style={{ background: 'rgba(46,213,115,0.1)', border: '1px solid #2ed573', padding: 'var(--space-4)', marginBottom: 'var(--space-4)', color: '#2ed573', fontWeight: 600, fontSize: 'var(--text-sm)', borderRadius: '4px' }}>
                  ✓ Message sent successfully! We&apos;ll get back to you soon.
                </div>
              )}

              {error && (
                <div style={{ background: 'rgba(200,16,46,0.1)', border: '1px solid var(--color-primary)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)', color: 'var(--color-primary)', fontWeight: 600, fontSize: 'var(--text-sm)', borderRadius: '4px' }}>
                  ❌ {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', marginBottom: 'var(--space-5)' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input type="text" className="form-input" required placeholder="Your name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input type="email" className="form-input" required placeholder="you@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', marginBottom: 'var(--space-5)' }}>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input type="tel" className="form-input" placeholder="+91 98765 43210" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject *</label>
                    <select className="form-select" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                      <option value="" disabled>Choose a topic</option>
                      <option>Course Inquiry</option>
                      <option>Payment Issue</option>
                      <option>Technical Support</option>
                      <option>Placement Assistance</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
                  <label className="form-label">Your Message *</label>
                  <textarea className="form-textarea" required placeholder="Tell us how we can help..." rows="6" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : (
                    <>
                      Send Message <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div>
              <div style={{ width: '100%', height: 320, background: 'var(--color-border)', marginBottom: 'var(--space-6)', overflow: 'hidden' }}>
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248849.56659846953!2d77.46612665!3d12.9539974!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin" width="100%" height="320" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" title="MeetMe Center Location" />
              </div>
              <div style={{ background: 'var(--color-primary)', padding: 'var(--space-6)', color: 'white' }}>
                <h4 style={{ color: 'white', marginBottom: 'var(--space-3)' }}>Quick Support</h4>
                <p style={{ fontSize: 'var(--text-sm)', opacity: 0.8, marginBottom: 'var(--space-4)' }}>Need immediate help?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <Link href="/courses" style={{ color: 'white', fontSize: 'var(--text-sm)', opacity: 0.9 }}>→ Browse All Courses</Link>
                  <Link href="/lms" style={{ color: 'white', fontSize: 'var(--text-sm)', opacity: 0.9 }}>→ Student LMS Dashboard</Link>
                  <Link href="/about" style={{ color: 'white', fontSize: 'var(--text-sm)', opacity: 0.9 }}>→ About MeetMe Center</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
