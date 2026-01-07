import { 
  Sprout, 
  BarChart3, 
  TrendingUp, 
  Leaf, 
  Shield,
  QrCode 
} from 'lucide-react'
import Link from 'next/link'

const actions = [
  {
    id: 'predict',
    title: 'What to Grow',
    description: 'AI + Expert recommendations',
    icon: Sprout,
    color: 'bg-agro-green/10 text-agro-green',
    href: '/predict',
  },
  {
    id: 'yield',
    title: 'Yield Predict',
    description: 'Personalized forecasts',
    icon: BarChart3,
    color: 'bg-agro-blue/10 text-agro-blue',
    href: '/yield-prediction',
  },
  {
    id: 'resilience',
    title: 'Resilience',
    description: 'Farm health score',
    icon: Shield,
    color: 'bg-orange-100 text-orange-600',
    href: '/resilience',
  },
  {
    id: 'trace',
    title: 'Traceability',
    description: 'Supply chain tracking',
    icon: QrCode,
    color: 'bg-purple-100 text-purple-600',
    href: '/traceability',
  },
  {
    id: 'market',
    title: 'Market Prices',
    description: 'Live prices + trends',
    icon: TrendingUp,
    color: 'bg-yellow-100 text-yellow-600',
    href: '/market',
  },
  {
    id: 'nft',
    title: 'My Crops/NFTs',
    description: 'Digital crop passports',
    icon: Leaf,
    color: 'bg-indigo-100 text-indigo-600',
    href: '/nft-passport',
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link
            key={action.id}
            href={action.href}
            className="card hover:shadow-md transition-shadow duration-200 active:scale-95 h-full"
          >
            <div className="flex flex-col items-center text-center p-4 h-full">
              <div className={`p-3 rounded-full ${action.color} mb-3`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600 flex-1">
                {action.description}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}