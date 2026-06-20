export interface Farmer {
  id: string
  name: string
  location: string
  farmSize: number
  reputation: number
  memberSince: string
}

// ADD these interfaces that match your backend response:
export interface YieldPredictionRequest {
  crop: string;
  district: string;
  soil_n: number;
  soil_p: number;
  soil_k: number;
  soil_ph: number;
  rainfall: number;
  temperature: number;
  area_hectares: number;
}

export interface YieldPredictionResponse {
  crop: string;
  model_type: string;
  predicted_yield: number | null;
  yield_range: [number, number] | null;
  confidence: string | null;
  contributing_factors: string[];
  explanation: string | null;
}

// UPDATE existing Prediction interface to include real data:
export interface Prediction {
  id: string;
  crop: Crop;
  yield: number;
  confidence: number;
  reasons: string[];
  risks: string[];
  verification: Verification;
  // NEW: Real data from backend (optional for now)
  realData?: YieldPredictionResponse;
}

export interface Crop {
  id: string
  name: string
  variety: string
  matchScore: number
  image?: string
}

export interface Verification {
  id: string
  status: 'verified' | 'pending' | 'failed'
  transactionHash?: string
  timestamp: string
  blockNumber?: number
}

export interface CropNFT {
  id: string
  crop: Crop
  status: 'planned' | 'sowing' | 'growing' | 'harvested' | 'sold'
  area: number
  expectedYield: number
  estimatedValue: number
  timeline: TimelineEvent[]
  verifications: Verification[]
  createdAt: string
}

export interface TimelineEvent {
  id: string
  type: 'sowing' | 'growth' | 'harvest' | 'verification'
  title: string
  description: string
  date: string
  verified: boolean
}

export interface MarketPrice {
  crop: string
  price: number
  change: number
  unit: string
  mandi: string
  updatedAt: string
}

export interface Alert {
  id: string
  type: 'weather' | 'price' | 'pest' | 'recommendation'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high'
  read: boolean
  createdAt: string
}

export interface Activity {
  id: string
  type: 'prediction' | 'verification' | 'registration' | 'photo'
  title: string
  description: string
  timestamp: string
  icon: string
}