export const categoryLabels = {
  MATHS: 'Mathematics',
  SCIENCE: 'Science',
  COMMERCE: 'Commerce',
  ARTS: 'Arts',
  GENERAL: 'General',
  COMPUTER_SCIENCE: 'Computer Science',
};

export function getFormattedCategory(cat, customLabels = categoryLabels) {
  if (!cat) return '';
  if (Array.isArray(cat)) {
    return cat.map((c) => customLabels[c] || c).join(', ');
  }
  if (typeof cat === 'string') {
    return cat
      .split(',')
      .map((s) => s.trim())
      .map((c) => customLabels[c] || c)
      .join(', ');
  }
  return String(cat);
}

export function getFormattedClasses(targetClass) {
  if (!targetClass) return '';
  const items = Array.isArray(targetClass)
    ? targetClass
    : String(targetClass).split(',').map((s) => s.trim());
  return items.filter((i) => i && i !== 'All Classes' && i !== 'All').join(', ');
}

export function getFormattedLevels(level) {
  if (!level) return '';
  const items = Array.isArray(level)
    ? level
    : String(level).split(',').map((s) => s.trim());
  return items.filter((i) => i && i !== 'All Levels' && i !== 'All').join(', ');
}
