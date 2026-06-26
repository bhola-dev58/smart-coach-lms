'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import CategoryIcon from '@/components/courses/CategoryIcon';

const CLASSES = ['6', '7', '8', '9', '10', '11', '12', 'All'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const QUESTION_TIME = 30; // seconds per question

export default function PracticePageClient() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('GENERAL');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');

  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    let active = true;
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (active && data.success) {
          const mapped = data.categories.map(c => ({
            key: c.name,
            label: c.label,
            icon: c.icon,
            color: c.color
          }));
          setSubjects(mapped);
          if (mapped.length > 0) {
            const hasGeneral = mapped.some(m => m.key === 'GENERAL');
            setSelectedSubject(hasGeneral ? 'GENERAL' : mapped[0].key);
          }
        }
      })
      .catch(err => console.error('Failed to load categories', err));
    return () => { active = false; };
  }, []);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]); // chosen options or -1 for skipped
  const [timer, setTimer] = useState(QUESTION_TIME);
  const [gameState, setGameState] = useState('filters-select'); // 'filters-select' | 'playing' | 'results'
  const [sessionTime, setSessionTime] = useState(0); // total seconds elapsed

  // Security & Violations
  const [violations, setViolations] = useState(0);
  const [isFullscreenViolated, setIsFullscreenViolated] = useState(false);
  const [isTabViolated, setIsTabViolated] = useState(false);
  const [movements, setMovements] = useState([]);

  const isTabViolatedRef = useRef(isTabViolated);
  const isFullscreenViolatedRef = useRef(isFullscreenViolated);
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    isTabViolatedRef.current = isTabViolated;
  }, [isTabViolated]);

  useEffect(() => {
    isFullscreenViolatedRef.current = isFullscreenViolated;
  }, [isFullscreenViolated]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Append telemetry movement log
  const logMovement = useCallback((eventText) => {
    setMovements(prev => [...prev, { event: eventText, timestamp: new Date() }]);
  }, []);

  // Submit test to database
  const submitSession = useCallback(async (finalScore, finalAnswers) => {
    try {
      const payload = {
        subject: selectedSubject,
        class: selectedClass,
        difficulty: selectedDifficulty,
        score: finalScore,
        totalQuestions: questions.length,
        timeTakenSeconds: sessionTime,
        violationsCount: violations,
        movements: [...movements, { event: 'Practice Session Ended', timestamp: new Date() }]
      };

      await fetch('/api/lms/practice/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Failed to submit practice telemetry:', err);
    }
  }, [selectedSubject, selectedClass, selectedDifficulty, questions.length, sessionTime, violations, movements]);

  // Request Fullscreen
  const enterFullscreen = async () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) await docEl.requestFullscreen();
      else if (docEl.mozRequestFullScreen) await docEl.mozRequestFullScreen();
      else if (docEl.webkitRequestFullscreen) await docEl.webkitRequestFullscreen();
      else if (docEl.msRequestFullscreen) await docEl.msRequestFullscreen();
      return true;
    } catch (err) {
      console.error('Fullscreen request failed:', err);
      return false;
    }
  };

  // Exit Fullscreen
  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Failed to exit fullscreen:', err);
    }
  };

  // Start Practice
  const handleStartPractice = async () => {
    setLoadingQuestions(true);
    try {
      const res = await fetch(`/api/lms/practice/questions?subject=${selectedSubject}&class=${selectedClass}&difficulty=${selectedDifficulty}`);
      const data = await res.json();
      if (data.success && data.questions?.length > 0) {
        setQuestions(data.questions);

        // Attempt Fullscreen
        const success = await enterFullscreen();
        if (!success) {
          alert('Fullscreen permission is required to start practice mode!');
          setLoadingQuestions(false);
          return;
        }

        // Initialize state
        setCurrentIdx(0);
        setSelectedOption(null);
        setAnswers([]);
        setTimer(QUESTION_TIME);
        setSessionTime(0);
        setViolations(0);
        setIsFullscreenViolated(false);
        setIsTabViolated(false);
        
        const initialLogs = [
          { event: `Practice Session Started (Subject: ${selectedSubject}, Class: ${selectedClass}, Difficulty: ${selectedDifficulty})`, timestamp: new Date() }
        ];
        setMovements(initialLogs);
        setGameState('playing');
      } else {
        alert('Could not load practice questions. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Right-click blocking
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleContextMenu = (e) => {
      e.preventDefault();
      logMovement('Right-click attempt blocked');
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [gameState, logMovement]);

  // Fullscreen change listener
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleFullscreenChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );

      if (!isFs && gameStateRef.current === 'playing') {
        setIsFullscreenViolated(true);
        setViolations(prev => {
          const nextVal = prev + 1;
          logMovement(`Fullscreen exited (Violation Count: ${nextVal})`);
          return nextVal;
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [gameState, logMovement]);

  // Tab switch / Visibility listener
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && gameStateRef.current === 'playing') {
        triggerTabViolation();
      }
    };

    const handleBlur = () => {
      if (gameStateRef.current === 'playing') {
        triggerTabViolation();
      }
    };

    const triggerTabViolation = () => {
      if (isTabViolatedRef.current) return; // avoid duplicate dialog triggers
      setIsTabViolated(true);
      setViolations(prev => {
        const nextVal = prev + 1;
        logMovement(`Tab switched or window lost focus (Violation Count: ${nextVal})`);
        return nextVal;
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameState, logMovement]);

  // Timer Tick
  useEffect(() => {
    if (gameState !== 'playing' || isFullscreenViolated || isTabViolated) return;

    if (timer === 0) {
      logMovement(`Question ${currentIdx + 1} timed out`);
      handleNext(true);
      return;
    }

    const t = setTimeout(() => {
      setTimer(prev => prev - 1);
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearTimeout(t);
  }, [timer, gameState, isFullscreenViolated, isTabViolated, currentIdx, logMovement]);

  // Next Question
  const handleNext = useCallback((timedOut = false) => {
    const chosen = timedOut ? -1 : selectedOption;
    const newAnswers = [...answers, chosen];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (chosen === -1) {
      logMovement(`Skipped question ${currentIdx + 1}`);
    } else {
      logMovement(`Selected option ${String.fromCharCode(65 + chosen)} for question ${currentIdx + 1}`);
    }

    if (currentIdx + 1 >= questions.length) {
      // Calculate final score
      const finalScore = newAnswers.reduce((acc, ansVal, i) => {
        if (ansVal === -1) return acc;
        return ansVal === questions[i]?.ans ? acc + 1 : acc;
      }, 0);

      submitSession(finalScore, newAnswers);
      logMovement(`Completed test successfully. Score: ${finalScore}/${questions.length}`);
      exitFullscreen();
      setGameState('results');
    } else {
      setCurrentIdx(prev => prev + 1);
      setTimer(QUESTION_TIME);
    }
  }, [answers, currentIdx, questions, selectedOption, logMovement, submitSession]);

  // Re-enter Fullscreen and Resume
  const resumeFullscreen = async () => {
    const success = await enterFullscreen();
    if (success) {
      setIsFullscreenViolated(false);
      logMovement('Returned to fullscreen, resumed test');
    } else {
      alert('Could not return to fullscreen. Please grant permission.');
    }
  };

  // Resume after tab violation warning
  const resumeTab = () => {
    if (violations >= 3) {
      autoSubmit();
    } else {
      setIsTabViolated(false);
      logMovement('Acknowledged tab switch warning, resumed test');
    }
  };

  // Submit and exit prematurely
  const handleCancelAndExit = () => {
    const finalScore = answers.reduce((acc, ansVal, i) => {
      if (ansVal === -1) return acc;
      return ansVal === questions[i]?.ans ? acc + 1 : acc;
    }, 0);
    submitSession(finalScore, answers);
    logMovement('Practice session cancelled prematurely by user');
    exitFullscreen();
    setGameState('filters-select');
  };

  // Automatic submission due to security breach
  const autoSubmit = () => {
    const finalAnswers = [...answers];
    while (finalAnswers.length < questions.length) {
      finalAnswers.push(-1);
    }
    const finalScore = finalAnswers.reduce((acc, ansVal, i) => {
      if (ansVal === -1) return acc;
      return ansVal === questions[i]?.ans ? acc + 1 : acc;
    }, 0);

    submitSession(finalScore, finalAnswers);
    logMovement('Test automatically submitted due to multiple security violations');
    setAnswers(finalAnswers);
    setIsTabViolated(false);
    setIsFullscreenViolated(false);
    exitFullscreen();
    setGameState('results');
  };

  // Score Calculation helper
  const score = answers.reduce((acc, chosen, i) => {
    if (chosen === -1) return acc;
    return chosen === questions[i]?.ans ? acc + 1 : acc;
  }, 0);

  const sub = subjects.find(s => s.key === selectedSubject) || { label: 'General Knowledge', color: '#8E44AD', icon: 'general' };

  // ── Filters Selector Screen ──
  if (gameState === 'filters-select') {
    return (
      <div style={{ padding: '1rem 1.5rem', width: '100%' }}>
        {/* Filters Grid - Flat layout without boxed card background */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2.5rem',
          padding: '0.5rem 0',
        }}>
          {/* 1. Subject Select */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--dash-text-muted)', marginBottom: '0.75rem' }}>
              Step 1: Choose Subject
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {subjects.map(s => {
                const isSelected = selectedSubject === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setSelectedSubject(s.key)}
                    style={{
                      background: isSelected ? `${s.color}12` : 'var(--dash-surface, #ffffff)',
                      border: isSelected ? `3px solid ${s.color}` : '2px solid var(--dash-border)',
                      borderRadius: 12,
                      padding: '1.25rem 1rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = s.color;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--dash-border)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <CategoryIcon name={s.icon || s.key} color={s.color} size={36} />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? s.color : 'var(--dash-text)' }}>
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', borderTop: '1px solid var(--dash-border)', paddingTop: '1.5rem' }}>
            {/* 2. Class Select */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--dash-text-muted)', marginBottom: '0.75rem' }}>
                Step 2: Grade Level / Class
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {CLASSES.map(cls => {
                  const isSelected = selectedClass === cls;
                  return (
                    <button
                      key={cls}
                      onClick={() => setSelectedClass(cls)}
                      style={{
                        padding: '0.55rem 1rem',
                        borderRadius: 8,
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        background: isSelected ? 'var(--color-primary, #1B2B6B)' : 'var(--dash-surface, #ffffff)',
                        color: isSelected ? 'white' : 'var(--dash-text)',
                        border: isSelected ? '2px solid var(--color-primary, #1B2B6B)' : '2px solid var(--dash-border)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {cls === 'All' ? 'All Classes' : `Class ${cls}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Difficulty Select */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--dash-text-muted)', marginBottom: '0.75rem' }}>
                Step 3: Difficulty
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {DIFFICULTIES.map(diff => {
                  const isSelected = selectedDifficulty === diff;
                  let color = '#27AE60';
                  if (diff === 'Medium') color = '#F5A623';
                  if (diff === 'Hard') color = '#E74C3C';

                  return (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      style={{
                        flex: 1,
                        padding: '0.55rem 1rem',
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        background: isSelected ? color : 'var(--dash-surface, #ffffff)',
                        color: isSelected ? 'white' : 'var(--dash-text)',
                        border: isSelected ? `2.5px solid ${color}` : '2px solid var(--dash-border)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ borderTop: '1px solid var(--dash-border)', paddingTop: '1.5rem', textAlign: 'center' }}>
            <button
              onClick={handleStartPractice}
              disabled={loadingQuestions}
              style={{
                padding: '0.85rem 3rem',
                background: sub.color,
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: `0 8px 20px ${sub.color}22`,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {loadingQuestions ? 'Fetching Questions...' : 'Start Secure Practice Session'}
            </button>
          </div>
        </div>

        {/* Security Warning Panel (Moved to Bottom) */}
        <div style={{
          background: 'rgba(231,76,60,0.06)',
          border: '1px solid rgba(231,76,60,0.2)',
          borderRadius: 14,
          padding: '1.25rem 1.5rem',
          marginTop: '2.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: '2rem' }}>🔒</div>
          <div>
            <h4 style={{ margin: 0, color: '#E74C3C', fontWeight: 700, fontSize: '0.92rem' }}>Practice Security Notice</h4>
            <p style={{ margin: '4px 0 0', color: 'var(--dash-text-secondary)', fontSize: '0.82rem', lineHeight: 1.5 }}>
              To prevent cheating, starting a practice run forces **Fullscreen Mode**, blocks **Right-Clicks**, and locks screen focus. Tab switching or exiting fullscreen will count as a security violation. **3 violations will automatically submit your exam.**
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Results Screen ──
  if (gameState === 'results') {
    const percentage = Math.round((score / questions.length) * 100);
    let grade = 'D';
    let msg = 'Keep practising! Review the concepts and try again.';
    if (percentage >= 90) { grade = 'A+'; msg = 'Outstanding! You have mastered this topic! 🌟'; }
    else if (percentage >= 75) { grade = 'A'; msg = 'Excellent work! You have a strong grasp of the subject. 🎉'; }
    else if (percentage >= 60) { grade = 'B'; msg = 'Good job! A little more revision and you\'ll ace it.'; }
    else if (percentage >= 40) { grade = 'C'; msg = 'Fair attempt. Focus on the topics you found difficult.'; }

    const mins = Math.floor(sessionTime / 60);
    const secs = sessionTime % 60;

    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        {/* Conic conic score */}
        <div style={{
          width: 140, height: 140, borderRadius: '50%', margin: '0 auto 1.5rem',
          background: `conic-gradient(${sub.color} ${percentage * 3.6}deg, var(--dash-border, #e2e6ef) 0deg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 110, height: 110, borderRadius: '50%', background: 'var(--dash-surface)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: sub.color }}>{grade}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--dash-text-muted)' }}>{percentage}%</span>
          </div>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dash-text)', marginBottom: '0.5rem' }}>
          Practice Complete!
        </h2>
        <p style={{ color: sub.color, fontWeight: 600, marginBottom: '1.5rem', fontSize: '0.95rem' }}>{msg}</p>

        {/* Stats card */}
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
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#E74C3C' }}>{questions.length - score}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted)' }}>Incorrect</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dash-text)' }}>
              {mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted)' }}>Time Taken</div>
          </div>
        </div>

        {/* Violations notice */}
        {violations > 0 && (
          <div style={{
            background: 'rgba(231,76,60,0.06)',
            border: '1px solid rgba(231,76,60,0.18)',
            borderRadius: 8,
            padding: '0.75rem',
            marginBottom: '2rem',
            fontSize: '0.82rem',
            color: '#E74C3C',
            fontWeight: 600,
          }}>
            ⚠️ {violations} security violations logged. Admin has been notified.
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={handleStartPractice}
            style={{
              padding: '0.7rem 1.5rem', background: sub.color, color: 'white',
              border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
            }}
          >
            🔄 Practice Again
          </button>
          <button
            onClick={() => setGameState('filters-select')}
            style={{
              padding: '0.7rem 1.5rem', background: 'transparent', color: sub.color,
              border: `1px solid ${sub.color}`, borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
            }}
          >
            Adjust Filters
          </button>
        </div>
      </div>
    );
  }

  // ── Playing Screen ──
  const timerPercent = (timer / QUESTION_TIME) * 100;
  const timerColor = timer > 15 ? '#27AE60' : timer > 7 ? '#F5A623' : '#E74C3C';
  const q = questions[currentIdx];

  return (
    <div style={{ padding: '1.5rem 2rem', position: 'relative', minHeight: '80vh' }}>
      
      {/* ── SECURITY OVERLAYS ── */}
      
      {/* Exited Fullscreen Warning */}
      {isFullscreenViolated && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(10, 10, 15, 0.96)', color: 'white', zIndex: 99999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '2rem', textAlign: 'center', backdropFilter: 'blur(10px)',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '2rem', color: '#E74C3C', fontWeight: 800, marginBottom: '0.5rem' }}>Security Violation</h2>
          <h4 style={{ color: '#F5A623', marginBottom: '1.5rem' }}>Fullscreen Exited!</h4>
          <p style={{ fontSize: '1rem', marginBottom: '2.5rem', maxWidth: '580px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
            The practice environment requires your browser to remain in fullscreen mode. Any attempt to exit fullscreen or resize is flagged.
            <br />
            <strong>Total Violations Logged: {violations}</strong> (Limit before auto-submit: 3)
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={resumeFullscreen} style={{ padding: '0.75rem 2rem', background: '#27AE60', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer' }}>
              Re-enter Fullscreen
            </button>
            <button onClick={handleCancelAndExit} style={{ padding: '0.75rem 2rem', background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer' }}>
              Cancel & Exit
            </button>
          </div>
        </div>
      )}

      {/* Tab Switch Warning */}
      {isTabViolated && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(10, 10, 15, 0.96)', color: 'white', zIndex: 99999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '2rem', textAlign: 'center', backdropFilter: 'blur(10px)',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
          <h2 style={{ fontSize: '2rem', color: '#E74C3C', fontWeight: 800, marginBottom: '0.5rem' }}>Unfocused Window Detected</h2>
          <h4 style={{ color: '#F5A623', marginBottom: '1.5rem' }}>Focus Lost / Tab Switch</h4>
          <p style={{ fontSize: '1rem', marginBottom: '2.5rem', maxWidth: '580px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
            You left the test window or switched browser tabs. This action is recorded as a security breach.
            <br />
            <strong>Total Violations Logged: {violations} / 3</strong>
          </p>
          {violations >= 3 ? (
            <div>
              <p style={{ color: '#E74C3C', fontWeight: 700, marginBottom: '1rem' }}>Maximum violation limit reached!</p>
              <button onClick={autoSubmit} style={{ padding: '0.75rem 2.5rem', background: '#E74C3C', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer' }}>
                Submit & Close Test
              </button>
            </div>
          ) : (
            <button onClick={resumeTab} style={{ padding: '0.75rem 2rem', background: '#27AE60', color: 'white', border: 'none', borderRadius: 8, fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer' }}>
              I Understand, Resume
            </button>
          )}
        </div>
      )}

      {/* Top Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '1.4rem' }}>{sub.icon}</span>
          <span style={{ fontWeight: 800, color: 'var(--dash-text)', fontSize: '1rem' }}>{sub.label} Practice</span>
          <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--dash-border)', padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.7rem', color: 'var(--dash-text-muted)' }}>
            Class {selectedClass} · {selectedDifficulty}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.82rem', color: 'var(--dash-text-secondary)' }}>
          <span>Question <strong>{currentIdx + 1}</strong> of {questions.length}</span>
          <span style={{ color: '#27AE60', fontWeight: 700 }}>✓ {score}</span>
          <span style={{ color: '#E74C3C', fontWeight: 700 }}>✗ {answers.filter((a, i) => a !== -1 && a !== questions[i]?.ans).length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--dash-border)', borderRadius: 4, marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 4,
          width: `${(currentIdx / questions.length) * 100}%`,
          background: sub.color, transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Question Card */}
      <div style={{
        background: 'var(--dash-surface)',
        border: '1px solid var(--dash-border)',
        borderRadius: 'var(--dash-radius)',
        padding: '2rem',
        boxShadow: 'var(--dash-shadow)',
        maxWidth: 720,
        marginBottom: '1.5rem',
      }}>
        {/* Timer row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--dash-text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
            MULTIPLE CHOICE QUESTION
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 80, height: 6, background: 'var(--dash-border)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${timerPercent}%`, background: timerColor, transition: 'width 1s linear, background 0.3s' }} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: timerColor, minWidth: 24 }}>{timer}s</span>
          </div>
        </div>

        {/* Question Text */}
        <p style={{ fontSize: '1.08rem', fontWeight: 600, color: 'var(--dash-text)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          {q?.q}
        </p>

        {/* Options Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {q?.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedOption(idx)}
                style={{
                  padding: '0.9rem 1.25rem',
                  border: isSelected ? `2.5px solid ${sub.color}` : '1.5px solid var(--dash-border)',
                  borderRadius: 10,
                  background: isSelected ? `${sub.color}08` : 'rgba(255,255,255,0.01)',
                  color: isSelected ? sub.color : 'var(--dash-text)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.9rem',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
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

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', maxWidth: 720 }}>
        <button
          onClick={() => handleNext(false)}
          disabled={selectedOption === null}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: selectedOption !== null ? sub.color : 'var(--dash-border)',
            color: selectedOption !== null ? 'white' : 'var(--dash-text-muted)',
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            cursor: selectedOption !== null ? 'pointer' : 'not-allowed',
            fontSize: '0.9rem',
            transition: 'all 0.2s',
          }}
        >
          {currentIdx + 1 >= questions.length ? '✅ Submit Answers' : 'Next Question →'}
        </button>
        <button
          onClick={() => handleNext(true)}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            color: 'var(--dash-text-muted)',
            border: '1.5px solid var(--dash-border)',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--dash-text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--dash-text-muted)'}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
