import { useState, useEffect } from 'react'
import { Search, Filter, AlertCircle } from 'lucide-react'
import PropertyCard from './PropertyCard'

const SAMPLE_PROPERTIES = [
  {
    id: 1,
    title: "Accessible Downtown Hotel",
    location: "New York, NY",
    features: { zeroStepEntry: true, rollInShower: true, wideDoors: true, wavAvailable: false, elevatorAccess: true },
    date: "2026-07-10"
  },
  {
    id: 2,
    title: "Beach View Accessible Airbnb",
    location: "San Francisco, CA",
    features: { zeroStepEntry: true, rollInShower: true, wideDoors: true, wavAvailable: true, elevatorAccess: false },
    date: "2026-07-08"
  },
  {
    id: 3,
    title: "Mountain Retreat Cabin",
    location: "Denver, CO",
    features: { zeroStepEntry: false, rollInShower: false, wideDoors: true, wavAvailable: false, elevatorAccess: true },
    date: "2026-07-05"
  },
  {
    id: 4,
    title: "Airport Hotel with WAV",
    location: "Los Angeles, CA",
    features: { zeroStepEntry: true, rollInShower: true, wideDoors: true, wavAvailable: true, elevatorAccess: true },
    date: "2026-07-03"
  },
  {
    id: 5,
    title: "Accessible Resort",
    location: "Miami, FL",
    features: { zeroStepEntry: true, rollInShower: true, wideDoors: true, wavAvailable: false, elevatorAccess: true },
    date: "2026-07-01"
  }
]

export default function SearchSection() {
  const [listings, setListings] = useState([])
  const [searched, setSearched] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    location: '',
    zeroStepEntry: false,
    rollInShower: false,
    wideDoors: false,
    wavAvailable: false,
    elevatorAccess: false,
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setSearched(true)

    let results = SAMPLE_PROPERTIES

    if (filters.location) {
      results = results.filter(p => 
        p.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    if (filters.zeroStepEntry) results = results.filter(p => p.features.zeroStepEntry)
    if (filters.rollInShower) results = results.filter(p => p.features.rollInShower)
    if (filters.wideDoors) results = results.filter(p => p.features.wideDoors)
    if (filters.wavAvailable) results = results.filter(p => p.features.wavAvailable)
    if (filters.elevatorAccess) results = results.filter(p => p.features.elevatorAccess)

    setListings(results)
  }

  const filterActive = Object.values(filters).some(v => v === true || (typeof v === 'string' && v !== ''))

  return (
    <section id="search" className="py-12 sm:py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">Find Accessible Places</h2>
        
        <form onSubmit={handleSearch} className="bg-gray-50 p-6 sm:p-8 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location / City
              </label>
              <input
                id="location"
                type="text"
                placeholder="e.g., New York, San Francisco"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="input"
              />
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
              className="sm:col-span-1 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white rounded-lg border border-gray-200">
              {[
                { key: 'zeroStepEntry', label: 'Zero-step entry' },
                { key: 'rollInShower', label: 'Roll-in shower' },
                { key: 'wideDoors', label: 'Wide doors (≥36")' },
                { key: 'wavAvailable', label: 'WAV available' },
                { key: 'elevatorAccess', label: 'Elevator/lift access' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters[key]}
                    onChange={(e) => setFilters({ ...filters, [key]: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
          )}
        </form>

        {searched && listings.length === 0 && (
          <div className="text-center py-12 bg-blue-50 rounded-lg border border-blue-200">
            <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No listings found</h3>
            <p className="text-gray-600 mb-4">
              Help build the database! Submit an accessibility report for a place you know.
            </p>
            <a href="#report" className="inline-block px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Submit a Report
            </a>
          </div>
        )}

        {listings.length > 0 && (
          <div>
            <p className="text-gray-600 mb-6 font-medium">Found {listings.length} accessible listing{listings.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <PropertyCard key={listing.id} property={listing} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
