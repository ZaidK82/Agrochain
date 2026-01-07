// src/app/crop/page.tsx
'use client'

import { Plus, FileText, Calendar } from 'lucide-react'
import CropTimeline from '@/src/components/cards/CropTimeline'
import CropRecordCard from '@/src/components/cards/CropRecordCard'

const timelineStages = [
  { id: 1, name: 'Sowing', date: '15 Jun 2024', status: 'completed', notes: 'Used certified seeds' },
  { id: 2, name: 'Growth', date: '30 Jul 2024', status: 'completed', notes: 'Applied fertilizer' },
  { id: 3, name: 'Harvest', date: '15 Oct 2024', status: 'current', notes: 'Expected completion' },
  { id: 4, name: 'Sale', date: 'Future', status: 'pending', notes: 'Not yet started' },
]

export default function MyCropPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">My Crop Record</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg">
          <Plus className="w-5 h-5" />
          Add New Crop
        </button>
      </div>
      
      {/* Active Crop Card */}
      <CropRecordCard
        crop="Wheat"
        area="2.5 acres"
        expectedYield="3,200 kg"
        currentStage="Growth"
        progress={65}
        lastUpdated="2 days ago"
      />
      
      {/* Crop Lifecycle Timeline */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-6">
          <Calendar className="w-5 h-5" />
          Crop Lifecycle
        </h2>
        <CropTimeline stages={timelineStages} />
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="flex-1 flex items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
          <Plus className="w-5 h-5" />
          Add Update
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
          <FileText className="w-5 h-5" />
          View Proof
        </button>
      </div>
    </div>
  )
}