import { CheckCircle, FileText, Camera, Shield } from 'lucide-react'
import type { Activity } from '@/lib/types'

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'prediction',
    title: 'Soybean prediction verified',
    description: 'Yield: 1,250 kg/acre with 80% confidence',
    timestamp: '2026-06-15T10:30:00Z',
    icon: '✓',
  },
  {
    id: '2',
    type: 'registration',
    title: 'Registered 5 acres for Kharif',
    description: 'Soybean variety JS 9560',
    timestamp: '2026-06-15T09:15:00Z',
    icon: '🌱',
  },
  {
    id: '3',
    type: 'verification',
    title: 'Shared crop record with buyer',
    description: 'Transaction verified on blockchain',
    timestamp: '2026-06-14T16:45:00Z',
    icon: '🔗',
  },
  {
    id: '4',
    type: 'photo',
    title: 'Uploaded growth stage photo',
    description: 'Growth stage 3: Vegetative',
    timestamp: '2026-06-14T14:20:00Z',
    icon: '📷',
  },
]

const iconMap = {
  prediction: CheckCircle,
  registration: FileText,
  verification: Shield,
  photo: Camera,
}

export function ActivityTimeline() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Activity
      </h2>
      
      <div className="space-y-4">
        {mockActivities.map((activity) => {
          const Icon = iconMap[activity.type]
          return (
            <div key={activity.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-agro-green/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-agro-green" />
                </div>
                <div className="w-px h-full bg-gray-200 mt-2" />
              </div>
              
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">
                    {activity.title}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {formatDate(activity.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {activity.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <button className="w-full mt-4 text-center text-agro-blue hover:text-agro-blue-dark font-medium">
        View All Activity →
      </button>
    </div>
  )
}