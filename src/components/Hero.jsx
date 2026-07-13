import { MapPin, Users, CheckCircle } from 'lucide-react'

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-primary to-blue-600 text-white py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          Travel With Confidence & Dignity
        </h1>
        <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto opacity-95">
          AccessLink helps wheelchair users find truly accessible travel options. 
          Search verified Airbnbs, hotels, and airports with real accessibility data 
          from the community.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12">
          <div className="flex flex-col items-center">
            <MapPin className="w-8 h-8 mb-3" />
            <h3 className="font-semibold mb-2">Search Accessible Stays</h3>
            <p className="text-sm opacity-90">Zero-step entry, roll-in showers, wide doors</p>
          </div>
          <div className="flex flex-col items-center">
            <Users className="w-8 h-8 mb-3" />
            <h3 className="font-semibold mb-2">Community Verified</h3>
            <p className="text-sm opacity-90">Real data from wheelchair users like you</p>
          </div>
          <div className="flex flex-col items-center">
            <CheckCircle className="w-8 h-8 mb-3" />
            <h3 className="font-semibold mb-2">Permanent Records</h3>
            <p className="text-sm opacity-90">Verified on blockchain for trust</p>
          </div>
        </div>
      </div>
    </section>
  )
}
