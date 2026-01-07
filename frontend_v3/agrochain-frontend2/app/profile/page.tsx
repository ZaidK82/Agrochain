'use client'

import { User, MapPin, Calendar, Shield, Settings, LogOut, Wallet, Award } from 'lucide-react'
import { useState } from 'react'

export default function ProfilePage() {
  const [language, setLanguage] = useState('Marathi')
  const [units, setUnits] = useState('Quintal/Hectare')
  const [alerts, setAlerts] = useState(['WhatsApp', 'SMS'])
  const [offlineMode, setOfflineMode] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="card mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-agro-green/10 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-agro-green" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Rajesh Kumar</h1>
              <p className="text-gray-600">Farmer since Jan 2025</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">⭐ 4.8</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-agro-green" />
                  <span className="text-sm font-medium">89% success rate</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Farm ID</p>
              <p className="font-mono font-medium">FARM-3A8C</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Location</p>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">Nagpur, Maharashtra</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Total Predictions</p>
                <p className="text-sm text-gray-600">Yield accuracy: ±12% average</p>
              </div>
              <span className="text-2xl font-bold text-blue-600">47</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">NFTs Created</p>
                <p className="text-sm text-gray-600">Digital crop passports</p>
              </div>
              <span className="text-2xl font-bold text-green-600">12</span>
            </div>
          </div>
        </div>

        {/* Connected Services */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Connected Services
          </h2>
          
          <div className="space-y-3">
            {[
              { name: 'Soil Health Card', connected: true, service: 'Govt.' },
              { name: 'Bank Loan Account', connected: false, service: 'SBI' },
              { name: 'Weather Alerts', connected: true, service: 'IMD' },
              { name: 'Crop Insurance', connected: false, service: 'Available' },
            ].map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.service}</p>
                </div>
                <button className={`px-4 py-1 rounded-full text-sm font-medium ${
                  service.connected 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-agro-green text-white hover:bg-agro-green-dark'
                }`}>
                  {service.connected ? 'Connected' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Preferences
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agro-green focus:border-transparent"
              >
                <option>मराठी (Marathi)</option>
                <option>हिन्दी (Hindi)</option>
                <option>English</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Units
              </label>
              <select
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-agro-green focus:border-transparent"
              >
                <option>Quintal/Hectare</option>
                <option>Kg/Acre</option>
                <option>Tonne/Hectare</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alert Channels
              </label>
              <div className="space-y-2">
                {['WhatsApp', 'SMS', 'Email', 'Push'].map((channel) => (
                  <label key={channel} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={alerts.includes(channel)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAlerts([...alerts, channel])
                        } else {
                          setAlerts(alerts.filter(a => a !== channel))
                        }
                      }}
                      className="w-4 h-4 text-agro-green rounded focus:ring-agro-green"
                    />
                    <span className="text-gray-700">{channel}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Offline Mode</p>
                <p className="text-sm text-gray-600">Work without internet</p>
              </div>
              <button
                onClick={() => setOfflineMode(!offlineMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  offlineMode ? 'bg-agro-green' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    offlineMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Blockchain Wallet */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Blockchain Wallet
          </h2>
          
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Managed by AgroChain - No action needed
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Address</span>
                <code className="font-mono text-sm text-agro-purple">
                  0x8f3a4...b2c9
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Balance</span>
                <span className="font-medium">0.5 MATIC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Transactions</span>
                <span className="font-medium">142</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="flex-1 btn-secondary py-2">
              View All Transactions
            </button>
            <button className="flex-1 btn-primary py-2">
              Export Data
            </button>
          </div>
        </div>

        {/* Logout */}
        <button className="w-full flex items-center justify-center gap-2 p-4 text-red-600 hover:bg-red-50 rounded-lg border border-red-200">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  )
}