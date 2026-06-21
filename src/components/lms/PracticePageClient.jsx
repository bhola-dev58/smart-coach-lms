'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Static Practice Questions ──
const QUESTION_BANK = {
  MATHS: [
    { id: 'm1', q: 'What is the value of √169?', options: ['11', '12', '13', '14'], ans: 2 },
    { id: 'm2', q: 'If x² – 5x + 6 = 0, what are the values of x?', options: ['2 and 3', '1 and 6', '–2 and –3', '3 and 4'], ans: 0 },
    { id: 'm3', q: 'The HCF of 36 and 48 is:', options: ['6', '8', '12', '16'], ans: 2 },
    { id: 'm4', q: 'A train travels 360 km in 4 hours. What is its speed in m/s?', options: ['20 m/s', '25 m/s', '30 m/s', '35 m/s'], ans: 1 },
    { id: 'm5', q: 'What is 15% of 840?', options: ['116', '126', '136', '146'], ans: 1 },
    { id: 'm6', q: 'The sum of angles of a triangle is:', options: ['90°', '180°', '270°', '360°'], ans: 1 },
    { id: 'm7', q: 'log₁₀(1000) = ?', options: ['2', '3', '4', '10'], ans: 1 },
    { id: 'm8', q: 'The area of a circle with radius 7 cm is (π = 22/7):', options: ['144 cm²', '154 cm²', '164 cm²', '176 cm²'], ans: 1 },
    { id: 'm9', q: 'What is the value of sin 90°?', options: ['0', '0.5', '1', '√2'], ans: 2 },
    { id: 'm10', q: 'A number when divided by 56 gives remainder 29. What will be the remainder when divided by 8?', options: ['3', '5', '6', '7'], ans: 1 },
  ],
  SCIENCE: [
    { id: 's1', q: 'What is the chemical formula of water?', options: ['H₂O₂', 'HO₂', 'H₂O', 'H₃O'], ans: 2 },
    { id: 's2', q: 'Which gas is used in photosynthesis?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], ans: 2 },
    { id: 's3', q: 'The SI unit of force is:', options: ['Joule', 'Watt', 'Newton', 'Pascal'], ans: 2 },
    { id: 's4', q: 'Who proposed the theory of evolution?', options: ['Newton', 'Einstein', 'Darwin', 'Faraday'], ans: 2 },
    { id: 's5', q: 'The atomic number of Carbon is:', options: ['4', '6', '8', '12'], ans: 1 },
    { id: 's6', q: 'Which planet is closest to the Sun?', options: ['Venus', 'Mercury', 'Mars', 'Earth'], ans: 1 },
    { id: 's7', q: 'Which acid is present in vinegar?', options: ['Lactic acid', 'Acetic acid', 'Citric acid', 'Tartaric acid'], ans: 1 },
    { id: 's8', q: 'The speed of light is approximately:', options: ['3 × 10⁶ m/s', '3 × 10⁸ m/s', '3 × 10¹⁰ m/s', '3 × 10⁴ m/s'], ans: 1 },
    { id: 's9', q: 'DNA stands for:', options: ['Deoxyribose Nucleic Acid', 'Di-nitrogen Acid', 'Double Nitro Acid', 'Deoxy Nitro Acid'], ans: 0 },
    { id: 's10', q: 'Which is the largest organ of the human body?', options: ['Heart', 'Liver', 'Skin', 'Brain'], ans: 2 },
  ],
  COMMERCE: [
    { id: 'c1', q: 'GST stands for:', options: ['General Sales Tax', 'Goods and Services Tax', 'Government Service Tax', 'Gross Sales Tax'], ans: 1 },
    { id: 'c2', q: 'Which financial statement shows profitability?', options: ['Balance Sheet', 'Cash Flow Statement', 'Profit & Loss Account', 'Trial Balance'], ans: 2 },
    { id: 'c3', q: 'SEBI regulates:', options: ['Banking sector', 'Insurance sector', 'Capital market', 'Mutual funds only'], ans: 2 },
    { id: 'c4', q: 'Double entry bookkeeping means:', options: ['Two entries for every transaction', 'Debit and Credit for each transaction', 'Two books are maintained', 'Two accountants verify'], ans: 1 },
    { id: 'c5', q: 'What is the full form of GDP?', options: ['Gross Domestic Product', 'General Domestic Product', 'Gross Development Product', 'Gross Debt Product'], ans: 0 },
    { id: 'c6', q: 'Which tax is levied on personal income?', options: ['Excise Duty', 'Income Tax', 'Customs Duty', 'Sales Tax'], ans: 1 },
    { id: 'c7', q: 'Current ratio measures:', options: ['Profitability', 'Liquidity', 'Solvency', 'Efficiency'], ans: 1 },
    { id: 'c8', q: 'Depreciation is charged on:', options: ['Current Assets', 'Fixed Assets', 'Intangible Assets', 'Both B and C'], ans: 3 },
    { id: 'c9', q: 'RBI was established in:', options: ['1930', '1935', '1947', '1950'], ans: 1 },
    { id: 'c10', q: 'Which account always has a credit balance?', options: ['Debtors account', 'Expense account', 'Capital account', 'Purchases account'], ans: 2 },
  ],
  ARTS: [
    { id: 'a1', q: 'Who wrote "Wings of Fire"?', options: ['Jawaharlal Nehru', 'A.P.J. Abdul Kalam', 'Mahatma Gandhi', 'Subhash Chandra Bose'], ans: 1 },
    { id: 'a2', q: 'The Harappan Civilization belongs to which age?', options: ['Iron Age', 'Stone Age', 'Bronze Age', 'Copper Age'], ans: 2 },
    { id: 'a3', q: 'Which is the national language of India?', options: ['English', 'Hindi', 'Sanskrit', 'No official national language'], ans: 3 },
    { id: 'a4', q: 'Who is the author of "Arthashastra"?', options: ['Chanakya', 'Ashoka', 'Chandra Gupta', 'Akbar'], ans: 0 },
    { id: 'a5', q: 'The Mughal Empire was founded by:', options: ['Akbar', 'Humayun', 'Babur', 'Aurangzeb'], ans: 2 },
    { id: 'a6', q: 'Which fundamental right guarantees freedom of speech?', options: ['Article 14', 'Article 19', 'Article 21', 'Article 25'], ans: 1 },
    { id: 'a7', q: 'The 73rd Constitutional Amendment is related to:', options: ['Panchayati Raj', 'Urban local bodies', 'Fundamental Rights', 'DPSP'], ans: 0 },
    { id: 'a8', q: 'Which river is known as the "Sorrow of Bihar"?', options: ['Ganga', 'Son', 'Gandak', 'Kosi'], ans: 3 },
    { id: 'a9', q: 'Who is the "Father of Indian Constitution"?', options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'B.R. Ambedkar', 'Rajendra Prasad'], ans: 2 },
    { id: 'a10', q: 'Sitar is which type of instrument?', options: ['Percussion', 'String', 'Wind', 'Brass'], ans: 1 },
  ],
  GENERAL: [
    { id: 'g1', q: 'Who is the current Chief Justice of India (2025)?', options: ['D.Y. Chandrachud', 'Sanjiv Khanna', 'N.V. Ramana', 'S.A. Bobde'], ans: 1 },
    { id: 'g2', q: 'Which country won the FIFA World Cup 2022?', options: ['France', 'Brazil', 'Germany', 'Argentina'], ans: 3 },
    { id: 'g3', q: 'What is the capital of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], ans: 2 },
    { id: 'g4', q: 'Which is the smallest planet in our Solar System?', options: ['Mercury', 'Mars', 'Venus', 'Pluto'], ans: 0 },
    { id: 'g5', q: 'When is "World Environment Day" observed?', options: ['April 22', 'June 5', 'March 22', 'September 16'], ans: 1 },
    { id: 'g6', q: 'Which is the longest river in the world?', options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], ans: 1 },
    { id: 'g7', q: '"Operation Sindoor" was carried out by India in:', options: ['2023', '2024', '2025', '2026'], ans: 2 },
    { id: 'g8', q: 'Which organisation publishes Human Development Index?', options: ['World Bank', 'IMF', 'UNDP', 'WHO'], ans: 2 },
    { id: 'g9', q: 'Who invented the World Wide Web?', options: ['Bill Gates', 'Steve Jobs', 'Tim Berners-Lee', 'Mark Zuckerberg'], ans: 2 },
    { id: 'g10', q: 'Which is the national flower of India?', options: ['Rose', 'Jasmine', 'Sunflower', 'Lotus'], ans: 3 },
  ],
};

