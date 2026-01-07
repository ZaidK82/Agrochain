// src/components/cards/CropRecordCard.tsx
'use client'

export default function CropRecordCard({
  crop,
  area,
  expectedYield,
  currentStage,
  progress,
  lastUpdated
}: {
  crop: string
  area?: string
  expectedYield?: string
  currentStage?: string
  progress?: number
  lastUpdated?: string
}) {
  return (
    <div className="card p-4">
      <h3 className="font-bold">{crop}</h3>
      {area && <p>Area: {area}</p>}
      {expectedYield && <p>Expected Yield: {expectedYield}</p>}
      {currentStage && <p>Stage: {currentStage}</p>}
      {progress !== undefined && <p>Progress: {progress}%</p>}
      {lastUpdated && <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>}
    </div>
  )
}
