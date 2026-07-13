import { MapPin, CheckCircle2 } from 'lucide-react'

export default function PropertyCard({ property }) {
  const features = []
  if (property.features.zeroStepEntry) features.push('Zero-step entry')
  if (property.features.rollInShower) features.push('Roll-in shower')
  if (property.features.wideDoors) features.push('Wide doors')
  if (property.features.wavAvailable) features.push('WAV available')
  if (property.features.elevatorAccess) features.push('Elevator access')

  return (
    <div className="card">
      <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center rounded-lg mb-4">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">🏨 {property.title}</p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-1">{property.title}</h3>
      <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
        <MapPin className="w-4 h-4" />
        {property.location}
      </p>

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Accessibility Features:</p>
        <div className="space-y-1">
          {features.length > 0 ? (
            features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No specific features reported</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between py-3 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-500">Verified on</p>
          <p className="text-sm font-semibold text-gray-900">{new Date(property.date).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span className="text-xs font-medium text-success">On-Chain</span>
        </div>
      </div>

      <button className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
        View Details
      </button>
    </div>
  )
}
