// src/app/page.tsx
'use client'

import { Hand } from 'lucide-react'
import ActionCard from '../components/cards/ActionCard'
import InfoCard from '../components/cards/InfoCard'
import SeasonIndicator from '../components/cards/SeasonIndicator'
import { useAppStore } from '../store/useAppStore'

export default function HomePage() {
  const { farmerName, season, isOnline } = useAppStore()
  
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Namaste, {farmerName} <Hand className="inline w-6 h-6" />
          </h1>
          <SeasonIndicator season={season} />
        </div>
      </div>
      
      {/* Offline Status */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>You are offline.</strong> Last prediction shown. Will sync when connected.
          </p>
        </div>
      )}
      
      {/* Primary Action Card */}
      <ActionCard
        title="Get Crop Recommendation"
        subtitle="Based on your soil, weather & history"
        icon="🌱"
        buttonText="Start Now"
        href="/recommendation"
        isProminent={true}
      />
      
      {/* Secondary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard
          title="Expected Yield This Season"
          value="2,450 kg/ha"
          trend="+5% from last season"
          icon="📊"
          color="green"
        />
        
        <InfoCard
          title="Weather Risk Alerts"
          value="Low rainfall"
          trend="Next 10 days"
          icon="⚠️"
          color="yellow"
        />
        
        <InfoCard
          title="Price Trend Snapshot"
          value="₹5,200/quintal"
          trend="↑ 3% this week"
          icon="📈"
          color="blue"
        />
      </div>
    </div>
  )
}