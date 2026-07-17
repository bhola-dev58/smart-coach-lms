'use client';

import React, { useState, useEffect } from 'react';
import styles from './ScholarshipCalculator.module.css';

export default function ScholarshipCalculator() {
  const [studentClass, setStudentClass] = useState('10');
  const [board, setBoard] = useState('CBSE');
  const [score, setScore] = useState(85);
  const [goal, setGoal] = useState('Boards');
  const [scholarship, setScholarship] = useState(10);
  const [basePrice, setBasePrice] = useState(2500);
  const [finalPrice, setFinalPrice] = useState(2250);
  const [emi, setEmi] = useState(750);

  // Re-calculate pricing and scholarship when inputs change
  useEffect(() => {
    // 1. Determine scholarship percentage based on score
    let pct = 0;
    if (score >= 95) pct = 30;
    else if (score >= 90) pct = 20;
    else if (score >= 80) pct = 15;
    else if (score >= 70) pct = 10;
    else pct = 5; // minimum early bird discount

    setScholarship(pct);

    // 2. Base price based on class and goal
    let price = 2000;
    if (studentClass === '11' || studentClass === '12') {
      price = goal === 'JEE/NEET' ? 4500 : 3500;
    } else {
      price = goal === 'JEE/NEET' ? 3000 : 2500;
    }

    setBasePrice(price);

    // 3. Final discounted price
    const discounted = Math.round(price * (1 - pct / 100));
    setFinalPrice(discounted);

    // 4. EMI (divided by 3 months)
    setEmi(Math.round(discounted / 3));
  }, [studentClass, score, goal]);

  return (
    <section className={`section ${styles.calcSection}`}>
      <div className="container">
        <div className="section-header">
          <span className="section-label">Interactive Tool</span>
          <h2>Tuition Fee &amp; Scholarship Predictor</h2>
          <div className="section-divider" />
          <p>Find the best batch for your target goal and calculate your scholarship discount instantly.</p>
        </div>

        <div className={styles.gridContainer}>
          {/* Left Side: Interactive Controls */}
          <div className={`${styles.controlCard} animate-fade-in-up`}>
            <h3 className={styles.cardSubtitle}>Enter Student Details</h3>
            
            {/* Student Class */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Target Class</label>
              <div className={styles.tabGroup}>
                {['8', '9', '10', '11', '12'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`${styles.tabBtn} ${studentClass === c ? styles.tabBtnActive : ''}`}
                    onClick={() => setStudentClass(c)}
                  >
                    Class {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Board Selection */}
            <div className={styles.formGroup}>
              <label className={styles.label}>School Board</label>
              <select 
                className={styles.selectInput}
                value={board}
                onChange={(e) => setBoard(e.target.value)}
              >
                <option value="CBSE">CBSE Board</option>
                <option value="ICSE">ICSE / ISC Board</option>
                <option value="State">State Board</option>
              </select>
            </div>

            {/* Target Goal */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Focus / Goal</label>
              <div className={styles.tabGroup}>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${goal === 'Boards' ? styles.tabBtnActive : ''}`}
                  onClick={() => setGoal('Boards')}
                >
                  School Boards Only
                </button>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${goal === 'JEE/NEET' ? styles.tabBtnActive : ''}`}
                  onClick={() => setGoal('JEE/NEET')}
                >
                  Boards + JEE / NEET Prep
                </button>
              </div>
            </div>

            {/* Score Slider */}
            <div className={styles.formGroup}>
              <div className={styles.sliderHeader}>
                <label className={styles.label}>Previous Class Score</label>
                <span className={styles.scoreVal}>{score}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.sliderTicks}>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Right Side: Calculation & Recommendation */}
          <div className={`${styles.resultCard} animate-fade-in-up delay-200`}>
            <div className={styles.scholarshipBadge}>
              <span className={styles.badgeLabel}>PREDICTED SCHOLARSHIP</span>
              <div className={styles.badgeValue}>{scholarship}% OFF</div>
            </div>

            <div className={styles.recommendationBox}>
              <h4>Recommended Program:</h4>
              <p className={styles.progName}>
                {studentClass <= 10 
                  ? `Class ${studentClass} ${board} Math & Science Masterclass`
                  : `Class ${studentClass} ${board} ${goal === 'JEE/NEET' ? 'JEE/NEET Elite Foundation' : 'Board Success Course'}`
                }
              </p>
              <p className={styles.progDetail}>
                Includes daily live classes, formula sheets, weekly mock exams, and IITian mentorship.
              </p>
            </div>

            <div className={styles.priceBreakdown}>
              <div className={styles.priceRow}>
                <span>Regular Fee (Monthly)</span>
                <span className={styles.strikePrice}>₹{basePrice}</span>
              </div>
              <div className={styles.priceRow}>
                <span>Scholarship Discount</span>
                <span className={styles.greenText}>- ₹{basePrice - finalPrice}</span>
              </div>
              <div className={styles.finalPriceRow}>
                <span>Your Net Monthly Fee</span>
                <span className={styles.finalPrice}>₹{finalPrice}</span>
              </div>
            </div>

            <div className={styles.emiBox}>
              <svg className={styles.emiIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              <div>
                <h5>No-Cost EMI Options</h5>
                <p>Pay only <strong>₹{emi}/month</strong> with 3 interest-free installments.</p>
              </div>
            </div>

            <a href="/contact" className={styles.enrollBtn}>
              Claim Scholarship Now
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            
            <p className={styles.termsText}>*Scholarship confirmation requires submission of class marksheets during admissions.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
