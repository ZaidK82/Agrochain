interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  text?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'text-agro-green',
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full border-2 ${color}/20`} />
        <div className={`absolute top-0 left-0 ${sizeClasses[size]} rounded-full border-2 ${color} border-t-transparent animate-spin`} />
      </div>
      {text && (
        <p className={`mt-3 text-sm ${color} font-medium`}>{text}</p>
      )}
    </div>
  )
}

// Special loading spinner for predictions
export function PredictionLoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full border-4 border-agro-green/20" />
        <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-agro-green border-t-transparent animate-spin" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">
          🌱
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Analyzing Your Farm
      </h3>
      <p className="text-gray-600 text-center max-w-sm">
        Checking soil data, weather patterns, and market trends...
      </p>
      <div className="mt-6 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-agro-green rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}