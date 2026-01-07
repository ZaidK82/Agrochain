export const CROPS = [
  { id: 'soybean', name: 'Soybean', emoji: '🌱' },
  { id: 'wheat', name: 'Wheat', emoji: '🌾' },
  { id: 'rice', name: 'Rice', emoji: '🍚' },
  { id: 'cotton', name: 'Cotton', emoji: '🧵' },
  { id: 'pigeon_pea', name: 'Pigeon Pea', emoji: '🫘' },
  { id: 'maize', name: 'Maize', emoji: '🌽' },
  { id: 'sugarcane', name: 'Sugarcane', emoji: '🎋' },
  { id: 'groundnut', name: 'Groundnut', emoji: '🥜' },
] as const

export const DISTRICTS = [
  'Nagpur',
  'Amravati',
  'Akola',
  'Wardha',
  'Chandrapur',
  'Gadchiroli',
  'Bhandara',
  'Gondia',
] as const

export const SEASONS = [
  { id: 'kharif', name: 'Kharif', months: 'Jun-Oct' },
  { id: 'rabi', name: 'Rabi', months: 'Nov-Mar' },
  { id: 'summer', name: 'Summer', months: 'Mar-Jun' },
] as const

export const SOIL_TYPES = [
  'Black Soil',
  'Red Soil',
  'Laterite Soil',
  'Alluvial Soil',
  'Mountain Soil',
  'Desert Soil',
] as const

export const IRRIGATION_TYPES = [
  'Rainfed',
  'Well',
  'Canal',
  'Drip',
  'Sprinkler',
] as const

export const VERIFICATION_STATUS = {
  VERIFIED: 'verified',
  PENDING: 'pending',
  FAILED: 'failed',
} as const

export const NFT_STATUS = {
  PLANNED: 'planned',
  SOWING: 'sowing',
  GROWING: 'growing',
  HARVESTED: 'harvested',
  SOLD: 'sold',
} as const

export const ALERT_TYPES = {
  WEATHER: 'weather',
  PRICE: 'price',
  PEST: 'pest',
  RECOMMENDATION: 'recommendation',
} as const

export const BLOCKCHAIN = {
  NETWORK: 'Polygon Mainnet',
  EXPLORER_URL: 'https://polygonscan.com',
  IPFS_GATEWAY: 'https://ipfs.io/ipfs',
  CONTRACT_ADDRESS: '0x...', // Replace with actual contract address
} as const

export const API_ENDPOINTS = {
  PREDICT: '/api/predict',
  VERIFY: '/api/verify',
  NFT: '/api/nft',
  MARKET: '/api/market',
  WEATHER: '/api/weather',
  SOIL: '/api/soil',
} as const