'use client';

import { useState } from 'react';

export default function WhatsAppButton({ 
  phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918874270707', 
  message = 'Hello Gradify Academy! I would like to inquire about courses and admissions.' 
}) {
  const [hovered, setHovered] = useState(false);
  const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact on WhatsApp"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#25D366',
        color: '#ffffff',
        padding: hovered ? '12px 20px 12px 14px' : '13px',
        borderRadius: '50px',
        boxShadow: '0 10px 25px rgba(37, 211, 102, 0.45), 0 4px 12px rgba(0, 0, 0, 0.18)',
        textDecoration: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        flexShrink: 0
      }}>
        {/* WhatsApp Brand SVG Logo */}
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path fill="#ffffff" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 2a9.97 9.97 0 0 0-7.854 16.143L3 21l2.956-1.106A9.97 9.97 0 1 0 12 2z"/>
        </svg>
      </div>

      {hovered && (
        <span style={{
          fontSize: '14px',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          color: '#ffffff',
          letterSpacing: '0.01em',
          fontFamily: 'var(--font-body, sans-serif)',
        }}>
          Chat on WhatsApp
        </span>
      )}
    </a>
  );
}
