// src/components/cards/InfoCard.tsx
'use client'

export default function InfoCard({
  title,
  value,
  trend,
  icon,
  color
}: {
  title: string
  value?: string
  trend?: string
  icon?: string
  color?: string
}) {
  return (
    <div className={`card p-4 bg-${color}-50`}>
      {icon && <div className="text-xl mb-2">{icon}</div>}
      <h4 className="font-semibold">{title}</h4>
      {value && <p className="text-lg font-bold">{value}</p>}
      {trend && <p className="text-sm text-gray-500">{trend}</p>}
    </div>
  )
}
