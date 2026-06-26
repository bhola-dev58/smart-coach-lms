'use client';

import { useRouter } from 'next/navigation';

export default function CategoryDropdown({ categories, categoryLabels, currentCategory, searchQuery }) {
  const router = useRouter();

  const handleChange = (e) => {
    const selectedCategory = e.target.value;
    const queryParams = [];
    if (selectedCategory && selectedCategory !== 'All') {
      queryParams.push(`category=${selectedCategory}`);
    }
    if (searchQuery) {
      queryParams.push(`q=${searchQuery}`);
    }
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    router.push(`/courses${queryString}`);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
        Category:
      </label>
      <select
        value={currentCategory || 'All'}
        onChange={handleChange}
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text)',
          padding: '0.6rem 2.2rem 0.6rem 1rem',
          borderRadius: '20px',
          fontSize: '0.88rem',
          fontWeight: 500,
          outline: 'none',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          transition: 'all 0.25s ease',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234b5563' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.8rem center',
          backgroundSize: '1rem',
          minWidth: '200px'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--color-primary)';
          e.target.style.boxShadow = '0 0 0 3px rgba(var(--color-primary-rgb), 0.15)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--color-border)';
          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
        }}
      >
        <option value="All">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {categoryLabels[cat] || cat}
          </option>
        ))}
      </select>
    </div>
  );
}
