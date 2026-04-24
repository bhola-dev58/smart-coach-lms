import Link from 'next/link';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroOverlay} />
      <div className={`container ${styles.heroContent}`}>
        <h1>Master Your <span className={styles.highlight}>Engineering</span> Career With Expert Coaching</h1>
        <p className={styles.subtitle}>
          Join India&apos;s fastest-growing B.Tech coaching platform. Expert faculty from IITs & NITs,
          industry-relevant curriculum, and guaranteed placement assistance.
        </p>
        <div className={styles.heroActions}>
          <Link href="/courses" className="btn btn-primary btn-lg">
            Explore Courses
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </Link>
          <Link href="/about" className="btn btn-outline-white btn-lg">Learn More</Link>
        </div>
      </div>
    </section>

  );
}
