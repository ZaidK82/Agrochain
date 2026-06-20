"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"
import Link from "next/link"

interface Props {
  data: {
    resilience_score: number
    risk_level: string
    climate_risk: number
    water_risk: number
    soil_risk: number
    yield_volatility: number
  }
  variant?: "compact" | "detailed"
}

export default function ResilienceScore({ data, variant = "detailed" }: Props) {
  // Normalize score from 0-100 scale to 0-1 for calculations
  const normalizedScore = data.resilience_score / 100

  const radarData = [
    { subject: "Climate", value: 1 - data.climate_risk, fullMark: 1 },
    { subject: "Water", value: 1 - data.water_risk, fullMark: 1 },
    { subject: "Soil", value: 1 - data.soil_risk, fullMark: 1 },
    { subject: "Yield Stability", value: 1 - data.yield_volatility, fullMark: 1 },
  ]

  const getScoreColor = () => {
    if (data.resilience_score >= 70) return "text-green-600"
    if (data.resilience_score >= 40) return "text-yellow-500"
    return "text-red-600"
  }

  const getRiskBadge = () => {
    if (data.risk_level === "High") return "bg-green-100 text-green-700"
    if (data.risk_level === "Moderate") return "bg-yellow-100 text-yellow-700"
    return "bg-red-100 text-red-700"
  }

  const getRadarColor = () => {
    if (data.resilience_score >= 70) return "#16a34a"
    if (data.resilience_score >= 40) return "#ca8a04"
    return "#dc2626"
  }

  // Compact view
  if (variant === "compact") {
    return (
      <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 animate-scaleIn">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Resilience Overview</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskBadge()}`}>
            {data.risk_level} Risk
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={getRadarColor()}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 54 * normalizedScore} ${2 * Math.PI * 54 * (1 - normalizedScore)}`}
                strokeDashoffset={2 * Math.PI * 54 * 0.25}
                transform="rotate(-90 60 60)"
              />
              <text x="60" y="65" textAnchor="middle" className="text-2xl font-bold" fill="currentColor">
                {data.resilience_score.toFixed(0)}
              </text>
            </svg>
          </div>
          
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              {data.risk_level === "High" 
                ? "Your farm shows strong resilience against climate and market variations"
                : data.risk_level === "Moderate"
                ? "Your farm has moderate resilience - consider improvement measures"
                : "Your farm needs attention to improve resilience factors"}
            </p>
            <Link 
              href="/resilience" 
              className="inline-block mt-2 text-sm text-green-600 hover:text-green-700 font-medium transition-all hover-lift"
            >
              View Detailed Analysis →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Detailed view (full original component)
  return (
    <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 animate-scaleIn">
      {/* Header with badge */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Resilience Analysis</h2>
          <p className="text-gray-500 text-sm">AI-Powered Risk Assessment</p>
        </div>
        <span className={`px-4 py-1 rounded-full text-sm font-medium ${getRiskBadge()}`}>
          {data.risk_level} Risk
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left - Score Display */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            {/* Circular progress background */}
            <div className="w-48 h-48 rounded-full bg-gray-100 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-white flex items-center justify-center shadow-inner">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Resilience Score</p>
                  <p className={`text-5xl font-bold ${getScoreColor()}`}>
                    {data.resilience_score.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">out of 100</p>
                </div>
              </div>
            </div>
            {/* Decorative ring */}
            <svg className="absolute top-0 left-0 w-48 h-48" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="4"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={getRadarColor()}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 54 * normalizedScore} ${2 * Math.PI * 54 * (1 - normalizedScore)}`}
                strokeDashoffset={2 * Math.PI * 54 * 0.25}
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
          </div>
          
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {data.risk_level === "High" ? "High Stability" : 
               data.risk_level === "Moderate" ? "Moderate Stability" : "Low Stability"}
            </p>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              {data.risk_level === "High" 
                ? "Your farm shows strong resilience against climate and market variations"
                : data.risk_level === "Moderate"
                ? "Your farm has moderate resilience - consider improvement measures"
                : "Your farm needs attention to improve resilience factors"}
            </p>
          </div>
        </div>

        {/* Right - Radar Chart */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Resilience Factors</h3>
          <div className="h-72 animate-fadeIn">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  domain={[0, 1]} 
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  tickCount={5}
                />
                <Radar
                  name="Resilience"
                  dataKey="value"
                  stroke={getRadarColor()}
                  fill={getRadarColor()}
                  fillOpacity={0.3}
                  animationDuration={500}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Factor Legend */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-600">
                Climate: {((1 - data.climate_risk) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <span className="text-xs text-gray-600">
                Water: {((1 - data.water_risk) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-xs text-gray-600">
                Soil: {((1 - data.soil_risk) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-gray-600">
                Yield Stability: {((1 - data.yield_volatility) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Breakdown */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Risk Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 hover-scale transition-all">
            <p className="text-xs text-gray-500 mb-1">Climate Risk</p>
            <p className="text-lg font-semibold text-gray-800">
              {(data.climate_risk * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 hover-scale transition-all">
            <p className="text-xs text-gray-500 mb-1">Water Risk</p>
            <p className="text-lg font-semibold text-gray-800">
              {(data.water_risk * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 hover-scale transition-all">
            <p className="text-xs text-gray-500 mb-1">Soil Risk</p>
            <p className="text-lg font-semibold text-gray-800">
              {(data.soil_risk * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 hover-scale transition-all">
            <p className="text-xs text-gray-500 mb-1">Yield Volatility</p>
            <p className="text-lg font-semibold text-gray-800">
              {(data.yield_volatility * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
          <details>
            <summary className="cursor-pointer font-medium text-xs">Debug Info</summary>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}