import { CheckCircle, Eye, Share2 } from 'lucide-react'
import Link from 'next/link'

interface CropListingProps {
  crop: {
    id: string
    name: string
    variety: string
    harvestDate: string
    quantity: number
    unit: string
    estimatedValue: number
    status: 'not_listed' | 'listed' | 'sold'  // Make it literal type
    verifications: number
  }
}

export function CropListing({ crop }: CropListingProps) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-agro-green/10 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🌱</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{crop.name}</h3>
            <p className="text-sm text-gray-600">{crop.variety}</p>
          </div>
        </div>
        
        <div className={`chip ${
          crop.status === 'sold' ? 'bg-green-100 text-green-800' :
          crop.status === 'listed' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {crop.status === 'sold' ? 'Sold' : 
           crop.status === 'listed' ? 'Listed' : 'Not Listed'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Harvest Date</p>
          <p className="font-medium text-gray-900">{crop.harvestDate}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Quantity</p>
          <p className="font-medium text-gray-900">
            {crop.quantity.toLocaleString()} {crop.unit}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Estimated Value</p>
          <p className="font-medium text-gray-900">
            ₹{crop.estimatedValue.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Verifications</p>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-agro-green" />
            <span className="font-medium text-gray-900">{crop.verifications}</span>
          </div>
        </div>
      </div>

      {crop.status === 'not_listed' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            This crop will be available to verified buyers after harvest.
          </p>
          <div className="flex gap-3">
            <button className="flex-1 btn-primary py-2">
              Create Listing
            </button>
            <Link
              href={`/nft-passport/${crop.id}`}
              className="flex-1 btn-secondary py-2 flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Link>
          </div>
        </div>
      )}

      {crop.status === 'listed' && (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">2 Buyer Interests</p>
                <p className="text-sm text-gray-600">Highest bid: ₹{Math.floor(crop.estimatedValue * 1.05).toLocaleString()}</p>
              </div>
              <button className="text-agro-blue hover:text-agro-blue-dark">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 btn-primary py-2">
              View Offers
            </button>
            <button className="flex-1 btn-secondary py-2">
              Update Listing
            </button>
          </div>
        </div>
      )}

      {crop.status === 'sold' && (
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Sold Successfully</p>
              <p className="text-sm text-gray-600">
                Transaction verified on blockchain
              </p>
            </div>
            <Link
              href={`/verify/transaction-${crop.id}`}
              className="text-agro-green hover:text-agro-green-dark text-sm font-medium"
            >
              View Receipt →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}