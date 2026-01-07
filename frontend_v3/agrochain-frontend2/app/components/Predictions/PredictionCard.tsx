import { CheckCircle, BarChart3, Thermometer, TrendingUp, Calendar, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import type { Prediction } from '@/lib/types'

interface PredictionCardProps {
  prediction: Prediction
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const reasons = [
    { icon: Thermometer, text: 'Soil pH optimal (6.5-7.0)' },
    { icon: BarChart3, text: '85% rainfall match' },
    { icon: TrendingUp, text: 'Market demand high' },
  ]

  const risks = [
    { icon: Calendar, text: 'Late monsoon possible' },
    { icon: AlertTriangle, text: 'Pest alert in neighboring areas' },
  ]

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-agro-green/10 rounded-lg">
            <span className="text-2xl">🌱</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {prediction.crop.name}
            </h2>
            <p className="text-sm text-gray-600">
              {prediction.crop.variety}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-agro-green">
            {prediction.matchScore}/100
          </div>
          <div className="text-sm text-gray-600">Match Score</div>
        </div>
      </div>

      {/* Match Score Visual */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Recommendation Strength</span>
          <span className="font-medium text-agro-green">
            {prediction.confidence}% confidence
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-agro-green h-3 rounded-full transition-all duration-500"
            style={{ width: `${prediction.matchScore}%` }}
          />
        </div>
      </div>

      {/* Yield Prediction */}
      <div className="mb-6 p-4 bg-agro-green/5 rounded-lg">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {prediction.yield} {prediction.unit}
          </div>
          <div className="text-sm text-gray-600">
            Expected Yield
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Confidence: ±{Math.round(prediction.yield * 0.15)} {prediction.unit}
          </div>
        </div>
      </div>

      {/* Why This Works */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-agro-green">✓</span>
          Why This Crop Works
        </h3>
        <div className="space-y-2">
          {reasons.map((reason, index) => {
            const Icon = reason.icon
            return (
              <div key={index} className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-agro-green" />
                <span className="text-sm text-gray-700">{reason.text}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Risks */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-red-600">⚠️</span>
          Risks to Consider
        </h3>
        <div className="space-y-2">
          {risks.map((risk, index) => {
            const Icon = risk.icon
            return (
              <div key={index} className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-700">{risk.text}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Best Sowing Date */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900">Best Sowing Window</div>
            <div className="text-sm text-gray-600">
              {prediction.bestSowingDate}
            </div>
          </div>
          <Calendar className="w-5 h-5 text-agro-blue" />
        </div>
      </div>

      {/* Blockchain Verification */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-agro-green" />
            <span className="font-medium text-gray-900">
              Secure Prediction
            </span>
          </div>
          <span className="chip bg-agro-green/10 text-agro-green">
            Verified
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          This recommendation is verifiably recorded on blockchain.
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Verification ID</span>
            <code className="font-mono text-agro-purple">
              {prediction.verification.id}
            </code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Recorded</span>
            <span className="text-gray-900">
              {new Date(prediction.verification.timestamp).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <Link
            href={`/verify/${prediction.verification.id}`}
            className="flex-1 btn-secondary text-center py-2"
          >
            View Blockchain Proof
          </Link>
          <button className="flex-1 btn-primary py-2">
            Register This Crop
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Link
          href="/predict/detailed"
          className="text-center text-agro-blue hover:text-agro-blue-dark font-medium py-2"
        >
          View Detailed Analysis →
        </Link>
        <button className="text-center text-gray-600 hover:text-gray-900 py-2">
          Compare Varieties
        </button>
      </div>
    </div>
  )
}