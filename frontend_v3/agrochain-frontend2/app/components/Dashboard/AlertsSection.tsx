'use client'

import { AlertTriangle, Bell, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { Alert } from '@/lib/types'

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'weather',
    title: 'Heavy Rain Expected',
    message: '18-20 June (plan sowing accordingly)',
    priority: 'high',
    read: false,
    createdAt: '2026-06-15T10:30:00Z',
  },
  {
    id: '2',
    type: 'price',
    title: 'Soybean Prices Up',
    message: 'Prices increased 12% this week',
    priority: 'medium',
    read: false,
    createdAt: '2026-06-14T14:20:00Z',
  },
  {
    id: '3',
    type: 'pest',
    title: 'Pest Alert',
    message: 'Helicoverpa detected in neighboring farms',
    priority: 'medium',
    read: true,
    createdAt: '2026-06-13T09:15:00Z',
  },
]

export function AlertsSection() {
  const [alerts, setAlerts] = useState(mockAlerts)
  const [expanded, setExpanded] = useState(true)

  const unreadCount = alerts.filter(alert => !alert.read).length

  const markAsRead = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ))
  }

  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, read: true })))
  }

  return (
    <div className="card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full mb-4"
      >
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-agro-yellow" />
          <h2 className="text-lg font-semibold text-gray-900">
            Alerts & Advisories
          </h2>
          {unreadCount > 0 && (
            <span className="chip bg-red-100 text-red-800">
              {unreadCount} new
            </span>
          )}
        </div>
        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <>
          <div className="space-y-3 mb-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${alert.read ? 'border-gray-200' : 'border-red-200 bg-red-50'}`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 ${alert.priority === 'high' ? 'text-red-600' : 'text-yellow-600'}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">
                        {alert.title}
                      </h3>
                      {!alert.read && (
                        <button
                          onClick={() => markAsRead(alert.id)}
                          className="text-sm text-agro-blue hover:text-agro-blue-dark"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {alert.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-agro-blue hover:text-agro-blue-dark w-full text-center"
            >
              Mark all as read
            </button>
          )}

          <div className="mt-6 p-4 bg-agro-green/5 rounded-lg border border-agro-green/20">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-agro-green">💡</span>
              Recommended Action
            </h3>
            <p className="text-gray-700 mb-3">
              Test soil pH this week. Optimal window for lime application.
            </p>
            <div className="flex gap-3">
              <button className="btn-primary text-sm px-4 py-2">
                Schedule Soil Test
              </button>
              <button className="btn-secondary text-sm px-4 py-2">
                Learn Why
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}