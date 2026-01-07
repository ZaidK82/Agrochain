'use client'

import { SupplyChainTrace } from '@/app/components/Traceability/SupplyChainTrace'
import { 
  QrCode,
  Download,
  Share2,
  Eye,
  FileText,
  Package,
  Truck,
  Store,
  User
} from 'lucide-react'
import { useState } from 'react'

export default function TraceabilityPage() {
  const [selectedProduct, setSelectedProduct] = useState('soybean')
  
  const products = [
    {
      id: 'soybean',
      name: 'Soybean',
      batch: 'BATCH-3A8C-2026',
      quantity: '6,250 kg',
      status: 'In Harvest',
      progress: 75,
      lastUpdate: '2 hours ago',
      nftId: 'NFT-AG-7B2F9'
    },
    {
      id: 'wheat',
      name: 'Wheat',
      batch: 'BATCH-2B9D-2025',
      quantity: '4,800 kg',
      status: 'Sold',
      progress: 100,
      lastUpdate: '3 months ago',
      nftId: 'NFT-AG-5C8E3'
    },
    {
      id: 'cotton',
      name: 'Cotton',
      batch: 'BATCH-1A7C-2024',
      quantity: '2,500 kg',
      status: 'Processed',
      progress: 90,
      lastUpdate: '1 year ago',
      nftId: 'NFT-AG-3D9F2'
    }
  ]

  const verificationStats = [
    { label: 'Total Steps', value: '8', icon: Package },
    { label: 'Verified Steps', value: '3', icon: Eye },
    { label: 'Documents', value: '24', icon: FileText },
    { label: 'People Involved', value: '12', icon: User },
    { label: 'Locations', value: '4', icon: Store },
    { label: 'Transport Logs', value: '6', icon: Truck }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Supply Chain Traceability</h1>
              <p className="text-gray-600">
                Track your crops from farm to fork with blockchain verification
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-secondary flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <button className="btn-primary flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share Trace
              </button>
            </div>
          </div>

          {/* Product Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedProduct === product.id 
                    ? 'border-agro-green bg-agro-green/5' 
                    : 'border-gray-200 hover:border-agro-green/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">{product.name}</h3>
                  <div className={`chip ${
                    product.status === 'Sold' ? 'bg-green-100 text-green-800' :
                    product.status === 'In Harvest' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {product.status}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Batch ID</span>
                    <code className="text-sm font-mono">{product.batch}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quantity</span>
                    <span className="font-medium">{product.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">NFT ID</span>
                    <code className="text-sm font-mono">{product.nftId}</code>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{product.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        product.progress === 100 ? 'bg-green-500' :
                        product.progress >= 75 ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }`}
                      style={{ width: `${product.progress}%` }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Stats */}
          <div className="lg:col-span-1">
            {/* Verification Stats */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Verification Statistics
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {verificationStats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                      <Icon className="w-6 h-6 text-agro-green mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 p-4 bg-agro-purple/5 rounded-lg border border-agro-purple/20">
                <h3 className="font-medium text-gray-900 mb-2">Blockchain Verification</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Network</span>
                    <span className="font-medium">Polygon</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Smart Contract</span>
                    <code className="font-mono">0x8a9b...c2d3</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gas Used</span>
                    <span className="font-medium">0.005 MATIC</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-agro-green hover:bg-agro-green/5">
                  <QrCode className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Generate QR Code</div>
                    <div className="text-sm text-gray-600">Share with buyers</div>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-agro-green hover:bg-agro-green/5">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">View Documents</div>
                    <div className="text-sm text-gray-600">All certificates & proofs</div>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-agro-green hover:bg-agro-green/5">
                  <Eye className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Public View</div>
                    <div className="text-sm text-gray-600">See what buyers see</div>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-agro-green hover:bg-agro-green/5">
                  <Download className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Download Report</div>
                    <div className="text-sm text-gray-600">PDF with all details</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Traceability */}
          <div className="lg:col-span-2">
            <SupplyChainTrace />
          </div>
        </div>

        {/* Certificate Section */}
        <div className="mt-6 card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Certificates & Proofs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Organic Certificate', date: '2026-06-15', issuer: 'APEDA', verified: true },
              { title: 'Soil Test Report', date: '2026-06-10', issuer: 'Soil Health Lab', verified: true },
              { title: 'Seed Certificate', date: '2026-06-05', issuer: 'NSAI', verified: true },
              { title: 'Harvest Certificate', date: '2026-11-10', issuer: 'AgroChain', verified: true },
              { title: 'Processing Certificate', date: '2026-11-12', issuer: 'AgroProcess Ltd', verified: false },
              { title: 'Transport Receipt', date: '2026-11-20', issuer: 'SafeTrans', verified: false },
            ].map((cert, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-agro-green/50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{cert.title}</h3>
                    <p className="text-sm text-gray-600">Issued by {cert.issuer}</p>
                  </div>
                  {cert.verified ? (
                    <span className="chip bg-green-100 text-green-800">✓ Verified</span>
                  ) : (
                    <span className="chip bg-yellow-100 text-yellow-800">Pending</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{cert.date}</span>
                  <button className="text-agro-blue hover:text-agro-blue-dark">
                    View Document →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}