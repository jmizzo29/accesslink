'use client';

import { MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export function PropertyCard({ listing }: { listing: any }) {
  const accessibilityFeatures = [];
  if (listing.zero_step_entry) accessibilityFeatures.push('Zero-step entry');
  if (listing.roll_in_shower) accessibilityFeatures.push('Roll-in shower');
  if (listing.wide_doors) accessibilityFeatures.push('Wide doors');
  if (listing.wav_available) accessibilityFeatures.push('WAV available');
  if (listing.elevator_access) accessibilityFeatures.push('Elevator access');

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Image placeholder */}
      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Property Photo</p>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{listing.title}</h3>
        <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {listing.location}
        </p>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Accessibility Features:</p>
          <div className="space-y-1">
            {accessibilityFeatures.length > 0 ? (
              accessibilityFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-access-success flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No specific features reported</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 py-3 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-500">Verified on</p>
            <p className="text-sm font-semibold text-gray-900">{new Date(listing.created_at).toLocaleDateString()}</p>
          </div>
          {listing.verified_on_chain && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-access-success" />
              <span className="text-xs font-medium text-access-success">On-Chain</span>
            </div>
          )}
        </div>

        <button className="w-full px-4 py-2 bg-access-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}
