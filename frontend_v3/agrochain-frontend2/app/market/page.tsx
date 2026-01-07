'use client'

import { PriceTicker } from '@/app/components/Marketplace/PriceTicker'
import { CropListing } from '@/app/components/Marketplace/CropListing'
import { TrendingUp, Filter, Download } from 'lucide-react'
import { useState } from 'react'

const cropListings = [
  {
    id: '1',
    name: 'Soybean',
    variety: 'JS 9560',
    harvestDate: 'Nov 2026',
    quantity: 6250,
    unit: 'kg',
    estimatedValue: 262500,
    status: 'not_listed' as const,  // Add as const
    verifications: 3,
  },
  {
    id: '2',
    name: 'Wheat',
    variety: 'HD 2967',
    harvestDate: 'Mar 2026',
    quantity: 4800,
    unit: 'kg',
    estimatedValue: 103200,
    status: 'sold' as const,  // Add as const
    verifications: 5,
  },
]

export default function MarketPage() {
  const [filter, setFilter] = useState('all')
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Market Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time prices and crop listings
          </p>
        </div>

        {/* Price Ticker */}
        <div className="mb-6">
          <PriceTicker />
        </div>

        {/* Market Insights */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Market Intelligence
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-gray-900 mb-1">
                Export demand increasing
              </h3>
              <p className="text-sm text-gray-600">
                Bangladesh import demand up 15% this quarter
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-medium text-gray-900 mb-1">
                New procurement policy
              </h3>
              <p className="text-sm text-gray-600">
                Expected announcement in July 2026
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-gray-900 mb-1">
                Warehouse capacity
              </h3>
              <p className="text-sm text-gray-600">
                Currently at 85% capacity in Nagpur region
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
            <button className="flex-1 btn-secondary flex items-center justify-center gap-2 py-2">
              <Filter className="w-4 h-4" />
              Set Price Alert
            </button>
            <button className="flex-1 btn-primary flex items-center justify-center gap-2 py-2">
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Your Listings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Crop Listings
            </h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All Status</option>
              <option value="not_listed">Not Listed</option>
              <option value="listed">Listed</option>
              <option value="sold">Sold</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {cropListings
              .filter(listing => filter === 'all' || listing.status === filter)
              .map((listing) => (
                <CropListing key={listing.id} crop={listing} />
              ))
            }
          </div>
          
          {cropListings.filter(listing => filter === 'all' || listing.status === filter).length === 0 && (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">📭</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No listings found
              </h3>
              <p className="text-gray-600">
                Create your first crop listing to start selling
              </p>
              <button className="mt-4 btn-primary px-6 py-3">
                Create New Listing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}