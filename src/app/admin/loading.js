export default function AdminLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', padding: '4rem', color: '#666' }}>
      <div className="spinner" style={{
        width: '40px', height: '40px', border: '3px solid rgba(200, 16, 46, 0.2)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ marginTop: '1rem', fontWeight: 500 }}>Loading admin data...</p>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
