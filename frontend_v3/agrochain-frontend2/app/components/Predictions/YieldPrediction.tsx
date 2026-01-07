'use client'

import { useState } from 'react'
import { 
  TrendingUp, 
  Thermometer, 
  Droplets, 
  Wind, 
  Calendar,
  AlertTriangle,
  BarChart3
} from 'lucide-react'
import { LoadingSpinner } from '@/app/components/Shared/LoadingSpinner'

interface YieldPredictionProps {
  crop: string
  variety: string
  location: string
  area: number
  soilType: string
}

export function YieldPrediction({
  crop = 'Soybean',
  variety = 'JS 9560',
  location = 'Nagpur',
  area = 5,
  soilType = 'Medium Black'
}: YieldPredictionProps) {
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState({
    yield: 1250,
    unit: 'kg/acre',
    confidence: 85,
    range: [1100, 1400],
    factors: [
      { name: 'Soil Fertility', score: 82, impact: '+8%' },
      { name: 'Rainfall Match', score: 90, impact: '+12%' },
      { name: 'Temperature', score: 75, impact: '+5%' },
      { name: 'Crop Health', score: 88, impact: '+10%' },
    ],
    risks: [
      { type: 'Pest', probability: 'Medium', impact: '-15%' },
      { type: 'Disease', probability: 'Low', impact: '-8%' },
      { type: 'Weather', probability: 'High', impact: '-20%' },
    ],
    recommendations: [
      'Apply recommended fertilizer in week 3',
      'Monitor for Helicoverpa pest in flowering stage',
      'Ensure proper drainage during heavy rainfall',
    ],
    historicalComparison: [
      { year: '2023', yield: 1180, avg: 1200 },
      { year: '2024', yield: 1220, avg: 1250 },
      { year: '2025', yield: 1280, avg: 1250 },
      { year: '2026', yield: 1250, avg: 1270 },
    ]
  })

  const simulatePrediction = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      // In real app, this would come from API
    }, 2000)
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Yield Prediction
        </h2>
        <p className="text-gray-600">
          AI-powered yield forecast for your {crop} crop
        </p>
      </div>

      {/* Farm Details Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-sm text-gray-600">Crop</p>
          <p className="font-medium">{crop} ({variety})</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Location</p>
          <p className="font-medium">{location}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Area</p>
          <p className="font-medium">{area} acres</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Soil Type</p>
          <p className="font-medium">{soilType}</p>
        </div>
      </div>

      {/* Predict Button */}
      <button
        onClick={simulatePrediction}
        disabled={loading}
        className="w-full btn-primary mb-6 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" color="text-white" />
            Predicting Yield...
          </>
        ) : (
          <>
            <BarChart3 className="w-5 h-5" />
            Predict Yield for This Season
          </>
        )}
      </button>

      {/* Prediction Result */}
      <div className="space-y-6">
        {/* Main Yield Display */}
        <div className="text-center p-6 bg-gradient-to-br from-agro-green/5 to-agro-blue/5 rounded-xl">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {prediction.yield.toLocaleString()}
          </div>
          <div className="text-2xl text-gray-600 mb-4">{prediction.unit}</div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-agro-green/10 text-agro-green rounded-full">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">85% Confidence</span>
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Range: {prediction.range[0]} - {prediction.range[1]} {prediction.unit}
          </div>
        </div>

        {/* Yield Factors */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Yield Factors</h3>
          <div className="space-y-3">
            {prediction.factors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-agro-green/10 rounded-lg flex items-center justify-center">
                    {index === 0 && <Thermometer className="w-4 h-4 text-agro-green" />}
                    {index === 1 && <Droplets className="w-4 h-4 text-agro-green" />}
                    {index === 2 && <Wind className="w-4 h-4 text-agro-green" />}
                    {index === 3 && <Calendar className="w-4 h-4 text-agro-green" />}
                  </div>
                  <span className="font-medium">{factor.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-agro-green h-2 rounded-full"
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>
                  <span className="font-bold text-agro-green">{factor.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessment */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Risk Assessment
          </h3>
          <div className="space-y-3">
            {prediction.risks.map((risk, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50">
                <div>
                  <div className="font-medium text-gray-900">{risk.type}</div>
                  <div className="text-sm text-gray-600">
                    Probability: {risk.probability}
                  </div>
                </div>
                <div className="text-red-600 font-bold">{risk.impact}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-2">
            {prediction.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 bg-agro-blue text-white rounded-full flex items-center justify-center text-sm">
                  {index + 1}
                </div>
                <p className="text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Comparison */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Historical Comparison</h3>
          <div className="space-y-3">
            {prediction.historicalComparison.map((year, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-600">{year.year}</span>
                <div className="flex items-center gap-4">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${year.yield > year.avg ? 'bg-agro-green' : 'bg-yellow-500'}`}
                      style={{ width: `${(year.yield / 1500) * 100}%` }}
                    />
                  </div>
                  <span className="font-medium w-16 text-right">
                    {year.yield} kg
                  </span>
                  <span className={`text-sm ${year.yield > year.avg ? 'text-agro-green' : 'text-red-600'}`}>
                    {year.yield > year.avg ? '+' : ''}{year.yield - year.avg}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <button className="flex-1 btn-secondary">
            Download Report
          </button>
          <button className="flex-1 btn-primary">
            Save Prediction
          </button>
        </div>
      </div>
    </div>
  )
}