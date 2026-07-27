'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import EnrollButton from '@/components/courses/EnrollButton';
import UiIcon from '@/components/common/UiIcon';

export default function BrowseCoursesClient({ courses = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get('category') || 'All';
  const currentClass = searchParams.get('class') || 'All';
  const currentLevel = searchParams.get('level') || 'All';
  const query = (searchParams.get('q') || '').trim().toLowerCase();

  const [openDropdown, setOpenDropdown] = useState(null); // 'class' | 'category' | 'level' | null
  const toolbarRef = useRef(null);

  // Multi-select local state buffering
  const [selectedClasses, setSelectedClasses] = useState(
    currentClass !== 'All' && currentClass ? currentClass.split(',').filter(Boolean) : []
  );
  const [selectedCategories, setSelectedCategories] = useState(
    currentCategory !== 'All' && currentCategory ? currentCategory.split(',').filter(Boolean) : []
  );
  const [selectedLevels, setSelectedLevels] = useState(
    currentLevel !== 'All' && currentLevel ? currentLevel.split(',').filter(Boolean) : []
  );

  useEffect(() => {
    setSelectedClasses(currentClass !== 'All' && currentClass ? currentClass.split(',').filter(Boolean) : []);
  }, [currentClass]);

  useEffect(() => {
    setSelectedCategories(currentCategory !== 'All' && currentCategory ? currentCategory.split(',').filter(Boolean) : []);
  }, [currentCategory]);

  useEffect(() => {
    setSelectedLevels(currentLevel !== 'All' && currentLevel ? currentLevel.split(',').filter(Boolean) : []);
  }, [currentLevel]);

  // Click outside to close dropdown popovers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categoryLabels = {
    MATHS: 'Mathematics',
    SCIENCE: 'Science',
    COMMERCE: 'Commerce',
    ARTS: 'Arts',
    GENERAL: 'General',
    COMPUTER_SCIENCE: 'Computer Science',
  };

  const getFormattedCategory = (cat) => {
    if (!cat) return '';
    if (Array.isArray(cat)) {
      return cat.map((c) => categoryLabels[c] || c).join(', ');
    }
    if (typeof cat === 'string') {
      return cat
        .split(',')
        .map((s) => s.trim())
        .map((c) => categoryLabels[c] || c)
        .join(', ');
    }
    return String(cat);
  };

  const getFormattedClasses = (targetClass) => {
    if (!targetClass) return '';
    const items = Array.isArray(targetClass)
      ? targetClass
      : String(targetClass).split(',').map((s) => s.trim());
    return items.filter((i) => i && i !== 'All Classes' && i !== 'All').join(', ');
  };

  const getFormattedLevels = (level) => {
    if (!level) return '';
    const items = Array.isArray(level)
      ? level
      : String(level).split(',').map((s) => s.trim());
    return items.filter((i) => i && i !== 'All Levels' && i !== 'All').join(', ');
  };

  // Helper to update URL params
  const applyFilterUpdates = (overrides = {}) => {
    const classesToApply = overrides.class !== undefined ? overrides.class : selectedClasses;
    const categoriesToApply = overrides.category !== undefined ? overrides.category : selectedCategories;
    const levelsToApply = overrides.level !== undefined ? overrides.level : selectedLevels;

    const params = new URLSearchParams();
    if (query) params.set('q', query);

    if (classesToApply.length > 0) params.set('class', classesToApply.join(','));
    if (categoriesToApply.length > 0) params.set('category', categoriesToApply.join(','));
    if (levelsToApply.length > 0) params.set('level', levelsToApply.join(','));

    const queryString = params.toString();
    startTransition(() => {
      router.push(`/lms/browse${queryString ? `?${queryString}` : ''}`, { scroll: false });
    });
  };

  // Instant local checkbox toggling (0ms latency)
  const toggleSelection = (type, value) => {
    if (type === 'class') {
      setSelectedClasses((prev) =>
        prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
      );
    } else if (type === 'category') {
      setSelectedCategories((prev) =>
        prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
      );
    } else if (type === 'level') {
      setSelectedLevels((prev) =>
        prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
      );
    }
  };

  const clearDropdownGroup = (type) => {
    if (type === 'class') setSelectedClasses([]);
    if (type === 'category') setSelectedCategories([]);
    if (type === 'level') setSelectedLevels([]);
  };

  const handleClearAll = () => {
    setSelectedClasses([]);
    setSelectedCategories([]);
    setSelectedLevels([]);
    setOpenDropdown(null);
    startTransition(() => {
      router.push('/lms/browse', { scroll: false });
    });
  };

  // ── Sub-group Filter Data Definitions ──
  const classGroups = [
    {
      groupName: 'Secondary School',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
      items: [
        { label: 'Class 8th', value: 'Class 8' },
        { label: 'Class 9th', value: 'Class 9' },
        { label: 'Class 10th (SSLC)', value: 'Class 10' },
      ],
    },
    {
      groupName: 'Higher Secondary (PUC)',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      ),
      items: [
        { label: 'Class 11th (1st PUC)', value: 'Class 11' },
        { label: 'Class 12th (2nd PUC)', value: 'Class 12' },
      ],
    },
    {
      groupName: 'Competitive & Entrance',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
      items: [
        { label: 'Dropper / Repeater (JEE/NEET)', value: 'Dropper / Repeater' },
      ],
    },
  ];

  const categoryGroups = [
    {
      groupName: 'STEM & Technology',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      items: [
        { label: 'Mathematics', value: 'MATHS' },
        { label: 'Science & Physics', value: 'SCIENCE' },
        { label: 'Computer Science', value: 'COMPUTER_SCIENCE' },
      ],
    },
    {
      groupName: 'Commerce & Management',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      items: [
        { label: 'Commerce', value: 'COMMERCE' },
      ],
    },
    {
      groupName: 'Humanities & Foundation',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
      ),
      items: [
        { label: 'Arts', value: 'ARTS' },
        { label: 'General / Foundation', value: 'GENERAL' },
      ],
    },
  ];

  const levelOptions = [
    { label: 'Beginner', value: 'Beginner', desc: 'No prior background required' },
    { label: 'Intermediate', value: 'Intermediate', desc: 'Core concept mastery' },
    { label: 'Advanced', value: 'Advanced', desc: 'Olympiad & Top Ranker level' },
  ];

  // Apply filtering logic to courses
  const filtered = courses.filter((c) => {
    const cCategories = Array.isArray(c.category)
      ? c.category.map((x) => x.toUpperCase())
      : String(c.category || '').toUpperCase().split(',').map((x) => x.trim());

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some((cat) => cCategories.includes(cat.toUpperCase()));

    const cClasses = Array.isArray(c.targetClass)
      ? c.targetClass
      : String(c.targetClass || '').split(',').map((x) => x.trim());

    const matchesClass =
      selectedClasses.length === 0 ||
      cClasses.includes('All Classes') ||
      selectedClasses.some((cls) => cClasses.includes(cls));

    const cLevels = Array.isArray(c.level)
      ? c.level
      : String(c.level || '').split(',').map((x) => x.trim());

    const matchesLevel =
      selectedLevels.length === 0 ||
      cLevels.includes('All Levels') ||
      cLevels.includes('All') ||
      selectedLevels.some((lvl) => cLevels.includes(lvl));

    const matchesQuery =
      !query ||
      (c.title || '').toLowerCase().includes(query) ||
      (c.shortDescription || '').toLowerCase().includes(query) ||
      (c.description || '').toLowerCase().includes(query) ||
      (c.category || '').toLowerCase().includes(query) ||
      (c.tags || []).some((t) => t.toLowerCase().includes(query));

    return matchesCategory && matchesClass && matchesLevel && matchesQuery;
  });

  const hasActiveFilters =
    selectedClasses.length > 0 || selectedCategories.length > 0 || selectedLevels.length > 0;

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      {/* ── Space-Saving Multi-Select Filter Toolbar ── */}
      <div
        ref={toolbarRef}
        style={{
          marginBottom: '1.5rem',
          background: 'var(--dash-surface, #ffffff)',
          padding: '0.85rem 1.15rem',
          borderRadius: '16px',
          border: '1px solid var(--dash-border, #e2e8f0)',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
          position: 'relative',
          opacity: isPending ? 0.8 : 1,
          transition: 'opacity 0.2s ease',
        }}
      >
        {isPending && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #2563eb, #facc15, #2563eb)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1s infinite linear',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
            }}
          />
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
          
          {/* Filter Dropdown 1: Target Class */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'class' ? null : 'class')}
              style={{
                height: '38px',
                padding: '0 0.85rem',
                borderRadius: '10px',
                border: selectedClasses.length > 0 ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
                background: selectedClasses.length > 0 ? '#eff6ff' : '#ffffff',
                color: selectedClasses.length > 0 ? '#1d4ed8' : '#334155',
                fontSize: '0.825rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              <span>Target Class</span>
              {selectedClasses.length > 0 && (
                <span style={{ background: '#2563eb', color: '#ffffff', borderRadius: '999px', padding: '1px 6px', fontSize: '0.7rem', fontWeight: 700 }}>
                  {selectedClasses.length}
                </span>
              )}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: openDropdown === 'class' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {openDropdown === 'class' && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  width: '300px',
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '14px',
                  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
                  padding: '0.85rem',
                  zIndex: 50,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Filter by Grade / Class</span>
                  {selectedClasses.length > 0 && (
                    <button onClick={() => clearDropdownGroup('class')} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Reset</button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '260px', overflowY: 'auto' }}>
                  {classGroups.map((group) => (
                    <div key={group.groupName} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.725rem', fontWeight: 700, color: '#1e3a8a', background: '#f8fafc', padding: '3px 6px', borderRadius: '6px' }}>
                        {group.icon}
                        <span>{group.groupName}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingLeft: '0.4rem' }}>
                        {group.items.map((item) => {
                          const isChecked = selectedClasses.includes(item.value);
                          return (
                            <label key={item.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.4rem', borderRadius: '6px', cursor: 'pointer', background: isChecked ? '#eff6ff' : 'transparent' }}>
                              <input type="checkbox" checked={isChecked} onChange={() => toggleSelection('class', item.value)} style={{ accentColor: '#2563eb', cursor: 'pointer' }} />
                              <span style={{ fontSize: '0.8rem', fontWeight: isChecked ? 600 : 500, color: isChecked ? '#1d4ed8' : '#334155' }}>{item.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '0.6rem', paddingTop: '0.4rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => { setOpenDropdown(null); applyFilterUpdates(); }} style={{ padding: '0.35rem 0.75rem', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filter Dropdown 2: Subject / Stream */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
              style={{
                height: '38px',
                padding: '0 0.85rem',
                borderRadius: '10px',
                border: selectedCategories.length > 0 ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
                background: selectedCategories.length > 0 ? '#eff6ff' : '#ffffff',
                color: selectedCategories.length > 0 ? '#1d4ed8' : '#334155',
                fontSize: '0.825rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>Subject / Stream</span>
              {selectedCategories.length > 0 && (
                <span style={{ background: '#2563eb', color: '#ffffff', borderRadius: '999px', padding: '1px 6px', fontSize: '0.7rem', fontWeight: 700 }}>
                  {selectedCategories.length}
                </span>
              )}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: openDropdown === 'category' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {openDropdown === 'category' && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  width: '300px',
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '14px',
                  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
                  padding: '0.85rem',
                  zIndex: 50,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Filter by Stream / Subject</span>
                  {selectedCategories.length > 0 && (
                    <button onClick={() => clearDropdownGroup('category')} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Reset</button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '260px', overflowY: 'auto' }}>
                  {categoryGroups.map((group) => (
                    <div key={group.groupName} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.725rem', fontWeight: 700, color: '#1e3a8a', background: '#f8fafc', padding: '3px 6px', borderRadius: '6px' }}>
                        {group.icon}
                        <span>{group.groupName}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingLeft: '0.4rem' }}>
                        {group.items.map((item) => {
                          const isChecked = selectedCategories.includes(item.value);
                          return (
                            <label key={item.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.4rem', borderRadius: '6px', cursor: 'pointer', background: isChecked ? '#eff6ff' : 'transparent' }}>
                              <input type="checkbox" checked={isChecked} onChange={() => toggleSelection('category', item.value)} style={{ accentColor: '#2563eb', cursor: 'pointer' }} />
                              <span style={{ fontSize: '0.8rem', fontWeight: isChecked ? 600 : 500, color: isChecked ? '#1d4ed8' : '#334155' }}>{item.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '0.6rem', paddingTop: '0.4rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => { setOpenDropdown(null); applyFilterUpdates(); }} style={{ padding: '0.35rem 0.75rem', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filter Dropdown 3: Skill Level */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'level' ? null : 'level')}
              style={{
                height: '38px',
                padding: '0 0.85rem',
                borderRadius: '10px',
                border: selectedLevels.length > 0 ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
                background: selectedLevels.length > 0 ? '#eff6ff' : '#ffffff',
                color: selectedLevels.length > 0 ? '#1d4ed8' : '#334155',
                fontSize: '0.825rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <span>Skill Level</span>
              {selectedLevels.length > 0 && (
                <span style={{ background: '#2563eb', color: '#ffffff', borderRadius: '999px', padding: '1px 6px', fontSize: '0.7rem', fontWeight: 700 }}>
                  {selectedLevels.length}
                </span>
              )}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: openDropdown === 'level' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {openDropdown === 'level' && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  width: '250px',
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '14px',
                  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
                  padding: '0.85rem',
                  zIndex: 50,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Select Skill Level</span>
                  {selectedLevels.length > 0 && (
                    <button onClick={() => clearDropdownGroup('level')} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Reset</button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {levelOptions.map((item) => {
                    const isChecked = selectedLevels.includes(item.value);
                    return (
                      <label key={item.value} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.35rem 0.4rem', borderRadius: '6px', cursor: 'pointer', background: isChecked ? '#eff6ff' : 'transparent' }}>
                        <input type="checkbox" checked={isChecked} onChange={() => toggleSelection('level', item.value)} style={{ accentColor: '#2563eb', cursor: 'pointer', marginTop: '2px' }} />
                        <div>
                          <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: isChecked ? 700 : 500, color: isChecked ? '#1d4ed8' : '#334155' }}>{item.label}</span>
                          <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8' }}>{item.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div style={{ marginTop: '0.6rem', paddingTop: '0.4rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => { setOpenDropdown(null); applyFilterUpdates(); }} style={{ padding: '0.35rem 0.75rem', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Clear All Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              style={{
                height: '38px',
                padding: '0 0.75rem',
                borderRadius: '10px',
                border: '1.5px solid #fee2e2',
                background: '#fef2f2',
                color: '#ef4444',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                cursor: 'pointer',
              }}
            >
              ✕ Clear All
            </button>
          )}
        </div>
      </div>

      {/* Search result heading */}
      {query && (
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dash-text)', marginBottom: '0.25rem' }}>
            Results for &ldquo;<span style={{ color: 'var(--dash-accent)' }}>{query}</span>&rdquo;
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--dash-text-muted)' }}>
            {filtered.length} course{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>
      )}

      {/* Courses Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--dash-text-secondary)' }}>
          <p style={{ marginBottom: '0.5rem' }}>
            <UiIcon name="search" size={40} color="var(--dash-text-muted)" />
          </p>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
            {query ? `No courses found for "${query}"` : 'No courses found for your selected filters.'}
          </p>
          <button
            onClick={handleClearAll}
            style={{
              marginTop: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--dash-border)',
              background: 'var(--dash-surface)',
              color: 'var(--dash-accent, #2563eb)',
              fontWeight: 600,
              fontSize: '0.825rem',
              cursor: 'pointer',
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filtered.map((c) => (
            <div
              key={c._id}
              style={{
                background: 'var(--dash-surface)',
                border: '1px solid var(--dash-border)',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              {/* Thumbnail Container with Ambient Glass Blur */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  overflow: 'hidden',
                  background: '#0f172a',
                }}
              >
                {/* Ambient Blur Backdrop Image */}
                <img
                  src={c.thumbnail || '/images/courses/default.jpg'}
                  alt=""
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '-10px',
                    width: 'calc(100% + 20px)',
                    height: 'calc(100% + 20px)',
                    objectFit: 'cover',
                    filter: 'blur(16px) brightness(0.6) saturate(1.4)',
                    transform: 'scale(1.15)',
                    pointerEvents: 'none',
                    zIndex: 0,
                  }}
                  aria-hidden="true"
                />
                {/* Un-cropped Foreground Image */}
                <img
                  src={c.thumbnail || '/images/courses/default.jpg'}
                  alt={c.title}
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center',
                    display: 'block',
                    zIndex: 1,
                  }}
                />
                {c.isFeatured && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      background: 'rgba(15, 23, 42, 0.85)',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      zIndex: 2,
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Popular
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div style={{ padding: '1rem' }}>
                {/* Header Row: Title + Category Subtitle Tag */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <h3
                    style={{
                      color: 'var(--dash-text)',
                      fontSize: '0.975rem',
                      fontWeight: 700,
                      margin: 0,
                      flex: 1,
                      fontFamily: 'var(--font-heading)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {c.title}
                  </h3>
                  {c.category && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: '6px',
                        border: '1px solid #bfdbfe',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {getFormattedCategory(c.category)}
                    </span>
                  )}
                </div>

                <p
                  style={{
                    color: 'var(--dash-text-muted)',
                    fontSize: '0.78rem',
                    marginBottom: '0.75rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {c.shortDescription || c.description}
                </p>

                {/* Course Meta */}
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '0.75rem', color: 'var(--dash-text-muted)', fontSize: '0.75rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {c.formattedTime || `${c.totalHours}h`}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                    {c.totalLessons} Lessons
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                    {c.totalStudents?.toLocaleString('en-IN')}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    {c.rating}
                  </span>
                </div>

                {/* Price Row: Price + Target Class & Level Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--dash-accent, #2563eb)', fontSize: '1.15rem', fontWeight: 700 }}>
                      ₹{c.price?.toLocaleString('en-IN')}
                    </span>
                    {c.originalPrice > 0 && (
                      <span style={{ color: 'var(--dash-text-muted)', textDecoration: 'line-through', marginLeft: '0.4rem', fontSize: '0.825rem' }}>
                        ₹{c.originalPrice?.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {getFormattedClasses(c.targetClass) && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        color: '#334155',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                      </svg>
                      {getFormattedClasses(c.targetClass)}
                    </span>
                  )}

                  {getFormattedLevels(c.level) && (
                    <span
                      style={{
                        fontSize: '0.675rem',
                        fontWeight: 500,
                        padding: '2px 6px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        color: '#64748b',
                      }}
                    >
                      {getFormattedLevels(c.level)}
                    </span>
                  )}
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link
                    href={`/lms/browse/${c.slug}`}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      textAlign: 'center',
                      border: '1px solid var(--dash-border)',
                      borderRadius: '8px',
                      color: 'var(--dash-text)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'border-color var(--dash-transition)',
                    }}
                  >
                    Details
                  </Link>
                  <EnrollButton
                    courseId={c._id}
                    amount={c.price}
                    courseTitle={c.title}
                    className=""
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: 'var(--color-primary, #2563eb)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Enroll Now
                  </EnrollButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
