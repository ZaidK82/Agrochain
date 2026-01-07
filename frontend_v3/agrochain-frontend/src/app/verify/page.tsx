// src/app/verify/page.tsx
'use client'

import { QrCode, Key, CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'

export default function VerifyPage() {
  const [verificationId, setVerificationId] = useState('')
  const [result, setResult] = useState(null)
  
  const handleVerify = () => {
    // Mock verification
    setResult({
      valid: true,
      date: '15 Oct 2024',
      details: 'Crop prediction for Wheat in Maharashtra',
      predictionId: 'AGRO123456'
    })
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Verify Prediction</h1>
      
      {/* Verification Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QR Scanner Option */}
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
            <QrCode className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="font-semibold mb-2">Scan QR Code</h3>
          <p className="text-gray-600 text-sm mb-4">
            Scan the QR code from any prediction
          </p>
          <button className="w-full py-3 bg-green-600 text-white rounded-lg">
            Open Scanner
          </button>
        </div>
        
        {/* Manual Entry Option */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
            <Key className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="font-semibold mb-2 text-center">Enter ID Manually</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter Prediction ID"
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={verificationId}
              onChange={(e) => setVerificationId(e.target.value)}
            />
            <button 
              onClick={handleVerify}
              className="w-full py-3 bg-green-600 text-white rounded-lg"
            >
              Verify Now
            </button>
          </div>
        </div>
      </div>
      
      {/* Verification Result */}
      {result && (
        <div className={`rounded-xl p-6 ${
          result.valid 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            {result.valid ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
            <div>
              <h3 className="font-bold">
                {result.valid ? 'Verification Successful' : 'Verification Failed'}
              </h3>
              <p className="text-sm text-gray-600">
                {result.valid ? 'This prediction is authentic' : 'Could not verify this prediction'}
              </p>
            </div>
          </div>
          
          {result.valid && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Generated on:</span>
                <span className="font-medium">{result.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Prediction ID:</span>
                <span className="font-medium">{result.predictionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-600">Data has not been altered</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}