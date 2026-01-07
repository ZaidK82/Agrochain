'use client'

import { useState } from 'react'
import { 
  Shield, 
  Droplets, 
  Thermometer, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Leaf
} from 'lucide-react'

interface ResilienceScoreProps {
  score: number
}

export function ResilienceScore({ score = 72 }: ResilienceScoreProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const resilienceAreas = [
    {
      id: 'soil',
      name: 'Soil Health',
      score: 85,
      icon: Leaf,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      factors: [
        { name: 'Organic Carbon', value: '1.8%', status: 'optimal' },
        { name: 'pH Level', value: '6.8', status: 'optimal' },
        { name: 'Nitrogen', value: '280 kg/ha', status: 'adequate' },
        { name: 'Moisture Retention', value: 'High', status: 'good' },
      ],
      recommendations: [
        'Add compost to increase organic carbon to 2.0%',
        'Maintain current pH with annual testing',
      ],
      risk: 'Low',
    },
    {
      id: 'water',
      name: 'Water Resilience',
      score: 65,
      icon: Droplets,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      factors: [
        { name: 'Irrigation Access', value: 'Rainfed', status: 'vulnerable' },
        { name: 'Rainfall Match', value: '85%', status: 'good' },
        { name: 'Drought Tolerance', value: 'Medium', status: 'adequate' },
        { name: 'Water Table', value: '8.2m', status: 'concern' },
      ],
      recommendations: [
        'Consider installing drip irrigation system',
        'Implement rainwater harvesting',
        'Plant drought-tolerant varieties',
      ],
      risk: 'Medium',
    },
    {
      id: 'climate',
      name: 'Climate Resilience',
      score: 70,
      icon: Thermometer,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      factors: [
        { name: 'Temperature Stability', value: 'High', status: 'good' },
        { name: 'Flood Risk', value: 'Low', status: 'optimal' },
        { name: 'Heat Wave Risk', value: 'Medium', status: 'adequate' },
        { name: 'Microclimate', value: 'Protected', status: 'good' },
      ],
      recommendations: [
        'Install weather monitoring system',
        'Create windbreaks with trees',
        'Use mulch for temperature regulation',
      ],
      risk: 'Low',
    },
    {
      id: 'economic',
      name: 'Economic Buffer',
      score: 68,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      factors: [
        { name: 'Crop Diversity', value: '2 crops', status: 'low' },
        { name: 'Market Access', value: 'Good', status: 'good' },
        { name: 'Price Volatility', value: 'Medium', status: 'adequate' },
        { name: 'Input Cost', value: '₹18,500/acre', status: 'high' },
      ],
      recommendations: [
        'Add one more crop to rotation',
        'Explore contract farming',
        'Bulk purchase inputs with neighbors',
      ],
      risk: 'Medium',
    },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <div className="card">
      {/* Overall Score */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <Shield className="w-6 h-6 text-agro-green" />
          <h2 className="text-2xl font-bold text-gray-900">Farm Resilience Score</h2>
        </div>
        
        <div className={`inline-flex flex-col items-center p-8 rounded-2xl ${getScoreBg(score)} border-2`}>
          <div className={`text-6xl font-bold ${getScoreColor(score)} mb-2`}>
            {score}
          </div>
          <div className="text-gray-600">/ 100</div>
          <div className={`mt-4 px-4 py-2 rounded-full font-medium ${
            score >= 80 ? 'bg-green-100 text-green-800' :
            score >= 60 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {score >= 80 ? 'Highly Resilient' : 
             score >= 60 ? 'Moderately Resilient' : 
             'Needs Improvement'}
          </div>
        </div>
      </div>

      {/* Breakdown by Area */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Resilience Breakdown</h3>
        
        {resilienceAreas.map((area) => {
          const Icon = area.icon
          const isExpanded = expandedSection === area.id
          
          return (
            <div key={area.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Area Header */}
              <button
                onClick={() => setExpandedSection(isExpanded ? null : area.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${area.bgColor}`}>
                    <Icon className={`w-5 h-5 ${area.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{area.name}</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getScoreColor(area.score)}`}
                          style={{ width: `${area.score}%` }}
                        />
                      </div>
                      <span className={`font-bold ${getScoreColor(area.score)}`}>
                        {area.score}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={`chip ${
                    area.risk === 'Low' ? 'bg-green-100 text-green-800' :
                    area.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Risk: {area.risk}
                  </div>
                  <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  {/* Factors */}
                  <div className="mb-6">
                    <h5 className="font-medium text-gray-900 mb-3">Key Factors</h5>
                    <div className="grid grid-cols-2 gap-3">
                      {area.factors.map((factor, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-lg border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">{factor.name}</span>
                            {factor.status === 'optimal' ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : factor.status === 'concern' ? (
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <div className="font-medium">{factor.value}</div>
                          <div className={`text-xs ${
                            factor.status === 'optimal' ? 'text-green-600' :
                            factor.status === 'good' ? 'text-blue-600' :
                            factor.status === 'adequate' ? 'text-yellow-600' :
                            factor.status === 'concern' ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {factor.status.charAt(0).toUpperCase() + factor.status.slice(1)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Improvement Actions</h5>
                    <div className="space-y-2">
                      {area.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                          <div className="w-6 h-6 bg-agro-green text-white rounded-full flex items-center justify-center text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-gray-700">{rec}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-500">Impact: +{15 - idx * 3} points</span>
                              <span className="text-xs text-gray-500">Cost: {idx === 0 ? 'Low' : 'Medium'}</span>
                              <span className="text-xs text-gray-500">Time: {idx === 0 ? '1 month' : '3 months'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Action Plan */}
      <div className="mt-8 p-4 bg-agro-green/5 rounded-lg border border-agro-green/20">
        <h3 className="font-semibold text-gray-900 mb-3">Recommended Action Plan</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Add compost to improve soil health</span>
            <span className="text-agro-green font-medium">+8 points</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Install drip irrigation system</span>
            <span className="text-agro-green font-medium">+12 points</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Add maize to crop rotation</span>
            <span className="text-agro-green font-medium">+6 points</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-agro-green/20">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">Expected Score After Implementation</span>
            <span className="text-2xl font-bold text-agro-green">88</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button className="flex-1 btn-secondary">
          Download Resilience Report
        </button>
        <button className="flex-1 btn-primary">
          Start Improvement Plan
        </button>
      </div>
    </div>
  )
}