// ============================================
// 🔓 DRIP CONTENT ENGINE
// Determines which chapters are unlocked for
// a student based on their enrollment date
// and the course's drip schedule
// ============================================

/**
 * Check if a chapter is unlocked for a student.
 *
 * @param {object} chapter - Course chapter with dripDays/dripDate
 * @param {Date} enrolledAt - Student's enrollment date
 * @returns {{ isLocked: boolean, unlockDate: Date|null, daysLeft: number }}
 */
export function isChapterLocked(chapter, enrolledAt) {
  const now = new Date();
  const dripDays = chapter.dripDays || 0;
  const dripDate = chapter.dripDate ? new Date(chapter.dripDate) : null;

  // No drip configured = always available
  if (dripDays === 0 && !dripDate) {
    return { isLocked: false, unlockDate: null, daysLeft: 0 };
  }

  let unlockDate;

  if (dripDate) {
    // Specific calendar date
    unlockDate = dripDate;
  } else {
    // Days after enrollment
    unlockDate = new Date(new Date(enrolledAt).getTime() + dripDays * 24 * 60 * 60 * 1000);
  }

  if (now >= unlockDate) {
    return { isLocked: false, unlockDate, daysLeft: 0 };
  }

  const daysLeft = Math.ceil((unlockDate - now) / (1000 * 60 * 60 * 24));
  return { isLocked: true, unlockDate, daysLeft };
}

/**
 * Process all chapters and return their lock status.
 *
 * @param {Array} chapters - Course chapters array
 * @param {Date} enrolledAt - Student's enrollment date
 * @returns {Array} Chapters with added `_lockStatus` field
 */
export function processChapterDrip(chapters, enrolledAt) {
  return chapters.map(chapter => ({
    ...chapter,
    _lockStatus: isChapterLocked(chapter, enrolledAt),
  }));
}

/**
 * Format unlock date for display.
 * @param {Date} date
 * @returns {string}
 */
export function formatUnlockDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
