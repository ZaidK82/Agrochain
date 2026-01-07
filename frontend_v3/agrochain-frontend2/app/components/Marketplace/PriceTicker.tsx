'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { MarketPrice } from '@/lib/types'

const mockPrices: MarketPrice[] = [
  {
    crop: 'Soybean',
    price: 4280,
    change: 2.1,
    unit: '₹/quintal',
    mandi: 'Nagpur',
    updatedAt: '2026-06-15T10:30:00Z',
  },
  {
    crop: 'Wheat',
    price: 2150,
    change: -0.8,
    unit: '₹/quintal',
    mandi: 'Nagpur',
    updatedAt: '2026-06-15T10:30:00Z',
  },
  {
    crop: 'Cotton',
    price: 6750,
    change: 5.3,
    unit: '₹/quintal',
    mandi: 'Nagpur',
    updatedAt: '2026-06-15T10:30:00Z',
  },
  {
    crop: 'Pigeon Pea',
    price: 7200,
    change: 0,
    unit: '₹/quintal',
    mandi: 'Nagpur',
    updatedAt: '2026-06-15T10:30:00Z',
  },
]

export function PriceTicker() {
  const [prices, setPrices] = useState(mockPrices)
  const [selectedMandi, setSelectedMandi] = useState('Nagpur')

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(price => ({
        ...price,
        change: price.change + (Math.random() - 0.5) * 0.5,
      })))
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const mandis = ['Nagpur', 'Amravati', 'Akola', 'Wardha']

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Live Market Prices
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={selectedMandi}
            onChange={(e) => setSelectedMandi(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-agro-green focus:border-transparent"
          >
            {mandis.map(mandi => (
              <option key={mandi} value={mandi}>{mandi} Mandi</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {prices.map((price) => (
          <div
            key={price.crop}
            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-agro-green/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-agro-green/10 rounded-lg flex items-center justify-center">
                <span className="text-lg">🌾</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{price.crop}</h3>
                <p className="text-sm text-gray-600">{price.mandi} Mandi</p>
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-gray-900 text-lg">
                {price.price.toLocaleString()} {price.unit}
              </div>
              <div className={`inline-flex items-center gap-1 text-sm font-medium ${
                price.change > 0 ? 'text-green-600' : 
                price.change < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {price.change > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : price.change < 0 ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
                {Math.abs(price.change).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-600">
          Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}