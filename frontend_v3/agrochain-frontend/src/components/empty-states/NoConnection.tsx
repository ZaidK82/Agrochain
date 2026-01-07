// src/components/empty-states/NoConnection.tsx
'use client'

import { WifiOff, RefreshCw } from 'lucide-react'

export default function NoConnection() {
  return (
    <div className="text-center py-12 px-4">
      <WifiOff className="w-20 h-20 text-gray-400 mx-auto mb-6" />
      <h3 className="text-xl font-bold mb-3">No Internet Connection</h3>
      <p className="text-gray-600 mb-2">
        You are currently offline. Some features may be limited.
      </p>
      <p className="text-gray-500 text-sm mb-8">
        Last synced data is shown below
      </p>
      <button 
        className="flex items-center gap-2 mx-auto px-6 py-3 bg-gray-100 rounded-lg"
        onClick={() => window.location.reload()}
      >
        <RefreshCw className="w-5 h-5" />
        Retry Connection
      </button>
    </div>
  )
}