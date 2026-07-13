'use client';

import Link from 'next/link';
import { Wheelchair } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Wheelchair className="w-8 h-8 text-access-primary" />
          <span className="text-xl font-bold text-access-dark">AccessLink</span>
        </Link>
        
        <nav className="flex items-center gap-6">
          <a href="#search" className="text-sm font-medium text-gray-700 hover:text-access-primary transition-colors">
            Search
          </a>
          <a href="#report" className="text-sm font-medium text-gray-700 hover:text-access-primary transition-colors">
            Report
          </a>
          <a href="#about" className="text-sm font-medium text-gray-700 hover:text-access-primary transition-colors">
            About
          </a>
          <button
            className="px-4 py-2 bg-access-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            onClick={() => {
              // Wallet connect will be added here
              alert('Wallet connect coming soon');
            }}
          >
            Connect Wallet
          </button>
        </nav>
      </div>
    </header>
  );
}
