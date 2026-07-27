'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './contact.module.css';

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
    <div className={styles.pageWrapper}>
      {/* Page Banner */}
      <div className="page-banner">
        <div className="container">
          <h1>Contact Us</h1>
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span className="separator">/</span>
            <span className="current">Contact</span>
          </nav>
        </div>
      </div>

      {/* Info Cards */}
      <section className="section section-light" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-8)' }}>
        <div className="container">
          <div className={styles.infoGrid}>
            {[
              {
                themeClass: styles.cardLocation,
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                ),
                title: 'Visit Us',
                text: '10th Cross, Varthur,\nDevasthanagalu, Bengaluru\nKarnataka 560087',
                isLink: false
              },
              {
                themeClass: styles.cardPhone,
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                ),
                title: 'Call Us',
                text: '+91-8874270707',
                isLink: true,
                href: 'tel:+918874270707'
              },
              {
                themeClass: styles.cardEmail,
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                ),
                title: 'Email Us',
                text: 'contact@gradify.academy',
                isLink: true,
                href: 'mailto:contact@gradify.academy'
              },
              {
                themeClass: styles.cardHours,
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                ),
                title: 'Working Hours',
                text: 'Mon – Fri: 8AM – 8PM\nSat: 9AM – 6PM',
                isLink: false
              },
            ].map((card, i) => (
              <div key={i} className={`${styles.infoCard} ${card.themeClass}`}>
                <div className={styles.iconWrapper}>
                  {card.icon}
                </div>
                <h4 className={styles.cardTitle}>{card.title}</h4>
                {card.isLink ? (
                  <a href={card.href} className={styles.cardTextLink}>
                    {card.text}
                  </a>
                ) : (
                  <p className={styles.cardText}>{card.text}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Redesigned Premium SaaS Level Contact Section */}
      <section className={styles.contactSection}>
        {/* Subtle Background Ambient Glows & Grid Pattern */}
        <div className={styles.bgBlobLeft} aria-hidden="true" />
        <div className={styles.bgBlobRight} aria-hidden="true" />
        <div className={styles.bgGridPattern} aria-hidden="true" />

        <div className={styles.mainContainer}>
          <div className={styles.contactGrid}>
            
            {/* LEFT COLUMN: 65% Premium Contact Form Card */}
            <div className={styles.formCard}>
              {/* Header */}
              <div className={styles.formHeader}>
                <div className={styles.headerIconBadge}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className={styles.formTitle}>Send Us a Message</h2>
                  <p className={styles.formSubtitle}>
                    Have a question? We&apos;ll respond <span className={styles.responseHighlight}>within 4 hours</span>.
                  </p>
                </div>
              </div>

              <div className={styles.accentLine} />

              {/* Success Notification */}
              {submitted && (
                <div className={styles.alertSuccess} role="status" aria-live="polite">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Message sent successfully! We&apos;ll get back to you soon.</span>
                </div>
              )}

              {/* Error Notification */}
              {error && (
                <div className={styles.alertError} role="status" aria-live="polite">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className={styles.contactForm}>
                <div className={styles.formRow}>
                  {/* Full Name */}
                  <div className={styles.fieldGroup}>
                    <label htmlFor="contact-name" className={styles.fieldLabel}>
                      Full Name <span className={styles.requiredAsterisk}>*</span>
                    </label>
                    <div className={styles.inputWrapper}>
                      <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        id="contact-name"
                        type="text"
                        className={styles.formInput}
                        required
                        placeholder="Your name"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className={styles.fieldGroup}>
                    <label htmlFor="contact-email" className={styles.fieldLabel}>
                      Email Address <span className={styles.requiredAsterisk}>*</span>
                    </label>
                    <div className={styles.inputWrapper}>
                      <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <input
                        id="contact-email"
                        type="email"
                        className={styles.formInput}
                        required
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formRow}>
                  {/* Phone Number */}
                  <div className={styles.fieldGroup}>
                    <label htmlFor="contact-phone" className={styles.fieldLabel}>
                      Phone Number
                    </label>
                    <div className={styles.inputWrapper}>
                      <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <input
                        id="contact-phone"
                        type="tel"
                        className={styles.formInput}
                        placeholder="Your Phone Number"
                        value={formData.phone}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setFormData({ ...formData, phone: val });
                        }}
                        maxLength={10}
                      />
                    </div>
                  </div>

                  {/* Subject Dropdown */}
                  <div className={styles.fieldGroup}>
                    <label htmlFor="contact-subject" className={styles.fieldLabel}>
                      Subject <span className={styles.requiredAsterisk}>*</span>
                    </label>
                    <div className={styles.inputWrapper}>
                      <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                      </svg>
                      <select
                        id="contact-subject"
                        className={styles.formSelect}
                        required
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      >
                        <option value="" disabled>Choose a topic</option>
                        <option>Course Inquiry</option>
                        <option>Payment Issue</option>
                        <option>Technical Support</option>
                        <option>Placement Assistance</option>
                        <option>Other</option>
                      </select>
                      <svg className={styles.selectChevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Message Textarea */}
                <div className={styles.fieldGroupFull}>
                  <label htmlFor="contact-message" className={styles.fieldLabel}>
                    Your Message <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <div className={styles.inputWrapperTextarea}>
                    <svg className={styles.inputIconTextarea} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <textarea
                      id="contact-message"
                      className={styles.formTextarea}
                      required
                      placeholder="Tell us how we can help..."
                      rows={6}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className={styles.spinner} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>

                {/* Trust & Privacy Area */}
                <div className={styles.trustArea}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                  <p className={styles.trustText}>
                    We value your privacy. Your information is secure and encrypted.
                  </p>
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN: 35% Sticky Information Panel */}
            <div className={styles.rightStickyColumn}>
              
              {/* Interactive Google Map Card */}
              <div className={styles.mapCard}>
                <div className={styles.mapHeaderOverlay}>
                  <div className={styles.mapLocationInfo}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <div>
                      <h4 className={styles.mapLocationTitle}>Gradify Academy Campus</h4>
                      <p className={styles.mapLocationSub}>Varthur, Bengaluru</p>
                    </div>
                  </div>
                  <a
                    href="https://maps.google.com/?q=Bengaluru,Karnataka"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapOpenBtn}
                  >
                    Open Maps ↗
                  </a>
                </div>
                <div className={styles.mapIframeWrapper}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248849.56659846953!2d77.46612665!3d12.9539974!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0, display: 'block' }}
                    allowFullScreen
                    loading="lazy"
                    title="Gradify Academy Location"
                  />
                </div>
              </div>

              {/* Dark Navy Quick Support Card */}
              <div className={styles.quickSupportCard}>
                <div className={styles.quickSupportHeader}>
                  <div className={styles.quickSupportTitleRow}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    <h4 className={styles.quickSupportTitle}>Quick Support</h4>
                  </div>
                  <p className={styles.quickSupportSubtitle}>Need immediate help?</p>
                </div>

                <div className={styles.supportLinksList}>
                  {/* Link 1: Browse Courses */}
                  <Link href="/courses" className={styles.supportLinkItem}>
                    <div className={styles.supportLinkIconBadge}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    </div>
                    <div className={styles.supportLinkContent}>
                      <span className={styles.supportLinkTitle}>Browse All Courses</span>
                      <span className={styles.supportLinkDesc}>Explore top coaching programs</span>
                    </div>
                    <svg className={styles.supportLinkArrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>

                  {/* Link 2: Student LMS */}
                  <Link href="/lms" className={styles.supportLinkItem}>
                    <div className={styles.supportLinkIconBadge}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                      </svg>
                    </div>
                    <div className={styles.supportLinkContent}>
                      <span className={styles.supportLinkTitle}>Student LMS Dashboard</span>
                      <span className={styles.supportLinkDesc}>Access lectures & assignments</span>
                    </div>
                    <svg className={styles.supportLinkArrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>

                  {/* Link 3: About Gradify */}
                  <Link href="/about" className={styles.supportLinkItem}>
                    <div className={styles.supportLinkIconBadge}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                        <path d="M9 22v-4h6v4" />
                        <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
                      </svg>
                    </div>
                    <div className={styles.supportLinkContent}>
                      <span className={styles.supportLinkTitle}>About Gradify Academy</span>
                      <span className={styles.supportLinkDesc}>Faculty details & institute vision</span>
                    </div>
                    <svg className={styles.supportLinkArrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>

                {/* Response Speed Badge */}
                <div className={styles.responseBadge}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>Average Response: <strong>Under 4 Hours</strong></span>
                </div>
              </div>

              {/* Extra Information Mini Cards (3 Cards) */}
              <div className={styles.miniCardsContainer}>
                {/* Mini Card 1: Call Us */}
                <a href="tel:+918874270707" className={styles.miniCard}>
                  <div className={styles.miniCardIconBadge} style={{ background: 'rgba(37,99,235,0.1)', color: '#2563eb' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <span className={styles.miniCardLabel}>Call Us</span>
                    <span className={styles.miniCardValue}>+91 88742 70707</span>
                  </div>
                </a>

                {/* Mini Card 2: Email */}
                <a href="mailto:contact@gradify.academy" className={styles.miniCard}>
                  <div className={styles.miniCardIconBadge} style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <span className={styles.miniCardLabel}>Email</span>
                    <span className={styles.miniCardValue}>support@gradify.academy</span>
                  </div>
                </a>

                {/* Mini Card 3: Working Hours */}
                <div className={styles.miniCardStatic}>
                  <div className={styles.miniCardIconBadge} style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <span className={styles.miniCardLabel}>Working Hours</span>
                    <span className={styles.miniCardValue}>Mon–Sat: 9:00 AM – 6:00 PM</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

