'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Filter, AlertCircle } from 'lucide-react';
import { searchListings } from '@/lib/supabase-client';
import { PropertyCard } from './PropertyCard';

export function SearchSection() {
  const [listings, setListings] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    location: '',
    zeroStepEntry: false,
    rollInShower: false,
    wideDoors: false,
    wavAvailable: false,
    elevatorAccess: false,
  });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    
    try {
      const results = await searchListings(filters);
      setListings(results || []);
    } catch (error) {
      console.error('Search error:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const filterActive = Object.values(filters).some(v => v === true || (typeof v === 'string' && v !== ''));

  return (
    <section id="search" className="py-12 sm:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">Find Accessible Places</h2>
        
        <form onSubmit={handleSearch} className="bg-gray-50 p-6 sm:p-8 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location / City
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  id="location"
                  type="text"
                  placeholder="e.g., New York, San Francisco"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-access-primary focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:col-span-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
            <button
              type="submit"
              disabled={loading}
              className="sm:col-span-1 bg-access-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white rounded-lg border border-gray-200 mt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.zeroStepEntry}
                  onChange={(e) => setFilters({ ...filters, zeroStepEntry: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 accent-access-primary"
                />
                <span className="text-sm font-medium">Zero-step entry</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.rollInShower}
                  onChange={(e) => setFilters({ ...filters, rollInShower: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 accent-access-primary"
                />
                <span className="text-sm font-medium">Roll-in shower</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.wideDoors}
                  onChange={(e) => setFilters({ ...filters, wideDoors: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 accent-access-primary"
                />
                <span className="text-sm font-medium">Wide doors (≥36")</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.wavAvailable}
                  onChange={(e) => setFilters({ ...filters, wavAvailable: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 accent-access-primary"
                />
                <span className="text-sm font-medium">WAV available</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.elevatorAccess}
                  onChange={(e) => setFilters({ ...filters, elevatorAccess: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 accent-access-primary"
                />
                <span className="text-sm font-medium">Elevator/lift access</span>
              </label>
            </div>
          )}
        </form>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-access-primary"></div>
            <p className="mt-4 text-gray-600">Searching for accessible places...</p>
          </div>
        )}

        {searched && !loading && listings.length === 0 && (
          <div className="text-center py-12 bg-blue-50 rounded-lg border border-blue-200">
            <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No listings found</h3>
            <p className="text-gray-600 mb-4">
              Help build the database! Submit an accessibility report for a place you know.
            </p>
            <a href="#report" className="inline-block px-6 py-2 bg-access-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Submit a Report
            </a>
          </div>
        )}

        {listings.length > 0 && (
          <div>
            <p className="text-gray-600 mb-6 font-medium">Found {listings.length} accessible listing{listings.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <PropertyCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
