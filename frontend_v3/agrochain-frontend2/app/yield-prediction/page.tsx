'use client'

import { useState } from 'react'
import { YieldPrediction } from '@/app/components/Predictions/YieldPrediction'
import { 
  BarChart3, 
  Calendar, 
  MapPin, 
  Droplets,
  Thermometer,
  Wind
} from 'lucide-react'

export default function YieldPredictionPage() {
  const [formData, setFormData] = useState({
    crop: 'Soybean',
    variety: 'JS 9560',
    location: 'Nagpur',
    area: 5,
    soilType: 'Medium Black',
    plantingDate: '2026-06-20',
    irrigation: 'Rainfed',
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <BarChart3 className="w-8 h-8 text-agro-green" />
            <h1 className="text-3xl font-bold text-gray-900">Yield Prediction</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get AI-powered yield forecasts with confidence scores, risk assessment, 
            and actionable recommendations for your crops
          </p>
        </div>

        {/* Configuration Card */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Configure Your Prediction
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Crop Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Crop
              </label>
              <select
                value={formData.crop}
                onChange={(e) => setFormData({...formData, crop: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agro-green focus:border-transparent"
              >
                <option value="Soybean">Soybean</option>
                <option value="Wheat">Wheat</option>
                <option value="Rice">Rice</option>
                <option value="Cotton">Cotton</option>
                <option value="Maize">Maize</option>
                <option value="Pigeon Pea">Pigeon Pea</option>
              </select>
            </div>

            {/* Variety */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variety
              </label>
              <input
                type="text"
                value={formData.variety}
                onChange={(e) => setFormData({...formData, variety: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agro-green focus:border-transparent"
                placeholder="Enter crop variety"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </div>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agro-green focus:border-transparent"
                placeholder="Enter farm location"
              />
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area (acres)
              </label>
              <input
                type="number"
                value={formData.area}
                onChange={(e) => setFormData({...formData, area: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agro-green focus:border-transparent"
                min="0.1"
                step="0.1"
              />
            </div>

            {/* Soil Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Soil Type
              </label>
              <select
                value={formData.soilType}
                onChange={(e) => setFormData({...formData, soilType: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agro-green focus:border-transparent"
              >
                <option value="Medium Black">Medium Black</option>
                <option value="Deep Black">Deep Black</option>
                <option value="Red Soil">Red Soil</option>
                <option value="Alluvial">Alluvial</option>
                <option value="Laterite">Laterite</option>
              </select>
            </div>

            {/* Planting Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Planting Date
                </div>
              </label>
              <input
                type="date"
                value={formData.plantingDate}
                onChange={(e) => setFormData({...formData, plantingDate: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agro-green focus:border-transparent"
              />
            </div>

            {/* Irrigation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  Irrigation Type
                </div>
              </label>
              <select
                value={formData.irrigation}
                onChange={(e) => setFormData({...formData, irrigation: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agro-green focus:border-transparent"
              >
                <option value="Rainfed">Rainfed</option>
                <option value="Drip">Drip Irrigation</option>
                <option value="Sprinkler">Sprinkler</option>
                <option value="Flood">Flood Irrigation</option>
                <option value="Canal">Canal</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Using Real-time Data</h3>
                <p className="text-sm text-gray-600">
                  Predictions include current weather, soil moisture, and market conditions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Yield Prediction Component */}
        <YieldPrediction {...formData} />

        {/* Historical Data */}
        <div className="card mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Historical Yield Data
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Year</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Yield (kg/acre)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Rainfall (mm)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Temperature (°C)</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Soil Score</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { year: '2022', yield: 1150, rainfall: 850, temp: 28.5, soil: 78 },
                  { year: '2023', yield: 1180, rainfall: 920, temp: 27.8, soil: 82 },
                  { year: '2024', yield: 1220, rainfall: 880, temp: 29.2, soil: 85 },
                  { year: '2025', yield: 1280, rainfall: 950, temp: 28.9, soil: 88 },
                ].map((row) => (
                  <tr key={row.year} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{row.year}</td>
                    <td className="py-3 px-4 font-medium">{row.yield.toLocaleString()}</td>
                    <td className="py-3 px-4">{row.rainfall}</td>
                    <td className="py-3 px-4">{row.temp}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-agro-green h-2 rounded-full"
                            style={{ width: `${row.soil}%` }}
                          />
                        </div>
                        <span>{row.soil}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}