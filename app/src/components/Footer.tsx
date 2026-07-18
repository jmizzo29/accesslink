export function Footer() {
  return (
    <footer style={{ backgroundColor: '#1f2937', color: 'white', padding: '3rem 2rem', textAlign: 'center' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>AccessLink</h3>
          <p style={{ color: '#d1d5db', marginBottom: '1rem' }}>Making accessible travel accessible to everyone</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '1rem' }}>Company</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>About</a></li>
              <li><a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '1rem' }}>Support</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>Help Center</a></li>
              <li><a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontWeight: '600', marginBottom: '1rem' }}>Legal</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>Privacy</a></li>
              <li><a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>Terms</a></li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #374151', paddingTop: '2rem', color: '#d1d5db' }}>
          <p>© 2026 AccessLink. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