const SUBJECTS = [
  { key: 'MATHS', label: 'Mathematics', icon: '📐', color: '#1B2B6B' },
  { key: 'SCIENCE', label: 'Science', icon: '🔬', color: '#27AE60' },
  { key: 'COMMERCE', label: 'Commerce', icon: '📊', color: '#F5A623' },
  { key: 'ARTS', label: 'Arts & Humanities', icon: '🎨', color: '#E74C3C' },
  { key: 'GENERAL', label: 'General Knowledge', icon: '🌐', color: '#8E44AD' },
];

const QUESTION_TIME = 30; // seconds per question

// ── Results Screen ──
function ResultScreen({ score, total, timeTaken, subject, onRestart, onChangeSubject }) {
  const percentage = Math.round((score / total) * 100);
  const sub = SUBJECTS.find(s => s.key === subject);
  let grade = 'D';
  let gradeColor = '#E74C3C';
  let msg = 'Keep practising! Review the concepts and try again.';
  if (percentage >= 90) { grade = 'A+'; gradeColor = '#27AE60'; msg = 'Outstanding! You have mastered this topic! 🌟'; }
  else if (percentage >= 75) { grade = 'A'; gradeColor = '#27AE60'; msg = 'Excellent work! You have a strong grasp of the subject. 🎉'; }
  else if (percentage >= 60) { grade = 'B'; gradeColor = '#F5A623'; msg = 'Good job! A little more revision and you\'ll ace it.'; }
  else if (percentage >= 40) { grade = 'C'; gradeColor = '#E67E22'; msg = 'Fair attempt. Focus on the topics you found difficult.'; }

  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
      {/* Score circle */}
      <div style={{
        width: 140, height: 140, borderRadius: '50%', margin: '0 auto 1.5rem',
        background: `conic-gradient(${sub.color} ${percentage * 3.6}deg, var(--dash-border, #e2e6ef) 0deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        <div style={{
          width: 110, height: 110, borderRadius: '50%', background: 'var(--dash-surface)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: sub.color }}>{grade}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--dash-text-muted)' }}>{percentage}%</span>
        </div>
      </div>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--dash-text)', marginBottom: '0.5rem' }}>
        {sub.icon} {sub.label} Practice
      </h2>
      <p style={{ color: sub.color, fontWeight: 600, marginBottom: '1.5rem' }}>{msg}</p>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem',
        background: 'var(--dash-surface)', border: '1px solid var(--dash-border)',
        borderRadius: 12, padding: '1.25rem',
      }}>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#27AE60' }}>{score}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted)' }}>Correct</div>
        </div>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#E74C3C' }}>{total - score}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted)' }}>Wrong / Skipped</div>
        </div>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dash-text)' }}>
            {mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted)' }}>Time Taken</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={onRestart}
          style={{
            padding: '0.7rem 1.5rem', background: sub.color, color: 'white',
            border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
          }}
        >
          🔄 Practice Again
        </button>
        <button
          onClick={onChangeSubject}
          style={{
            padding: '0.7rem 1.5rem', background: 'transparent', color: sub.color,
            border: `1px solid ${sub.color}`, borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
          }}
        >
          Change Subject
        </button>
      </div>
    </div>
  );
}

// ── Main Practice Page ──
export default function PracticePageClient() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]); // 0-based index of chosen option, or -1 for skipped
  const [timer, setTimer] = useState(QUESTION_TIME);
  const [gameState, setGameState] = useState('subject-select'); // 'subject-select' | 'playing' | 'results'
  const [sessionTime, setSessionTime] = useState(0); // total seconds elapsed

  // Start a practice session
  const startPractice = useCallback((subjectKey) => {
    const qs = [...QUESTION_BANK[subjectKey]].sort(() => Math.random() - 0.5).slice(0, 10);
    setSelectedSubject(subjectKey);
    setQuestions(qs);
    setCurrentIdx(0);
    setSelectedOption(null);
    setAnswers([]);
    setTimer(QUESTION_TIME);
    setSessionTime(0);
    setGameState('playing');
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timer === 0) {
      // Auto-skip on timeout
      handleNext(true);
      return;
    }
    const t = setTimeout(() => {
      setTimer(prev => prev - 1);
      setSessionTime(prev => prev + 1);
    }, 1000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, gameState]);

  const handleNext = useCallback((timedOut = false) => {
    const chosen = timedOut ? -1 : selectedOption;
    const newAnswers = [...answers, chosen];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentIdx + 1 >= questions.length) {
      setGameState('results');
    } else {
      setCurrentIdx(prev => prev + 1);
      setTimer(QUESTION_TIME);
    }
  }, [answers, currentIdx, questions.length, selectedOption]);

  // Calculate score
  const score = answers.reduce((acc, chosen, i) => {
    if (chosen === -1) return acc;
    return chosen === questions[i]?.ans ? acc + 1 : acc;
  }, 0);

  const sub = selectedSubject ? SUBJECTS.find(s => s.key === selectedSubject) : null;
  const q = questions[currentIdx];

  // ── Subject Select Screen ──
  if (gameState === 'subject-select') {
    return (
      <div style={{ padding: '1.5rem 2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--dash-text)', marginBottom: '0.5rem' }}>
            🎯 Choose a Subject to Practice
          </h2>
          <p style={{ color: 'var(--dash-text-secondary)', fontSize: '0.88rem' }}>
            10 questions per session · 30 seconds per question · Instant results
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {SUBJECTS.map(s => (
            <button
              key={s.key}
              onClick={() => startPractice(s.key)}
              style={{
                background: 'var(--dash-surface)', border: '2px solid var(--dash-border)',
                borderRadius: 12, padding: '1.5rem', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', gap: '0.75rem',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = s.color;
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${s.color}22`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--dash-border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '2rem' }}>{s.icon}</span>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--dash-text)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{s.label}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--dash-text-muted)' }}>{QUESTION_BANK[s.key].length} questions available</div>
              </div>
              <div style={{
                alignSelf: 'flex-start', padding: '0.25rem 0.75rem',
                background: `${s.color}15`, color: s.color,
                borderRadius: 50, fontSize: '0.72rem', fontWeight: 600,
              }}>
                Start →
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Results Screen ──
  if (gameState === 'results') {
    return (
      <div style={{ padding: '1.5rem 2rem' }}>
        <ResultScreen
          score={score}
          total={questions.length}
          timeTaken={sessionTime}
          subject={selectedSubject}
          onRestart={() => startPractice(selectedSubject)}
          onChangeSubject={() => setGameState('subject-select')}
        />
      </div>
    );
  }

  // ── Playing Screen ──
  const timerPercent = (timer / QUESTION_TIME) * 100;
  const timerColor = timer > 15 ? '#27AE60' : timer > 7 ? '#F5A623' : '#E74C3C';

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      {/* Top bar: subject, progress, score */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>{sub.icon}</span>
          <span style={{ fontWeight: 700, color: 'var(--dash-text)', fontSize: '0.95rem' }}>{sub.label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.82rem', color: 'var(--dash-text-secondary)' }}>
          <span>Q {currentIdx + 1} / {questions.length}</span>
          <span style={{ color: '#27AE60', fontWeight: 700 }}>✓ {score}</span>
          <span style={{ color: '#E74C3C', fontWeight: 700 }}>✗ {answers.filter((a, i) => a !== -1 && a !== questions[i]?.ans).length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--dash-border)', borderRadius: 4, marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 4,
          width: `${((currentIdx) / questions.length) * 100}%`,
          background: sub.color, transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Question card */}
      <div style={{
        background: 'var(--dash-surface)', border: '1px solid var(--dash-border)',
        borderRadius: 'var(--dash-radius)', padding: '2rem',
        boxShadow: 'var(--dash-shadow)', maxWidth: 720, marginBottom: '1rem',
      }}>
        {/* Timer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--dash-text-muted)', fontWeight: 600 }}>
            QUESTION {currentIdx + 1}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 80, height: 6, background: 'var(--dash-border)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${timerPercent}%`, background: timerColor, transition: 'width 1s linear, background 0.3s' }} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: timerColor, minWidth: 24 }}>{timer}s</span>
          </div>
        </div>

        {/* Question text */}
        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--dash-text)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          {q?.q}
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {q?.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedOption(idx)}
                style={{
                  padding: '0.85rem 1.25rem',
                  border: isSelected ? `2px solid ${sub.color}` : '1px solid var(--dash-border)',
                  borderRadius: 10, background: isSelected ? `${sub.color}10` : 'var(--dash-bg, #F4F6F8)',
                  color: isSelected ? sub.color : 'var(--dash-text)',
                  textAlign: 'left', cursor: 'pointer', fontWeight: isSelected ? 700 : 400,
                  fontSize: '0.9rem', transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}
              >
                <span style={{
                  width: 28, height: 28, flexShrink: 0, borderRadius: '50%',
                  border: isSelected ? `2px solid ${sub.color}` : '1px solid var(--dash-border)',
                  background: isSelected ? sub.color : 'transparent',
                  color: isSelected ? 'white' : 'var(--dash-text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.78rem', fontWeight: 700,
                }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', maxWidth: 720 }}>
        <button
          onClick={() => handleNext(false)}
          disabled={selectedOption === null}
          style={{
            flex: 1, padding: '0.75rem',
            background: selectedOption !== null ? sub.color : 'var(--dash-border)',
            color: selectedOption !== null ? 'white' : 'var(--dash-text-muted)',
            border: 'none', borderRadius: 8, fontWeight: 700, cursor: selectedOption !== null ? 'pointer' : 'not-allowed',
            fontSize: '0.9rem', transition: 'all 0.2s',
          }}
        >
          {currentIdx + 1 >= questions.length ? '✅ Submit' : 'Next Question →'}
        </button>
        <button
          onClick={() => handleNext(true)}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent', color: 'var(--dash-text-muted)',
            border: '1px solid var(--dash-border)', borderRadius: 8, cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: 500,
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
