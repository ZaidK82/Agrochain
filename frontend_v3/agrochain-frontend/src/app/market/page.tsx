// src/app/market/page.tsx
'use client'

import { TrendingUp, TrendingDown, Minus, ShoppingBag } from 'lucide-react'
import PriceCard from '@/src/components/cards/PriceCard'

const marketData = [
  { crop: 'Wheat', price: '₹5,200/q', trend: 'up', change: '3%', mandi: 'Delhi' },
  { crop: 'Rice', price: '₹3,800/q', trend: 'down', change: '2%', mandi: 'Punjab' },
  { crop: 'Cotton', price: '₹6,500/q', trend: 'stable', change: '0%', mandi: 'Gujarat' },
  { crop: 'Soybean', price: '₹4,300/q', trend: 'up', change: '5%', mandi: 'MP' },
]

export default function MarketPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Market Prices</h1>
      
      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {marketData.map((item) => (
          <PriceCard key={item.crop} {...item} />
        ))}
      </div>
      
      {/* Price Forecast */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
          <TrendingUp className="w-5 h-5" />
          Price Forecast for Next Month
        </h2>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">Expected Range</span>
          <span className="font-bold">₹5,000 - ₹5,500/q</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Confidence</span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            High Confidence
          </span>
        </div>
      </div>
      
      {/* Sell Crop CTA */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 text-center">
        <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-green-600" />
        <h3 className="text-xl font-bold mb-2">Ready to Sell Your Crop?</h3>
        <p className="text-gray-600 mb-6">Get the best prices by listing directly</p>
        <button className="px-8 py-3 bg-green-600 text-white rounded-lg text-lg font-medium">
          List My Crop for Sale
        </button>
      </div>
    </div>
  )
}