import { CheckCircle, Clock, AlertCircle, Shield } from 'lucide-react'

interface VerificationBadgeProps {
  status: 'verified' | 'pending' | 'failed'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function VerificationBadge({ 
  status, 
  size = 'md', 
  showLabel = true 
}: VerificationBadgeProps) {
  const config = {
    verified: {
      icon: CheckCircle,
      color: 'text-agro-green',
      bgColor: 'bg-agro-green/10',
      label: 'Verified',
    },
    pending: {
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      label: 'Pending',
    },
    failed: {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      label: 'Failed',
    },
  }

  const { icon: Icon, color, bgColor, label } = config[status]

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const containerClasses = {
    sm: 'px-2 py-1',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2',
  }

  return (
    <div className={`inline-flex items-center gap-2 ${containerClasses[size]} ${bgColor} rounded-full`}>
      <Icon className={`${sizeClasses[size]} ${color}`} />
      {showLabel && (
        <span className={`text-sm font-medium ${color}`}>
          {label}
        </span>
      )}
    </div>
  )
}

// Special blockchain verification badge
export function BlockchainVerificationBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-agro-purple/10 text-agro-purple rounded-full">
      <Shield className="w-4 h-4" />
      <span className="text-sm font-medium">Blockchain Verified</span>
    </div>
  )
}