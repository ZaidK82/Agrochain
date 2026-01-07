// src/components/screens/YieldPrediction.tsx
'use client'

import { QrCode, Shield, BarChart3, AlertTriangle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

export default function YieldPrediction({ crop }) {
  const { isOnline } = useAppStore()
  
  return (
    <div className="space-y-6">
      {/* Main Yield Display */}
      <div className="text-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
        <h2 className="text-gray-600 mb-2">Expected Yield for {crop.name}</h2>
        <div className="text-5xl font-bold text-green-700 mb-2">
          2,450 kg/ha
        </div>
        <p className="text-gray-500">Based on current conditions</p>
      </div>
      
      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Normal Yield</p>
          <p className="text-xl font-bold">2,300 kg/ha</p>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-gray-600">Climate Impact</p>
          <p className="text-xl font-bold text-green-600">+150 kg/ha</p>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-gray-600">Risk Level</p>
          <p className="text-xl font-bold">Low</p>
        </div>
      </div>
      
      {/* Explainability Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
          <BarChart3 className="w-5 h-5" />
          How We Calculate
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <span>Rainfall anomaly: Normal (+2%)</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <span>Soil health: Good</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
            <span>Temperature stress: Low</span>
          </li>
        </ul>
      </div>
      
      {/* Trust Section */}
      <div className="bg-white border border-green-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Shield className="w-5 h-5 text-green-600" />
            Prediction Verified
          </h3>
          <span className="text-sm text-gray-500">ID: AGRO123456</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Generated on: 15 Oct 2024</p>
            <p className="text-sm text-gray-600">Data has not been altered</p>
          </div>
          
          <div className="text-center">
            <QrCode className="w-20 h-20 mx-auto mb-2" />
            <button className="text-sm text-green-600 font-medium">
              Verify this prediction
            </button>
          </div>
        </div>
      </div>
      
      {/* Offline Notice */}
      {!isOnline && (
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-gray-600 text-sm">
            Last synced: 14 Oct 2024, 10:30 AM
          </p>
        </div>
      )}
    </div>
  )
}