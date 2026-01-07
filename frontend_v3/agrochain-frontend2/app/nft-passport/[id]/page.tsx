'use client'

import { useParams } from 'next/navigation'
import { CropTimeline } from '@/app/components/Predictions/CropTimeline'
import { 
  CheckCircle, 
  Camera, 
  FileText, 
  Share2,
  Download,
  Eye,
  Calendar,
  MapPin
} from 'lucide-react'

export default function NFTPassportPage() {
  const params = useParams()
  const id = params.id as string

  const mockEvents = [
    {
      id: '1',
      type: 'verification' as const,
      title: 'Prediction verified',
      description: 'Yield prediction recorded on blockchain',
      date: '2026-06-15T10:30:00Z',
      verified: true,
    },
    {
      id: '2',
      type: 'sowing' as const,
      title: 'NFT minted',
      description: 'Crop passport created on Polygon',
      date: '2026-06-16T09:15:00Z',
      verified: true,
    },
    {
      id: '3',
      type: 'growth' as const,
      title: 'Soil test scheduled',
      description: 'Soil analysis scheduled for 18 June',
      date: '2026-06-17T14:20:00Z',
      verified: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-agro-green/10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🌿</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Soybean Passport #{id}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="chip bg-agro-green/10 text-agro-green">
                    ● PLANNED
                  </span>
                  <span className="text-sm text-gray-600">Sowing in 15 days</span>
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Location</span>
              </div>
              <p className="font-medium">Nagpur, 5 acres</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Variety</span>
              </div>
              <p className="font-medium">JS 9560</p>
            </div>
          </div>

          <div className="p-4 bg-agro-green/5 rounded-lg border border-agro-green/20">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Expected Yield</p>
                <p className="text-2xl font-bold text-gray-900">1,250 kg/acre</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estimated Value</p>
                <p className="text-2xl font-bold text-gray-900">₹2,62,500</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-6">
          <CropTimeline 
            events={mockEvents}
            currentStage="Planned"
          />
        </div>

        {/* Verification Badges */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Verification Badges
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Location Verified', verified: true },
              { label: 'Soil Data Authenticated', verified: true },
              { label: 'Prediction on Blockchain', verified: true },
              { label: 'Growth Stage Photos', verified: false, count: 0 },
              { label: 'Harvest Verification', verified: false },
              { label: 'Lab Test Results', verified: false },
            ].map((badge, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  badge.verified ? 'bg-agro-green/10 text-agro-green' : 'bg-gray-100 text-gray-400'
                }`}>
                  {badge.verified ? '✓' : badge.count !== undefined ? badge.count : '○'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{badge.label}</p>
                  {badge.count !== undefined && (
                    <p className="text-xs text-gray-600">
                      {badge.count}/4 photos uploaded
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 btn-secondary py-2">
            Invite Verifier (Bank, Buyer, Govt)
          </button>
        </div>

        {/* Marketplace Preview */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Marketplace Preview
          </h2>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
            <p className="text-sm text-gray-600 mb-2">
              This crop will be available to verified buyers after harvest.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Estimated Listing Date</span>
                <span className="font-medium">Nov 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Minimum Bid</span>
                <span className="font-medium">₹2,50,000</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <h3 className="font-medium text-gray-900 mb-2">
              Buyers Will See:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-agro-green" />
                Full growth history with photos
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-agro-green" />
                Lab test results and quality certificates
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-agro-green" />
                Blockchain verification for each stage
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-agro-green" />
                Farmer reputation and past performance
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 btn-secondary flex items-center justify-center gap-2 py-2">
              <Eye className="w-4 h-4" />
              Preview Listing
            </button>
            <button className="flex-1 btn-primary flex items-center justify-center gap-2 py-2">
              <Download className="w-4 h-4" />
              Set Reserve Price
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3">
            <Camera className="w-5 h-5" />
            Add Photo
          </button>
          <button className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3">
            <FileText className="w-5 h-5" />
            Upload Document
          </button>
        </div>
      </div>
    </div>
  )
}