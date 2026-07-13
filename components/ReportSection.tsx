'use client';

import { useState } from 'react';
import { Upload, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { submitReport } from '@/lib/supabase-client';

export function ReportSection() {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    notes: '',
    zeroStepEntry: false,
    rollInShower: false,
    wideDoors: false,
    wavAvailable: false,
    elevatorAccess: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await submitReport({
        title: formData.title,
        location: formData.location,
        notes: formData.notes,
        zero_step_entry: formData.zeroStepEntry,
        roll_in_shower: formData.rollInShower,
        wide_doors: formData.wideDoors,
        wav_available: formData.wavAvailable,
        elevator_access: formData.elevatorAccess,
      });
      
      setSuccess(true);
      setFormData({
        title: '',
        location: '',
        notes: '',
        zeroStepEntry: false,
        rollInShower: false,
        wideDoors: false,
        wavAvailable: false,
        elevatorAccess: false,
      });
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError('Failed to submit report. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="report" className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">Help Build the Database</h2>
        <p className="text-lg text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Submit accessibility reports for places you've visited. Your community data helps other wheelchair users find truly accessible travel options.
        </p>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-access-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Report submitted successfully!</p>
                  <p className="text-sm text-green-700">Your accessibility data will be verified by the community and logged on-chain.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-access-primary focus:border-transparent"
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-access-primary focus:border-transparent"
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
                rows={4}
                placeholder="Describe the accessibility features, layout, parking, common areas, staff helpfulness, any challenges you encountered..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-access-primary focus:border-transparent"
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
                ].map((feature) => (
                  <label key={feature.key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData[feature.key as keyof typeof formData] as boolean}
                      onChange={(e) => setFormData({ ...formData, [feature.key]: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 accent-access-primary"
                    />
                    <span className="text-sm text-gray-700">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-access-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
  );
}
