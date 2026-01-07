import { Leaf, ThermometerSun, Droplets, Calendar } from 'lucide-react'

interface FarmHealthCardProps {
  score: number
  lastCrop: string
  moisture: string
  nextAction: string
}

export function FarmHealthCard({ 
  score, 
  lastCrop, 
  moisture, 
  nextAction 
}: FarmHealthCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Your Farm Health</h2>
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-agro-green" />
          <span className="text-2xl font-bold text-agro-green">{score}</span>
          <span className="text-gray-500">/100</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <ThermometerSun className="w-5 h-5 text-agro-brown" />
          <div>
            <p className="text-sm text-gray-600">Last Crop</p>
            <p className="font-medium">{lastCrop}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Droplets className="w-5 h-5 text-agro-blue" />
          <div>
            <p className="text-sm text-gray-600">Soil Moisture</p>
            <p className="font-medium">{moisture}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-agro-yellow" />
          <div>
            <p className="text-sm text-gray-600">Next Action</p>
            <p className="font-medium">{nextAction}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Soil Health Progress</span>
          <span className="text-sm font-medium text-agro-green">+8% this month</span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-agro-green h-2 rounded-full transition-all duration-500"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  )
}