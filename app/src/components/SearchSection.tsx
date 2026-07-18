export function SearchSection() {
  return (
    <section style={{ padding: '4rem 2rem', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>Search Accessible Properties</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>🏨 Hotels</div>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Find hotels with wheelchair ramps, elevators, and accessible rooms</p>
            <button style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
              Search Hotels
            </button>
          </div>

          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>✈️ Airports</div>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Navigate airports with accessible services and facilities</p>
            <button style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
              Search Airports
            </button>
          </div>

          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>🏠 Airbnbs</div>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Find Airbnb listings that match your accessibility needs</p>
            <button style={{ padding: '0.75rem 1.5rem', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
              Search Airbnbs
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
