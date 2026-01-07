'use client'

import { useParams } from 'next/navigation'
import { QRCodeDisplay } from '@/app/components/Shared/QRCodeDisplay'
import { 
  CheckCircle, 
  Shield, 
  Clock, 
  Download,
  ExternalLink,
  Copy
} from 'lucide-react'
import { useState } from 'react'

export default function VerifyPage() {
  const params = useParams()
  const id = params.id as string
  const [copied, setCopied] = useState(false)

  const verificationData = {
    id: `AG-${id}`,
    type: 'Yield Prediction',
    date: '15 March 2026, 10:30:12 IST',
    farmer: 'FARM-3A8C',
    location: 'Nagpur district',
    crop: 'Soybean',
    prediction: '1,250 kg/acre',
    confidence: '80%',
    transactionHash: '0x7b2f9a4c8e5d6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a',
    blockNumber: 42871563,
    timestamp: '2026-06-15T10:30:12Z',
    network: 'Polygon Mainnet',
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(verificationData.transactionHash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.log('Failed to copy:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-agro-green/10 text-agro-green rounded-full mb-4">
            <Shield className="w-5 h-5" />
            <span className="font-medium">AgroChain Verified</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Blockchain Verification
          </h1>
          <p className="text-gray-600">
            This record has been securely stored on the Polygon blockchain
          </p>
        </div>

        {/* Verification Card */}
        <div className="card mb-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Verification Details
              </h2>
              <div className="space-y-3">
                {Object.entries({
                  'Record ID': verificationData.id,
                  'Type': verificationData.type,
                  'Date': verificationData.date,
                  'Farmer': verificationData.farmer,
                  'Location': verificationData.location,
                  'Crop': verificationData.crop,
                  'Prediction': verificationData.prediction,
                  'Confidence': verificationData.confidence,
                }).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">{key}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Blockchain Proof */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Blockchain Footprint
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction</span>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm text-agro-purple">
                      {verificationData.transactionHash.slice(0, 16)}...
                    </code>
                    <button
                      onClick={copyToClipboard}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Block</span>
                  <span className="font-mono font-medium">
                    #{verificationData.blockNumber.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Timestamp</span>
                  <span className="font-medium">
                    {new Date(verificationData.timestamp).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Network</span>
                  <span className="font-medium text-agro-purple">
                    {verificationData.network}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Gas Used</span>
                  <span className="font-medium">0.001 MATIC</span>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <a
                  href={`https://polygonscan.com/tx/${verificationData.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 btn-secondary flex items-center justify-center gap-2 py-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Polygonscan
                </a>
                <button className="flex-1 btn-primary flex items-center justify-center gap-2 py-2">
                  <Download className="w-4 h-4" />
                  Download Receipt
                </button>
              </div>
            </div>

            {copied && (
              <div className="p-3 bg-green-50 text-green-800 rounded-lg border border-green-200 text-center">
                Transaction hash copied to clipboard!
              </div>
            )}
          </div>
        </div>

        {/* QR Code */}
        <div className="mb-6">
          <QRCodeDisplay 
            value={`https://verify.agrochain.in/${id}`}
            title="Share Verification"
          />
        </div>

        {/* Verification Levels */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Verification Depth
          </h2>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Verification Score</span>
              <span className="font-bold text-agro-green">80/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-agro-green h-3 rounded-full transition-all duration-500"
                style={{ width: '80%' }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Prediction recorded', status: 'verified' },
              { label: 'Location validated', status: 'verified' },
              { label: 'Timestamp secured', status: 'verified' },
              { label: 'Third-party audit', status: 'pending' },
              { label: 'Government cross-check', status: 'pending' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  {item.status === 'verified' ? (
                    <CheckCircle className="w-5 h-5 text-agro-green" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className="font-medium text-gray-900">{item.label}</span>
                </div>
                <span className={`chip ${
                  item.status === 'verified' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.status === 'verified' ? 'Verified' : 'Pending'}
                </span>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 btn-primary">
            Request Additional Verification
          </button>
        </div>
      </div>
    </div>
  )
}