'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import styles from '@/app/lms/lms.module.css';

// ── Course Progress Card ──
function CourseProgressCard({ courseId, title, unit, progress, thumbnail }) {
  return (
    <Link href={`/lms/learn/${courseId}`} className={styles.courseItem} style={{ textDecoration: 'none' }}>
      <div className={styles.courseThumb}>
        {thumbnail ? (
          <img src={thumbnail} alt={title} />
        ) : (
          <span className={styles.courseThumbPlaceholder}>📚</span>
        )}
      </div>
      <div className={styles.courseItemBody}>
        <div className={styles.courseItemTitle}>{title}</div>
        <div className={styles.courseItemSub}>{unit} — ({progress}% Complete)</div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <span className={styles.startBtn}>Start Next Lesson</span>
      </div>
    </Link>
  );
}

// ── Daily Goal Circular Progress ──
function DailyGoalChart({ percent }) {
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className={styles.goalChart}>
      <div className={styles.goalCircle}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="60" className={styles.trackCircle} />
          <circle
            cx="70" cy="70" r="60"
            className={styles.progressCircle}
            style={{ strokeDashoffset: offset }}
          />
        </svg>
        <div className={styles.goalLabel}>
          <span className={styles.goalLabelMain}>Daily</span>
          <span className={styles.goalLabelSub}>Goal</span>
        </div>
      </div>
      <div className={styles.goalScale}>
        <span>0</span><span>5%</span><span>100</span>
      </div>
      <div className={styles.goalLegend}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotDaily}`} /> Daily Poor
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendDotMonth}`} /> Month
        </div>
      </div>
    </div>
  );
}

// ── Live Class Item ──
function LiveClassItem({ title, time, countdown }) {
  return (
    <div className={styles.liveItem}>
      <div className={styles.liveIcon}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </div>
      <div className={styles.liveInfo}>
        <div className={styles.liveTitle}>{title}</div>
        <div className={styles.liveTime}>{time}</div>
      </div>
      <div className={styles.liveCountdown}>{countdown}</div>
    </div>
  );
}

// ── Leaderboard Item ──
function LeaderItem({ rank, name, course, score, color }) {
  const rankClass =
    rank === 1 ? styles.rank1 :
    rank === 2 ? styles.rank2 :
    rank === 3 ? styles.rank3 : styles.rankDefault;

  return (
    <div className={styles.leaderItem}>
      <div className={`${styles.leaderRank} ${rankClass}`}>{rank}</div>
      <div className={styles.leaderAvatar} style={{ background: color }}>{name.charAt(0)}</div>
      <div className={styles.leaderInfo}>
        <div className={styles.leaderName}>{name}</div>
        <div className={styles.leaderCourse}>{course}</div>
      </div>
      <div className={styles.leaderScore}>{score.toLocaleString()}</div>
    </div>
  );
}

// ── Empty State ──
function EmptyState({ icon, title, text, btnText, btnHref }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>
      <div className={styles.emptyTitle}>{title}</div>
      <div className={styles.emptyText}>{text}</div>
      {btnHref && <Link href={btnHref} className={styles.emptyBtn}>{btnText}</Link>}
    </div>
  );
}

// ── Main Dashboard Content ──
export default function DashboardContent({ enrolledCourses = [], leaderboard = [] }) {
  const { data: session } = useSession();
  const userName = session?.user?.name || 'Student';
  const userInitial = userName.charAt(0).toUpperCase();
  const userRole = session?.user?.role || 'student';

  const hasEnrollments = enrolledCourses.length > 0;

  return (
    <>
      {/* ── Dashboard Grid ── */}
      <div className={styles.dashGrid}>

        {/* ─── Continue Learning ─── */}
        <div className={`${styles.dCard} ${styles.continueCard}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Continue Learning</span>
            <span className={styles.cardArrow}>›</span>
          </div>
          {hasEnrollments ? (
            <div className={styles.courseCards}>
              {enrolledCourses.map((enr) => (
                <CourseProgressCard
                  key={enr._id}
                  courseId={enr.course?._id?.toString() || enr._id}
                  title={enr.course?.title || 'Course'}
                  unit={enr.progress?.currentLesson || 'Unit 1'}
                  progress={enr.progress?.percentage || 0}
                  thumbnail={enr.course?.thumbnail}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📚"
              title="No Courses Yet"
              text="Explore our catalog and start learning today!"
              btnText="Browse Courses"
              btnHref="/lms/browse"
            />
          )}
        </div>

        {/* ─── Daily Goal ─── */}
        <div className={`${styles.dCard} ${styles.goalCard}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Your Daily Goal</span>
            <span className={styles.cardArrow}>⋯</span>
          </div>
          <DailyGoalChart percent={hasEnrollments ? 5 : 0} />
        </div>



        {/* ─── Upcoming Live Classes ─── */}
        <div className={`${styles.dCard} ${styles.liveCard}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Upcoming Live Classes</span>
            <span className={styles.cardArrow}>›</span>
          </div>
          <div className={styles.liveList}>
            <LiveClassItem title="Geography: Rivers of India" time="8:00pm — 12:00" countdown="in 10 mins" />
            <LiveClassItem title="Data Structures: Trees" time="9:00pm — 10:30" countdown="in 1 hr" />
            <LiveClassItem title="Physics: Optics Lab" time="10:00pm — 11:30" countdown="in 2 hrs" />
          </div>
        </div>

        {/* ─── Leaderboard ─── */}
        <div className={`${styles.dCard} ${styles.leaderCard}`}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardTitle}>Leaderboard</span>
              <div className={styles.leaderSub}>(Personalized for {userName})</div>
            </div>
          </div>
          {leaderboard.length > 0 ? (
            <div className={styles.leaderList}>
              {leaderboard.map((item, i) => (
                <LeaderItem
                  key={item._id || i}
                  rank={i + 1}
                  name={item.name}
                  course="All Course"
                  score={item.score}
                  color={['#C8102E', '#e67e22', '#2ed573', '#9b59b6', '#3498db'][i % 5]}
                />
              ))}
            </div>
          ) : (
            <div className={styles.leaderList}>
              <LeaderItem rank={1} name={userName} course="All Course" score={0} color="#C8102E" />
            </div>
          )}
        </div>

      </div>
    </>
  );
}
