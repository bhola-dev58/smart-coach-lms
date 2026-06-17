import styles from './HowItWorks.module.css';

const steps = [
  { num: '01', title: 'Choose Your Course', desc: 'Browse 50+ courses tailored for Class 8, 9, 10, 11, and 12 in Science, Math, and English.' },
  { num: '02', title: 'Enroll & Pay', desc: 'Secure your seat with our affordable pricing. UPI, cards, and EMI options available.' },
  { num: '03', title: 'Learn & Practice', desc: 'Access HD video lectures, take notes, solve assignments, and track your progress on the LMS.' },
  { num: '04', title: 'Excel in Exams', desc: 'Receive guidance, regular tests, and target 95%+ in board exams and top ranks in JEE/NEET.' },
];

export default function HowItWorks() {
  return (
    <section className="section section-white">
      <div className="container">
        <div className="section-header">
          <span className="section-label">How It Works</span>
          <h2>Your Journey to Success</h2>
          <div className="section-divider" />
        </div>
        <div className={styles.stepsGrid}>
          {steps.map((s, i) => (
            <div className={styles.step} key={i}>
              <div className={styles.stepNum}>{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < steps.length - 1 && <div className={styles.connector} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
