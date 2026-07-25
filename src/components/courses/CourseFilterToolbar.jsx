'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export default function CourseFilterToolbar({ categories = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || 'All';
  const currentClass = searchParams.get('class') || searchParams.get('targetClass') || 'All';
  const currentLevel = searchParams.get('level') || 'All';
  const currentSort = searchParams.get('sort') || 'popular';
  const currentSearch = searchParams.get('q') || '';

  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'All' && value !== '') {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name, value) => {
    const queryString = createQueryString(name, value);
    router.push(`/courses${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  const handleClearAll = () => {
    router.push('/courses', { scroll: false });
  };

  const classOptions = [
    { label: 'All Classes', value: 'All' },
    { label: 'Class 8th', value: 'Class 8' },
    { label: 'Class 9th', value: 'Class 9' },
    { label: 'Class 10th (SSLC)', value: 'Class 10' },
    { label: 'Class 11th (1st PUC)', value: 'Class 11' },
    { label: 'Class 12th (2nd PUC)', value: 'Class 12' },
    { label: 'Dropper / Repeater (JEE/NEET)', value: 'Dropper / Repeater' },
  ];

  const categoryOptions = [
    { label: 'All Categories', value: 'All' },
    { label: 'Mathematics', value: 'MATHS' },
    { label: 'Science', value: 'SCIENCE' },
    { label: 'Commerce', value: 'COMMERCE' },
    { label: 'General / Foundation', value: 'GENERAL' },
    { label: 'Arts', value: 'ARTS' },
    { label: 'Computer Science', value: 'COMPUTER_SCIENCE' },
  ];

  const levelOptions = [
    { label: 'All Skill Levels', value: 'All' },
    { label: 'Beginner', value: 'Beginner' },
    { label: 'Intermediate', value: 'Intermediate' },
    { label: 'Advanced', value: 'Advanced' },
  ];

  const hasActiveFilters = currentCategory !== 'All' || currentClass !== 'All' || currentLevel !== 'All' || currentSearch !== '';

  return (
    <div style={{
      background: 'var(--dash-surface, #ffffff)',
      borderRadius: '16px',
      padding: '1.25rem 1.5rem',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
      border: '1px solid var(--dash-border, #e5e7eb)',
      marginBottom: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
    }}>
      {/* ── Top Bar: Search & Sort ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Search Box */}
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '500px' }}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search by course title, topic, or subject..."
            defaultValue={currentSearch}
            onChange={(e) => {
              const val = e.target.value;
              handleFilterChange('q', val);
            }}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.6rem',
              borderRadius: '10px',
              border: '1.5px solid var(--dash-border, #e5e7eb)',
              fontSize: '0.9rem',
              outline: 'none',
              background: '#f9fafb',
              color: '#1f2937',
              transition: 'all 0.2s ease',
            }}
          />
        </div>

        {/* Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#6b7280' }}>
            <line x1="21" y1="10" x2="7" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="11" y2="14"></line>
            <line x1="21" y1="18" x2="15" y2="18"></line>
          </svg>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>Sort:</span>
          <select
            value={currentSort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: '1.5px solid var(--dash-border, #e5e7eb)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#1f2937',
              background: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* ── Class Quick Selection Tabs ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#2563eb' }}>
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
            Target Class / Grade:
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Clear Filters
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {classOptions.map((item) => {
            const isSelected = currentClass === item.value;
            return (
              <button
                key={item.value}
                onClick={() => handleFilterChange('class', item.value)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.825rem',
                  fontWeight: isSelected ? 700 : 500,
                  border: isSelected ? '1.5px solid #2563eb' : '1px solid #d1d5db',
                  background: isSelected ? '#eff6ff' : '#ffffff',
                  color: isSelected ? '#1d4ed8' : '#4b5563',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.15)' : 'none',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Dropdown Controls: Category & Skill Level ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', borderTop: '1px dashed var(--dash-border, #e5e7eb)', paddingTop: '1rem' }}>
        {/* Category Dropdown */}
        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.775rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
            Category / Subject:
          </label>
          <select
            value={currentCategory}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: '1.5px solid var(--dash-border, #e5e7eb)',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: '#1f2937',
              background: '#ffffff',
              cursor: 'pointer',
            }}
          >
            {categoryOptions.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Skill Level Dropdown */}
        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <label style={{ fontSize: '0.775rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
            Skill Level:
          </label>
          <select
            value={currentLevel}
            onChange={(e) => handleFilterChange('level', e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: '1.5px solid var(--dash-border, #e5e7eb)',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: '#1f2937',
              background: '#ffffff',
              cursor: 'pointer',
            }}
          >
            {levelOptions.map((lvl) => (
              <option key={lvl.value} value={lvl.value}>
                {lvl.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
