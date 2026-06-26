import React from 'react';

export default function CategoryIcon({ name, color = 'currentColor', size = 20, style = {} }) {
  const normName = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const svgStyle = {
    display: 'inline-block',
    verticalAlign: 'middle',
    flexShrink: 0,
    ...style
  };

  switch (normName) {
    case 'maths':
    case 'mathematics':
      // Compass & Ruler style
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={svgStyle}>
          <path d="m18 16 4-4-4-4" />
          <path d="m6 8-4 4 4 4" />
          <path d="m14.5 4-5 16" />
        </svg>
      );

    case 'science':
    case 'physics':
    case 'chemistry':
    case 'biology':
      // Chemical Flask / Microscope atom style
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={svgStyle}>
          <path d="M6 3h12" />
          <path d="M8 3v4c0 .828-.337 1.637-.94 2.21l-3.12 2.96c-1.12 1.06-1.12 2.77 0 3.83l1.84 1.75c1.12 1.06 2.94 1.06 4.06 0L12.96 15c.603-.573.94-1.382.94-2.21V3" />
          <path d="M14 12h.01" />
          <path d="M10 16h.01" />
          <path d="M18 16h.01" />
          <path d="m16 9 5 5-2 2-5-5c-.5-.5-.5-1.3 0-1.8l2-2c.5-.5 1.3-.5 1.8 0z" />
        </svg>
      );

    case 'commerce':
    case 'economics':
    case 'accounts':
      // Bar Chart / Finance trend-up style
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={svgStyle}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
          <path d="M2 20h20" />
        </svg>
      );

    case 'arts':
    case 'humanities':
    case 'literature':
      // Art palette style
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={svgStyle}>
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.32185 19.4754 5.25055 20.2505 4.85857 20.6426C4.46659 21.0346 3.66598 20.9633 3.19032 20.5C1.84882 19.1 1 17.1 1 15C1 7.26801 7.26801 1 15 1C22.732 1 29 7.26801 29 15C29 22.732 22.732 29 15 29C13.9 29 13 28.1 13 27C13 25.9 12.1 25 11 25H9C7.9 25 7 24.1 7 23C7 22.45 7.225 22 7.585 21.65" />
          <circle cx="7.5" cy="10.5" r="1.5" fill={color} />
          <circle cx="11.5" cy="7.5" r="1.5" fill={color} />
          <circle cx="16.5" cy="9.5" r="1.5" fill={color} />
          <circle cx="15.5" cy="14.5" r="1.5" fill={color} />
        </svg>
      );

    case 'computerscience':
    case 'cse':
    case 'coding':
    case 'programming':
      // Laptop / code tags style
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={svgStyle}>
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <path d="m9 8 3 3-3 3" />
          <line x1="14" y1="14" x2="15" y2="14" />
        </svg>
      );

    case 'general':
    case 'generalboard':
    case 'gk':
      // Globe / network style
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={svgStyle}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );

    default:
      // Default book icon
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={svgStyle}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
  }
}
