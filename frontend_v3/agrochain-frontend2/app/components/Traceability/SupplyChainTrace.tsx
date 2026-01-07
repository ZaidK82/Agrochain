'use client'

import { useState } from 'react'
import {
  CheckCircle,
  Clock,
  Package,
  Truck,
  Warehouse,
  Store,
  User,
  FileText,
  Camera,
  MapPin
} from 'lucide-react'

interface SupplyChainStep {
  id: string
  name: string
  status: 'completed' | 'current' | 'pending'
  timestamp: string
  location: string
  actors: string[]
  documents: string[]
  verified: boolean
  details: {
    temperature?: string
    humidity?: string
    weight?: string
    quality?: string
  }
}

export function SupplyChainTrace() {
  const [selectedStep, setSelectedStep] = useState<string>('harvest')

  const supplyChainSteps: SupplyChainStep[] = [
    {
      id: 'sowing',
      name: 'Sowing',
      status: 'completed',
      timestamp: '2026-06-20T08:00:00Z',
      location: 'Farm: Nagpur',
      actors: ['Farmer: Rajesh Kumar', 'Agronomist: Dr. Sharma'],
      documents: ['Seed Certificate', 'Soil Test Report'],
      verified: true,
      details: {
        temperature: '28°C',
        humidity: '65%',
        quality: 'Certified Organic Seeds'
      }
    },
    {
      id: 'growth',
      name: 'Growth',
      status: 'completed',
      timestamp: '2026-08-15T10:00:00Z',
      location: 'Farm: Nagpur',
      actors: ['Farmer: Rajesh Kumar'],
      documents: ['Growth Photos', 'Pesticide Log'],
      verified: true,
      details: {
        temperature: '30°C avg',
        humidity: '70% avg',
        quality: 'Stage 3: Flowering'
      }
    },
    {
      id: 'harvest',
      name: 'Harvest',
      status: 'current',
      timestamp: '2026-11-10T07:00:00Z',
      location: 'Farm: Nagpur',
      actors: ['Farmer: Rajesh Kumar', 'Labor Team'],
      documents: ['Harvest Certificate', 'Weight Log'],
      verified: true,
      details: {
        weight: '6,250 kg',
        quality: 'Grade A',
        humidity: '12%'
      }
    },
    {
      id: 'processing',
      name: 'Processing',
      status: 'pending',
      timestamp: '2026-11-12T09:00:00Z',
      location: 'Processing Unit: MIDC Nagpur',
      actors: ['Processor: AgroProcess Ltd.', 'Quality Inspector'],
      documents: ['Processing Certificate', 'Quality Report'],
      verified: false,
      details: {
        temperature: 'Controlled',
        humidity: '50%',
        weight: '6,000 kg (processed)'
      }
    },
    {
      id: 'storage',
      name: 'Storage',
      status: 'pending',
      timestamp: '2026-11-15T14:00:00Z',
      location: 'Warehouse: FCI Nagpur',
      actors: ['Warehouse Manager', 'Quality Control'],
      documents: ['Warehouse Receipt', 'Storage Conditions'],
      verified: false,
      details: {
        temperature: '25°C',
        humidity: '60%',
        quality: 'In Storage'
      }
    },
    {
      id: 'transport',
      name: 'Transport',
      status: 'pending',
      timestamp: '2026-11-20T08:00:00Z',
      location: 'Nagpur → Mumbai',
      actors: ['Transporter: SafeTrans Logistics', 'Driver'],
      documents: ['Transport Receipt', 'GPS Log'],
      verified: false,
      details: {
        temperature: '28°C',
        humidity: '65%',
        quality: 'In Transit'
      }
    },
    {
      id: 'retail',
      name: 'Retail',
      status: 'pending',
      timestamp: '2026-11-22T10:00:00Z',
      location: 'Supermarket: Mumbai',
      actors: ['Retailer: FreshMart', 'Quality Check'],
      documents: ['Invoice', 'Sale Receipt'],
      verified: false,
      details: {
        temperature: '24°C',
        humidity: '55%',
        quality: 'On Shelf'
      }
    },
    {
      id: 'consumer',
      name: 'Consumer',
      status: 'pending',
      timestamp: '2026-11-23T18:00:00Z',
      location: 'Consumer Kitchen',
      actors: ['End Consumer'],
      documents: ['Purchase Receipt'],
      verified: false,
      details: {
        quality: 'Ready for Consumption'
      }
    }
  ]

  const selectedStepData = supplyChainSteps.find(step => step.id === selectedStep)

  return (
    <div className="card">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Supply Chain Traceability
        </h2>
        <p className="text-gray-600">
          Track your Soybean (JS 9560) from farm to fork
        </p>
      </div>

      {/* Supply Chain Timeline */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900">Journey Timeline</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Batch ID:</span>
            <code className="font-mono text-sm text-agro-purple">BATCH-3A8C-2026</code>
          </div>
        </div>

        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300">
            <div 
              className="absolute top-0 left-0 w-0.5 bg-agro-green transition-all duration-500"
              style={{ 
                height: `${(supplyChainSteps.findIndex(s => s.status === 'current') + 1) * (100 / supplyChainSteps.length)}%` 
              }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-8">
            {supplyChainSteps.map((step, index) => (
              <div key={step.id} className="relative">
                <button
                  onClick={() => setSelectedStep(step.id)}
                  className={`flex items-start gap-4 w-full text-left ${
                    selectedStep === step.id ? 'bg-blue-50 p-4 rounded-lg -mx-4' : ''
                  }`}
                >
                  {/* Step Indicator */}
                  <div className="relative z-10">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      step.status === 'completed' 
                        ? 'bg-agro-green border-agro-green text-white' 
                        : step.status === 'current'
                        ? 'bg-white border-agro-green text-agro-green'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : step.status === 'current' ? (
                        <div className="w-3 h-3 bg-agro-green rounded-full" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{step.name}</h4>
                      <div className="flex items-center gap-2">
                        {step.verified && (
                          <span className="chip bg-green-100 text-green-800 text-xs">
                            ✓ Verified
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(step.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      {step.location}
                    </div>

                    <div className="flex items-center gap-4">
                      {step.status === 'completed' && (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </div>
                      )}
                      {step.status === 'current' && (
                        <div className="flex items-center gap-1 text-sm text-blue-600">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                          In Progress
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        {step.actors.length} involved
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        {step.documents.length} documents
                      </div>
                    </div>
                  </div>

                  {/* Step Icon */}
                  <div className="text-gray-400">
                    {step.id === 'sowing' && <Package className="w-5 h-5" />}
                    {step.id === 'growth' && <Camera className="w-5 h-5" />}
                    {step.id === 'harvest' && <Package className="w-5 h-5" />}
                    {step.id === 'processing' && <Package className="w-5 h-5" />}
                    {step.id === 'storage' && <Warehouse className="w-5 h-5" />}
                    {step.id === 'transport' && <Truck className="w-5 h-5" />}
                    {step.id === 'retail' && <Store className="w-5 h-5" />}
                    {step.id === 'consumer' && <User className="w-5 h-5" />}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Step Details */}
      {selectedStepData && (
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {selectedStepData.name} Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Step Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${
                    selectedStepData.status === 'completed' ? 'text-green-600' :
                    selectedStepData.status === 'current' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {selectedStepData.status.charAt(0).toUpperCase() + selectedStepData.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Timestamp</span>
                  <span className="font-medium">
                    {new Date(selectedStepData.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium">{selectedStepData.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verification</span>
                  <span className={`font-medium ${
                    selectedStepData.verified ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {selectedStepData.verified ? 'Blockchain Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>

            {/* Conditions */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Conditions & Metrics</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(selectedStepData.details).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 capitalize">{key}</div>
                    <div className="font-medium">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actors */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">People Involved</h4>
              <div className="space-y-2">
                {selectedStepData.actors.map((actor, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-white rounded-lg border">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{actor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Documents & Proofs</h4>
              <div className="space-y-2">
                {selectedStepData.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{doc}</span>
                    </div>
                    <button className="text-agro-blue hover:text-agro-blue-dark text-sm">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* QR Code for Step */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Step Verification QR</h4>
                <p className="text-sm text-gray-600">
                  Scan to verify this step on blockchain
                </p>
              </div>
              <div className="w-24 h-24 bg-white p-2 rounded-lg border">
                {/* QR Code would go here */}
                <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                  QR Code
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blockchain Verification */}
      <div className="mt-8 p-4 bg-agro-purple/5 rounded-lg border border-agro-purple/20">
        <h4 className="font-semibold text-gray-900 mb-3">Blockchain Verification</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Transaction Hash</span>
            <code className="font-mono text-sm text-agro-purple">
              0x8a9b...c2d3
            </code>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Block Number</span>
            <span className="font-medium">#42,891,234</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Verification Score</span>
            <span className="font-bold text-agro-green">92/100</span>
          </div>
        </div>
        
        <div className="flex gap-3 mt-4">
          <button className="flex-1 btn-secondary">
            View Full Chain
          </button>
          <button className="flex-1 btn-primary">
            Share Traceability
          </button>
        </div>
      </div>
    </div>
  )
}