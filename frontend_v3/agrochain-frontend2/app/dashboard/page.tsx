import { FarmHealthCard } from '@/app/components/Dashboard/FarmHealthCard'
import { QuickActions } from '@/app/components/Dashboard/QuickActions'
import { AlertsSection } from '@/app/components/Dashboard/AlertsSection'
import { ActivityTimeline } from '@/app/components/Dashboard/ActivityTimeline'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Farm Dashboard</h1>
        
        <div className="space-y-6">
          <FarmHealthCard
            score={82}
            lastCrop="Wheat"
            moisture="Optimal"
            nextAction="Prep for Kharif"
          />
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <QuickActions />
          </div>
          
          <AlertsSection />
          
          <ActivityTimeline />
        </div>
      </div>
    </div>
  )
}