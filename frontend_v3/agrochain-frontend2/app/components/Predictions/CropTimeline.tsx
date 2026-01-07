import { CheckCircle, Circle, CircleDot, Clock } from 'lucide-react'
import type { TimelineEvent } from '@/lib/types'

interface CropTimelineProps {
  events: TimelineEvent[]
  currentStage: string
}

export function CropTimeline({ events, currentStage }: CropTimelineProps) {
  const stages = ['Planned', 'Sowing', 'Growth', 'Harvest', 'Sold']
  const currentIndex = stages.indexOf(currentStage)

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Crop Timeline
      </h2>

      {/* Stage Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {stages.map((stage, index) => (
            <div
              key={stage}
              className={`flex flex-col items-center ${index <= currentIndex ? 'text-agro-green' : 'text-gray-400'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 
                ${index < currentIndex ? 'bg-agro-green' : index === currentIndex ? 'bg-agro-green/20' : 'bg-gray-200'}`}
              >
                {index < currentIndex ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : index === currentIndex ? (
                  <CircleDot className="w-5 h-5 text-agro-green" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <span className="text-xs font-medium">{stage}</span>
            </div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-agro-green transition-all duration-500"
            style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Recent Events */}
      <div>
        <h3 className="font-medium text-gray-900 mb-4">Recent Updates</h3>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full ${event.verified ? 'bg-agro-green' : 'bg-gray-300'}`} />
                <div className={`w-px flex-1 ${event.verified ? 'bg-agro-green' : 'bg-gray-300'}`} />
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <span className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{event.description}</p>
                {!event.verified && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Pending verification</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
        <button className="flex-1 btn-secondary py-2 text-sm">
          Add Photo
        </button>
        <button className="flex-1 btn-primary py-2 text-sm">
          Update Status
        </button>
      </div>
    </div>
  )
}