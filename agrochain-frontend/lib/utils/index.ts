import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (format === 'short') {
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    })
  }
  
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function truncateHash(hash: string, start: number = 6, end: number = 4): string {
  if (hash.length <= start + end) return hash
  return `${hash.slice(0, start)}...${hash.slice(-end)}`
}

export function calculateYieldRange(predictedYield: number, confidence: number): [number, number] {
  const margin = predictedYield * ((100 - confidence) / 100)
  return [
    Math.round(predictedYield - margin),
    Math.round(predictedYield + margin),
  ]
}

export function getCropEmoji(cropName: string): string {
  const emojiMap: Record<string, string> = {
    'soybean': '🌱',
    'wheat': '🌾',
    'rice': '🍚',
    'cotton': '🧵',
    'pigeon pea': '🫘',
    'maize': '🌽',
    'sugarcane': '🎋',
    'groundnut': '🥜',
  }
  
  return emojiMap[cropName.toLowerCase()] || '🌱'
}

export function generateVerificationId(): string {
  return `AG-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
}

export function isOffline(): boolean {
  return typeof window !== 'undefined' && !navigator.onLine
}

export function formatDistanceToNow(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - d.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
  return `${Math.floor(diffInMinutes / 1440)}d ago`
}