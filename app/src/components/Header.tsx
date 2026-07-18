import React from 'react';

interface HeaderProps {
  onNavigate?: (page: 'home' | 'costs') => void;
}

export function Header({ onNavigate }: HeaderProps) {
  return (
    <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0066cc' }}>♿ AccessLink</div>
        <nav style={{ display: 'flex', gap: '2rem' }}>
          <a href="#home" onClick={() => onNavigate?.('home')} style={{ color: '#1f2937', textDecoration: 'none', fontWeight: '500' }}>
            Home
          </a>
          <a href="#costs" onClick={() => onNavigate?.('costs')} style={{ color: '#1f2937', textDecoration: 'none', fontWeight: '500' }}>
            Cost Monitor
          </a>
        </nav>
      </div>
    </header>
  );
}
