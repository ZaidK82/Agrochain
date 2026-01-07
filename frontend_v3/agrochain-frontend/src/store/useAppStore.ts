// src/store/useAppStore.ts
'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  // User & Location
  farmerName: string
  location: {
    district: string
    village: string
    state: string
  }
  
  // App State
  isOnline: boolean
  language: 'en' | 'hi' | 'mr'
  season: 'kharif' | 'rabi' | 'zaid'
  
  // Offline Data
  lastSync: string
  cachedPredictions: any[]
  pendingSync: any[]
  
  // Actions
  setLanguage: (lang: 'en' | 'hi' | 'mr') => void
  updateLocation: (location: Partial<AppState['location']>) => void
  setOnlineStatus: (status: boolean) => void
  addCachedPrediction: (prediction: any) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      farmerName: 'Farmer',
      location: {
        district: 'Nashik',
        village: 'Dindori',
        state: 'Maharashtra'
      },
      isOnline: true,
      language: 'en',
      season: 'kharif',
      lastSync: new Date().toLocaleDateString(),
      cachedPredictions: [],
      pendingSync: [],
      
      setLanguage: (lang) => set({ language: lang }),
      updateLocation: (location) => 
        set((state) => ({ location: { ...state.location, ...location } })),
      setOnlineStatus: (status) => set({ isOnline: status }),
      addCachedPrediction: (prediction) =>
        set((state) => ({ 
          cachedPredictions: [...state.cachedPredictions, prediction],
          pendingSync: [...state.pendingSync, prediction]
        })),
    }),
    {
      name: 'agrochain-storage',
      // Store in IndexedDB for offline persistence
      getStorage: () => ({
        getItem: async (name: string) => {
          // Implement IndexedDB get
          return localStorage.getItem(name)
        },
        setItem: async (name: string, value: string) => {
          // Implement IndexedDB set
          localStorage.setItem(name, value)
        },
        removeItem: async (name: string) => {
          // Implement IndexedDB remove
          localStorage.removeItem(name)
        },
      }),
    }
  )
)