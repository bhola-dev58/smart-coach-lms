'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect, useRef, useTransition } from 'react';

export default function CourseFilterToolbar({ categories = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get('category') || '';
  const currentClass = searchParams.get('class') || searchParams.get('targetClass') || '';
  const currentLevel = searchParams.get('level') || '';
  const currentSort = searchParams.get('sort') || 'popular';
  const currentSearch = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [openDropdown, setOpenDropdown] = useState(null); // 'class' | 'category' | 'level' | null
  const toolbarRef = useRef(null);

  // Local state buffering for instant 0ms UI feedback on checkboxes
  const [selectedClasses, setSelectedClasses] = useState(
    currentClass ? currentClass.split(',').filter(Boolean) : []
  );
  const [selectedCategories, setSelectedCategories] = useState(
    currentCategory ? currentCategory.split(',').filter(Boolean) : []
  );
  const [selectedLevels, setSelectedLevels] = useState(
    currentLevel ? currentLevel.split(',').filter(Boolean) : []
  );

  // Keep local state in sync when URL changes externally
  useEffect(() => {
    setSelectedClasses(currentClass ? currentClass.split(',').filter(Boolean) : []);
  }, [currentClass]);

  useEffect(() => {
    setSelectedCategories(currentCategory ? currentCategory.split(',').filter(Boolean) : []);
  }, [currentCategory]);

  useEffect(() => {
    setSelectedLevels(currentLevel ? currentLevel.split(',').filter(Boolean) : []);
  }, [currentLevel]);

  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  // Click outside listener to close open popovers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Non-blocking route query updater with React useTransition
  const applyFilterUpdates = useCallback(
    (overrides = {}) => {
      const classesToApply = overrides.class !== undefined ? overrides.class : selectedClasses;
      const categoriesToApply = overrides.category !== undefined ? overrides.category : selectedCategories;
      const levelsToApply = overrides.level !== undefined ? overrides.level : selectedLevels;
      const searchToApply = overrides.q !== undefined ? overrides.q : searchTerm;
      const sortToApply = overrides.sort !== undefined ? overrides.sort : currentSort;

      const params = new URLSearchParams();

      if (classesToApply.length > 0) params.set('class', classesToApply.join(','));
      if (categoriesToApply.length > 0) params.set('category', categoriesToApply.join(','));
      if (levelsToApply.length > 0) params.set('level', levelsToApply.join(','));
      if (searchToApply && searchToApply.trim() !== '') params.set('q', searchToApply);
      if (sortToApply && sortToApply !== 'popular') params.set('sort', sortToApply);

      const queryString = params.toString();
      
      startTransition(() => {
        router.push(`/courses${queryString ? `?${queryString}` : ''}`, { scroll: false });
      });
    },
    [selectedClasses, selectedCategories, selectedLevels, searchTerm, currentSort, searchParams, router]
  );

  // Debounced URL update when local filter selections change
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      applyFilterUpdates();
    }, 250); // 250ms batching for lightning fast typing & clicking
    return () => clearTimeout(timer);
  }, [selectedClasses, selectedCategories, selectedLevels, searchTerm]);

  // Instant local checkbox toggling (0ms UI latency)
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
    setSearchTerm('');
    setSelectedClasses([]);
    setSelectedCategories([]);
    setSelectedLevels([]);
    setOpenDropdown(null);
    startTransition(() => {
      router.push('/courses', { scroll: false });
    });
  };

  // ── Data Definitions with Nested Sub-groups ──
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

  const hasActiveFilters =
    selectedClasses.length > 0 ||
    selectedCategories.length > 0 ||
    selectedLevels.length > 0 ||
    searchTerm !== '';

  return (
    <div
      ref={toolbarRef}
      style={{
        background: 'var(--dash-surface, #ffffff)',
        borderRadius: '18px',
        padding: '1rem 1.25rem',
        boxShadow: '0 8px 28px rgba(15, 23, 42, 0.05)',
        border: '1px solid var(--dash-border, #e2e8f0)',
        marginBottom: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        position: 'relative',
        opacity: isPending ? 0.8 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      {/* Top Subtle Loading Line during Route Transition */}
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
            borderTopLeftRadius: '18px',
            borderTopRightRadius: '18px',
          }}
        />
      )}

      {/* ── Top Bar: Search, Dropdowns, Sort & Clear ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by course, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              height: '42px',
              padding: '0 0.85rem 0 2.3rem',
              borderRadius: '10px',
              border: '1.5px solid #e2e8f0',
              fontSize: '0.875rem',
              outline: 'none',
              background: '#f8fafc',
              color: '#0f172a',
              transition: 'all 0.2s ease',
            }}
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                applyFilterUpdates({ q: '' });
              }}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '2px',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* ── Filter Dropdown 1: Target Class (Multi-Checkboxes & Sub-groups) ── */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'class' ? null : 'class')}
            style={{
              height: '42px',
              padding: '0 1rem',
              borderRadius: '10px',
              border: selectedClasses.length > 0 ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
              background: selectedClasses.length > 0 ? '#eff6ff' : '#ffffff',
              color: selectedClasses.length > 0 ? '#1d4ed8' : '#334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            <span>Target Class</span>
            {selectedClasses.length > 0 && (
              <span
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  borderRadius: '999px',
                  padding: '1px 6px',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                }}
              >
                {selectedClasses.length}
              </span>
            )}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                transform: openDropdown === 'class' ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                marginLeft: '0.25rem',
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Popover Menu */}
          {openDropdown === 'class' && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                width: '320px',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '14px',
                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
                padding: '0.85rem',
                zIndex: 50,
                animation: 'fadeIn 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', paddingBottom: '0.4rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.775rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Filter by Grade / Class
                </span>
                {selectedClasses.length > 0 && (
                  <button
                    onClick={() => clearDropdownGroup('class')}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Sub-groups Accordion/List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                {classGroups.map((group) => (
                  <div key={group.groupName} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: '#1e3a8a', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px' }}>
                      {group.icon}
                      <span>{group.groupName}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '0.5rem' }}>
                      {group.items.map((item) => {
                        const isChecked = selectedClasses.includes(item.value);
                        return (
                          <label
                            key={item.value}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.6rem',
                              padding: '0.35rem 0.5rem',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              background: isChecked ? '#eff6ff' : 'transparent',
                              transition: 'background 0.15s ease',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelection('class', item.value)}
                              style={{ accentColor: '#2563eb', width: '15px', height: '15px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.85rem', fontWeight: isChecked ? 600 : 500, color: isChecked ? '#1d4ed8' : '#334155' }}>
                              {item.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setOpenDropdown(null);
                    applyFilterUpdates();
                  }}
                  style={{
                    padding: '0.4rem 0.85rem',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.775rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Apply Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Filter Dropdown 2: Category / Subject (Multi-Checkboxes & Sub-groups) ── */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
            style={{
              height: '42px',
              padding: '0 1rem',
              borderRadius: '10px',
              border: selectedCategories.length > 0 ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
              background: selectedCategories.length > 0 ? '#eff6ff' : '#ffffff',
              color: selectedCategories.length > 0 ? '#1d4ed8' : '#334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Subject / Stream</span>
            {selectedCategories.length > 0 && (
              <span
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  borderRadius: '999px',
                  padding: '1px 6px',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                }}
              >
                {selectedCategories.length}
              </span>
            )}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                transform: openDropdown === 'category' ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                marginLeft: '0.25rem',
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Popover Menu */}
          {openDropdown === 'category' && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                width: '320px',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '14px',
                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
                padding: '0.85rem',
                zIndex: 50,
                animation: 'fadeIn 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', paddingBottom: '0.4rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.775rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Filter by Stream / Subject
                </span>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => clearDropdownGroup('category')}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Sub-groups Accordion/List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                {categoryGroups.map((group) => (
                  <div key={group.groupName} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: '#1e3a8a', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px' }}>
                      {group.icon}
                      <span>{group.groupName}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '0.5rem' }}>
                      {group.items.map((item) => {
                        const isChecked = selectedCategories.includes(item.value);
                        return (
                          <label
                            key={item.value}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.6rem',
                              padding: '0.35rem 0.5rem',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              background: isChecked ? '#eff6ff' : 'transparent',
                              transition: 'background 0.15s ease',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelection('category', item.value)}
                              style={{ accentColor: '#2563eb', width: '15px', height: '15px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.85rem', fontWeight: isChecked ? 600 : 500, color: isChecked ? '#1d4ed8' : '#334155' }}>
                              {item.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setOpenDropdown(null);
                    applyFilterUpdates();
                  }}
                  style={{
                    padding: '0.4rem 0.85rem',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.775rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Apply Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Filter Dropdown 3: Skill Level ── */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'level' ? null : 'level')}
            style={{
              height: '42px',
              padding: '0 1rem',
              borderRadius: '10px',
              border: selectedLevels.length > 0 ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
              background: selectedLevels.length > 0 ? '#eff6ff' : '#ffffff',
              color: selectedLevels.length > 0 ? '#1d4ed8' : '#334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <span>Skill Level</span>
            {selectedLevels.length > 0 && (
              <span
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  borderRadius: '999px',
                  padding: '1px 6px',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                }}
              >
                {selectedLevels.length}
              </span>
            )}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                transform: openDropdown === 'level' ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                marginLeft: '0.25rem',
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Popover Menu */}
          {openDropdown === 'level' && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                width: '260px',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '14px',
                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
                padding: '0.85rem',
                zIndex: 50,
                animation: 'fadeIn 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', paddingBottom: '0.4rem', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.775rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Select Skill Level
                </span>
                {selectedLevels.length > 0 && (
                  <button
                    onClick={() => clearDropdownGroup('level')}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Reset
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {levelOptions.map((item) => {
                  const isChecked = selectedLevels.includes(item.value);
                  return (
                    <label
                      key={item.value}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.6rem',
                        padding: '0.4rem 0.5rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: isChecked ? '#eff6ff' : 'transparent',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelection('level', item.value)}
                        style={{ accentColor: '#2563eb', width: '15px', height: '15px', marginTop: '2px', cursor: 'pointer' }}
                      />
                      <div>
                        <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: isChecked ? 700 : 500, color: isChecked ? '#1d4ed8' : '#334155' }}>
                          {item.label}
                        </span>
                        <span style={{ display: 'block', fontSize: '0.725rem', color: '#94a3b8' }}>
                          {item.desc}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setOpenDropdown(null);
                    applyFilterUpdates();
                  }}
                  style={{
                    padding: '0.4rem 0.85rem',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.775rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Apply Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sort Select */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#64748b' }}>
            <line x1="21" y1="10" x2="7" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="11" y2="14" />
            <line x1="21" y1="18" x2="15" y2="18" />
          </svg>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Sort:</span>
          <select
            value={currentSort}
            onChange={(e) => applyFilterUpdates({ sort: e.target.value })}
            style={{
              height: '42px',
              padding: '0 0.85rem',
              borderRadius: '10px',
              border: '1.5px solid #e2e8f0',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#0f172a',
              background: '#ffffff',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Clear All Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            style={{
              height: '42px',
              padding: '0 0.85rem',
              borderRadius: '10px',
              border: '1.5px solid #fee2e2',
              background: '#fef2f2',
              color: '#ef4444',
              fontSize: '0.825rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Active Filter Badges Bar (Shows when filters are selected) */}
      {hasActiveFilters && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px dashed #e2e8f0' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active:
          </span>

          {/* Active Classes */}
          {selectedClasses.map((cls) => (
            <span
              key={cls}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '3px 10px',
                borderRadius: '999px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                fontSize: '0.775rem',
                fontWeight: 600,
              }}
            >
              Grade: {cls}
              <button
                onClick={() => toggleSelection('class', cls)}
                style={{ background: 'none', border: 'none', color: '#1d4ed8', cursor: 'pointer', fontSize: '0.8rem', padding: 0, lineHeight: 1 }}
              >
                ✕
              </button>
            </span>
          ))}

          {/* Active Categories */}
          {selectedCategories.map((cat) => (
            <span
              key={cat}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '3px 10px',
                borderRadius: '999px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#15803d',
                fontSize: '0.775rem',
                fontWeight: 600,
              }}
            >
              Subject: {cat}
              <button
                onClick={() => toggleSelection('category', cat)}
                style={{ background: 'none', border: 'none', color: '#15803d', cursor: 'pointer', fontSize: '0.8rem', padding: 0, lineHeight: 1 }}
              >
                ✕
              </button>
            </span>
          ))}

          {/* Active Levels */}
          {selectedLevels.map((lvl) => (
            <span
              key={lvl}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '3px 10px',
                borderRadius: '999px',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#b45309',
                fontSize: '0.775rem',
                fontWeight: 600,
              }}
            >
              Level: {lvl}
              <button
                onClick={() => toggleSelection('level', lvl)}
                style={{ background: 'none', border: 'none', color: '#b45309', cursor: 'pointer', fontSize: '0.8rem', padding: 0, lineHeight: 1 }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
