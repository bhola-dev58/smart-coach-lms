'use client';

export default function AdminError({ error, reset }) {
  return (
    <div style={{ padding: '2rem', background: '#ffebee', color: '#c62828', borderRadius: '12px', border: '1px solid #ef9a9a', margin: '2rem' }}>
      <h2 style={{ marginBottom: '1rem', fontWeight: 600 }}>Error Loading Admin Data</h2>
      <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>{error.message || 'Something went wrong while fetching data from the database.'}</p>
      <button 
        onClick={() => reset()}
        style={{ padding: '0.6rem 1.2rem', background: '#c62828', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
      >
        Try Again
      </button>
    </div>
  );
}
