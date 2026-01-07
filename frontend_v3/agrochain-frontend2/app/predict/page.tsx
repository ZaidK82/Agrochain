'use client'

import { useState } from 'react'
import { PredictionCard } from '@/app/components/Predictions/PredictionCard'
import { MapPin, Calendar, Wheat } from 'lucide-react'
import type { Prediction } from '@/lib/types'

const mockPrediction: Prediction = {
  id: '1',
  crop: {
    id: 'soybean',
    name: 'Soybean',
    variety: 'JS 9560',
    matchScore: 84,
  },
  yield: 1250,
  confidence: 80,
  unit: 'kg/acre',
  reasons: [
    'Soil pH optimal (6.5-7.0)',
    '85% rainfall match',
    'Market demand high',
    'Your experience: Grown before',
  ],
  risks: [
    'Late monsoon possible',
    'Pest alert in neighboring areas',
  ],
  bestSowingDate: '20-25 June',
  verification: {
    id: 'AG-7B2F9',
    status: 'verified',
    transactionHash: '0x7b2f9a4c...c4a1',
    timestamp: '2026-06-15T10:30:00Z',
    blockNumber: 42871563,
  },
  createdAt: '2026-06-15T10:30:00Z',
}

const crops = [
  { id: 'soybean', name: 'Soybean', match: 84 },
  { id: 'pigeonpea', name: 'Pigeon Pea', match: 78 },
  { id: 'cotton', name: 'Cotton', match: 72 },
  { id: 'wheat', name: 'Wheat', match: 65 },
]

export default function PredictPage() {
  const [selectedCrop, setSelectedCrop] = useState('soybean')
  const [location, setLocation] = useState('Nagpur')
  const [season, setSeason] = useState('kharif')
  const [area, setArea] = useState(5)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Crop Recommendation Engine
          </h1>
          <p className="text-gray-600">
            Get AI-powered recommendations with blockchain verification
          </p>
        </div>

        {/* Farm Details Form */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Farm Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </div>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agro-green focus:border-transparent"
                  placeholder="Enter location"
                />
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  Use Current
                </button>
              </div>
            </div>

            {/* Season */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Season
                </div>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Kharif', 'Rabi', 'Summer'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSeason(s.toLowerCase())}
                    className={`px-4 py-2 rounded-lg border ${season === s.toLowerCase() ? 'bg-agro-green text-white border-agro-green' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farm Area (acres)
              </label>
              <input
                type="number"
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agro-green focus:border-transparent"
                min="0.1"
                step="0.1"
              />
            </div>

            {/* Previous Crop */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Previous Crop
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agro-green focus:border-transparent">
                <option>Wheat</option>
                <option>Soybean</option>
                <option>Cotton</option>
                <option>Pigeon Pea</option>
              </select>
            </div>
          </div>

          <button className="w-full btn-primary py-3 text-lg">
            Analyze My Farm
          </button>
        </div>

        {/* Top Recommendation */}
        <div className="mb-6">
          <PredictionCard prediction={mockPrediction} />
        </div>

        {/* Other Suitable Crops */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Other Suitable Crops
          </h2>
          <div className="space-y-3">
            {crops.map((crop) => (
              <button
                key={crop.id}
                onClick={() => setSelectedCrop(crop.id)}
                className={`w-full p-4 rounded-lg border ${selectedCrop === crop.id ? 'border-agro-green bg-agro-green/5' : 'border-gray-200 hover:border-agro-green/50'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-agro-green/10 rounded-lg flex items-center justify-center">
                      <Wheat className="w-5 h-5 text-agro-green" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">{crop.name}</h3>
                      <p className="text-sm text-gray-600">Match score: {crop.match}/100</p>
                    </div>
                  </div>
                  <div className={`chip ${crop.match > 75 ? 'bg-green-100 text-green-800' : crop.match > 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                    {crop.match > 75 ? 'Excellent' : crop.match > 60 ? 'Good' : 'Fair'}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <button className="w-full mt-4 text-center text-agro-blue hover:text-agro-blue-dark font-medium py-3">
            See All 8 Suitable Crops →
          </button>
        </div>
      </div>
    </div>
  )
}