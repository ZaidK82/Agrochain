import { ResilienceScore } from '@/app/components/Resilience/ResilienceScore'
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

export default function ResiliencePage() {
  const improvementActions = [
    {
      title: 'Improve Soil Health',
      description: 'Add organic compost and maintain pH levels',
      impact: '+15 points',
      cost: 'Low',
      time: '3 months',
      priority: 'High'
    },
    {
      title: 'Install Irrigation System',
      description: 'Set up drip irrigation for water efficiency',
      impact: '+20 points',
      cost: 'Medium',
      time: '2 months',
      priority: 'High'
    },
    {
      title: 'Crop Diversification',
      description: 'Add legumes to crop rotation',
      impact: '+12 points',
      cost: 'Low',
      time: '6 months',
      priority: 'Medium'
    },
    {
      title: 'Weather Monitoring',
      description: 'Install weather station for real-time data',
      impact: '+8 points',
      cost: 'Medium',
      time: '1 month',
      priority: 'Low'
    }
  ]

  const riskFactors = [
    {
      name: 'Water Scarcity',
      probability: 'Medium',
      impact: 'High',
      mitigation: 'Rainwater harvesting, drip irrigation'
    },
    {
      name: 'Soil Degradation',
      probability: 'Low',
      impact: 'Medium',
      mitigation: 'Regular soil testing, organic amendments'
    },
    {
      name: 'Price Volatility',
      probability: 'High',
      impact: 'Medium',
      mitigation: 'Contract farming, price hedging'
    },
    {
      name: 'Pest Outbreak',
      probability: 'Medium',
      impact: 'High',
      mitigation: 'Integrated pest management, resistant varieties'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-agro-green" />
            <h1 className="text-3xl font-bold text-gray-900">Farm Resilience Score</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Assess your farm's ability to withstand climate shocks, market volatility, 
            and other risks. Get actionable insights to improve resilience.
          </p>
        </div>

        {/* Main Resilience Score */}
        <div className="mb-6">
          <ResilienceScore score={72} />
        </div>

        {/* Improvement Actions */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recommended Improvement Actions
          </h2>
          
          <div className="space-y-4">
            {improvementActions.map((action, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-agro-green/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                  <div className={`chip ${
                    action.priority === 'High' ? 'bg-red-100 text-red-800' :
                    action.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {action.priority} Priority
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-sm text-gray-600">Impact</div>
                    <div className="font-bold text-green-600">{action.impact}</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-sm text-gray-600">Cost</div>
                    <div className="font-bold text-blue-600">{action.cost}</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <div className="text-sm text-gray-600">Time</div>
                    <div className="font-bold text-purple-600">{action.time}</div>
                  </div>
                </div>
                
                <button className="w-full mt-4 btn-secondary text-sm py-2">
                  Start This Action
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Risk Assessment
          </h2>
          
          <div className="space-y-4">
            {riskFactors.map((risk, index) => (
              <div key={index} className="p-4 border border-red-200 rounded-lg bg-red-50/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{risk.name}</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Probability</div>
                      <div className={`font-bold ${
                        risk.probability === 'High' ? 'text-red-600' :
                        risk.probability === 'Medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {risk.probability}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Impact</div>
                      <div className={`font-bold ${
                        risk.impact === 'High' ? 'text-red-600' :
                        risk.impact === 'Medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {risk.impact}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-1">Mitigation Strategies</div>
                  <p className="text-gray-700">{risk.mitigation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Tracking */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resilience Progress</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Overall Progress</span>
                <span className="font-bold text-agro-green">+18 points in 6 months</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-agro-green h-3 rounded-full transition-all duration-500"
                  style={{ width: '72%' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Completed', value: 8, icon: CheckCircle, color: 'text-green-600' },
                { label: 'In Progress', value: 4, icon: Clock, color: 'text-blue-600' },
                { label: 'Planned', value: 6, icon: Clock, color: 'text-yellow-600' },
                { label: 'Pending', value: 2, icon: AlertTriangle, color: 'text-gray-600' },
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${item.color}`} />
                    <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                    <div className="text-sm text-gray-600">{item.label}</div>
                  </div>
                )
              })}
            </div>

            <div className="p-4 bg-agro-green/5 rounded-lg border border-agro-green/20">
              <h3 className="font-medium text-gray-900 mb-2">Next Milestone: 80+ Score</h3>
              <p className="text-sm text-gray-600 mb-3">
                Achieve "Highly Resilient" status by completing 3 more actions
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-agro-green h-2 rounded-full" style={{ width: '72%' }} />
                </div>
                <span className="text-sm font-medium">8/12 actions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}