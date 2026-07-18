export function Hero() {
  return (
    <section style={{ backgroundColor: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)', color: 'white', padding: '4rem 2rem', textAlign: 'center' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>Find Truly Accessible Travel</h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>Search accessible Airbnbs, hotels, and airports with verified accessibility data</p>
        <button style={{ padding: '1rem 2rem', fontSize: '1rem', backgroundColor: 'white', color: '#0066cc', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
          Start Exploring
        </button>
      </div>
    </section>
  );
}
