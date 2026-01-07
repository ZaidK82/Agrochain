// src/components/cards/PriceCard.tsx
'use client'

interface PriceCardProps {
  crop?: string
  price?: string
  trend?: 'up' | 'down' | 'flat'
  change?: string
  mandi?: string
}

export default function PriceCard({
  crop,
  price,
  trend,
  change,
  mandi,
}: PriceCardProps) {
  return (
    <div className="card p-4 border rounded-md">
      <h3 className="font-bold">{crop}</h3>
      <p>{price}</p>
      <p>
        {trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➖'} {change}
      </p>
      <p>Mandi: {mandi}</p>
    </div>
  )
}
