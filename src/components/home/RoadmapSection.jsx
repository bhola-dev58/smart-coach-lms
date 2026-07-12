'use client';

import React from 'react';
import styles from './RoadmapSection.module.css';

/**
 * Winding Road SVG path with shorter wavelength and amplitude:
 * Path: M 80 150 Q 180 0, 280 150 Q 380 300, 480 150 Q 580 0, 680 150 Q 780 300, 880 150
 *
 * Mathematically derived 1:1 screen coordinates (for 960px width × 300px height track):
 *
 * Peaks (bead size 60x60, so center - 30px offset):
 * 1. Choose Your Course (Top Peak 1)  → X=180, Y=75  → left: 150, top: 45
 * 2. Enroll & Pay (Bottom Peak 1)     → X=380, Y=225  → left: 350, top: 195
 * 3. Learn & Practice (Top Peak 2)    → X=580, Y=75  → left: 550, top: 45
 * 4. Excel in Exams (Bottom Peak 2)   → X=780, Y=225 → left: 750, top: 195
 */

const SVGPATH = "M 80 150 Q 180 0, 280 150 Q 380 300, 480 150 Q 580 0, 680 150 Q 780 300, 880 150";

const steps = [
  {
    num: '01',
    title: 'Choose Your Course',
    desc: 'Browse 50+ courses tailored for Class 8, 9, 10, 11, and 12 in Science, Math, and English.',
    left: 150,
    top: 45,
    isUp: true,
    icon: (
      <svg className={styles.icon} viewBox="0 0 24 24">
        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
        <path d="M5 13.18v4L12 21l7-3.82v-4L12 17L5 13.18z" />
      </svg>
    )
  },
  {
    num: '02',
    title: 'Enroll & Pay',
    desc: 'Secure your seat with our affordable pricing. UPI, cards, and EMI options available.',
    left: 350,
    top: 195,
    isUp: false,
    icon: (
      <svg className={styles.icon} viewBox="0 0 24 24">
        <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
      </svg>
    )
  },
  {
    num: '03',
    title: 'Learn & Practice',
    desc: 'Access HD video lectures, take notes, solve assignments, and track your progress on the LMS.',
    left: 550,
    top: 45,
    isUp: true,
    icon: (
      <svg className={styles.icon} viewBox="0 0 24 24">
        <path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" />
      </svg>
    )
  },
  {
    num: '04',
    title: 'Excel in Exams',
    desc: 'Receive guidance, regular tests, and target 95%+ in board exams and top ranks in JEE/NEET.',
    left: 750,
    top: 195,
    isUp: false,
    isSuccess: true,
    icon: (
      <svg className={`${styles.icon} ${styles.iconGreen}`} viewBox="0 0 24 24">
        <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v3c0 2.44 1.72 4.48 4 4.88V18H5v2h14v-2h-2v-3.12c2.28-.4 4-2.44 4-4.88V7c0-1.1-.9-2-2-2zM5 10V7h2v3H5zm14 0h-2V7h2v3z" />
      </svg>
    )
  }
];

export default function RoadmapSection() {
  return (
    <section className={`section ${styles.roadmapSection}`}>
      {/* Header – stays inside 1200px container */}
      <div className="container">
        <div className="section-header">
          <span className="section-label">Success Path</span>
          <h2>Your Journey to Academic Excellence</h2>
          <div className="section-divider" />
          <p>How Gradify Academy guides you step-by-step to master concepts, score 95%+ in board exams, and crack JEE / NEET.</p>
        </div>
      </div>

      {/* Track Container */}
      <div className={styles.scrollWrapper}>
        <div className={styles.roadmapTrack}>

          {/* ── Winding Road SVG ── */}
          <svg className={styles.roadSvg} viewBox="0 0 960 300" preserveAspectRatio="none">
            <path d={SVGPATH} stroke="var(--color-primary,#1B2B6B)" strokeWidth="18" fill="none" className={styles.pathBase} />
            <path d={SVGPATH} stroke="#ffffff" strokeWidth="5" fill="none" strokeDasharray="14 14" className={styles.pathDashes} />
          </svg>

          {/* ── Steps ── */}
          {steps.map((step) => (
            <div 
              className={styles.node} 
              style={{ left: step.left, top: step.top }} 
              key={step.num}
            >
              {/* Connector line */}
              <div className={`
                ${styles.conn} 
                ${step.isUp ? styles.connUp : styles.connDown}
                ${step.isSuccess ? styles.connDownGreen : ''}
              `} />

              {/* Bead */}
              <div className={`
                ${styles.bead} 
                ${step.isSuccess ? styles.beadGreen : ''}
              `}>
                {step.icon}
              </div>

              {/* Card Container */}
              <div className={`
                ${styles.card} 
                ${step.isUp ? styles.cardAbove : styles.cardBelow}
                ${step.isSuccess ? styles.cardGreen : ''}
              `}>
                <div className={styles.cardHeader}>
                  <span className={`
                    ${styles.stepNum} 
                    ${step.isSuccess ? styles.stepNumGreen : ''}
                  `}>
                    {step.num}
                  </span>
                  <h3 className={styles.cardTitle}>{step.title}</h3>
                </div>
                <p className={styles.cardDesc}>{step.desc}</p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
