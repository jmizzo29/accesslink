import { useState } from 'react'
import { Upload, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ReportSection() {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    notes: '',
    zeroStepEntry: false,
    rollInShower: false,
    wideDoors: false,
    wavAvailable: false,
    elevatorAccess: false,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Save to localStorage
      const reports = JSON.parse(localStorage.getItem('accesslink_reports') || '[]')
      reports.push({
        ...formData,
        id: Date.now(),
        submittedAt: new Date().toISOString()
      })
      localStorage.setItem('accesslink_reports', JSON.stringify(reports))
      
      setSuccess(true)
      setFormData({
        title: '',
        location: '',
        notes: '',
        zeroStepEntry: false,
        rollInShower: false,
        wideDoors: false,
        wavAvailable: false,
        elevatorAccess: false,
      })
      
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError('Failed to submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="report" className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">Help Build the Database</h2>
        <p className="text-lg text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Submit accessibility reports for places you've visited. Your community data helps other wheelchair users find truly accessible travel options.
        </p>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="card">
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Report submitted successfully!</p>
                  <p className="text-sm text-green-700">Your accessibility data will be verified by the community and logged on-chain.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Property Name *
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  placeholder="e.g., Downtown Hotel, Beach House Airbnb"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    id="location"
                    type="text"
                    required
                    placeholder="City, State"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Accessibility Notes
              </label>
              <textarea
                id="notes"
                rows="4"
                placeholder="Describe the accessibility features, layout, parking, common areas, staff helpfulness, any challenges..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input"
              />
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-gray-900 mb-3">Accessibility Features</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      checked={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Your report will be reviewed by the community. Verified reports are logged on the Monad blockchain.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
