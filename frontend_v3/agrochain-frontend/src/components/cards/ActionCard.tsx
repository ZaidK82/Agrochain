// src/components/cards/ActionCard.tsx
'use client'

export default function ActionCard({
  title,
  subtitle,
  icon,
  buttonText,
  href,
  isProminent
}: {
  title: string
  subtitle?: string
  icon?: string
  buttonText: string
  href?: string
  isProminent?: boolean
}) {
  return (
    <div className="card p-4">
      <h3 className="text-lg font-bold">{title}</h3>
      {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      {icon && <div className="text-2xl my-2">{icon}</div>}
      <button className="btn-primary mt-2">{buttonText}</button>
    </div>
  )
}
