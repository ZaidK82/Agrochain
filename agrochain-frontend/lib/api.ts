const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// ============================================
// EXISTING FUNCTIONS (Keep as is)
// ============================================

export async function fetchPrediction(data: any) {
  const response = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Prediction failed`);
  return response.json();
}

export async function fetchMetadata() {
  const response = await fetch(`${API_BASE}/metadata`);  // Uses API_BASE with /api/v1
  if (!response.ok) {
    throw new Error("Failed to fetch metadata");
  }
  return response.json();
}

// ============================================
// NEW FUNCTION: FARM ANALYSIS (REPLACES PREDICT)
// ============================================

export interface FarmAnalysisRequest {
  crop: string;
  district_uid: string;
  year: number;
  season: string;
  rainfall_override?: number | null;
  temperature_override?: number | null;
}

export interface TrustMetadata {
  advisory_id: string;
  content_hash: string;
  signature: string;
  blockchain: {
    status: string;
    tx_hash?: string;
    block?: number;
    mock?: boolean;
    message?: string;
  };
  verification_status: string;
  issued_at?: number;
  expires_at?: number;
}

export interface FarmAnalysisResponse {
  farm_health_score: number;
  farm_summary: string;
  best_crop: string | null;
  risk_summary: {
    risk_factor: string;
    severity_score: number;
  };
  prediction: {
    predicted_yield: number;
    yield_range: [number, number];
    confidence: string;
    model_route: string;
  };
  resilience: {
    resilience_score: number;
    percentile_rank: number;
    risk_level: string;
    climate_risk: number;
    water_risk: number;
    soil_risk: number;
    yield_volatility: number;
  };
  advisory: {
    farm_health_score: number;
    risk_summary: string;
    key_risks: string[];
    recommended_actions: string[];
    monitoring_advice: string[];
    yield_driver_explanations: string[];
  };
  recommended_crops: Array<{
    crop: string;
    yield: number;
    resilience: number;
    score: number;
  }>;
  trust_metadata?: TrustMetadata;
  disease_detection?: any;
}

export async function fetchFarmAnalysis(data: FarmAnalysisRequest): Promise<FarmAnalysisResponse> {
  const response = await fetch(`${API_BASE}/farm-analysis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Farm analysis failed: ${errorText}`);
  }
  
  return response.json();
}

// ============================================
// BLOCKCHAIN VERIFICATION (USES YOUR BACKEND)
// ============================================

export async function verifyAdvisory(advisory_id: string, content_hash: string) {
  const response = await fetch(`${API_BASE}/blockchain/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ advisory_id, content_hash }),
  });
  
  if (!response.ok) throw new Error("Verification failed");
  return response.json();
}

export async function getBlockchainStatus() {
  const response = await fetch(`${API_BASE}/blockchain/status`);
  if (!response.ok) throw new Error("Failed to get blockchain status");
  return response.json();
}

export async function testBackendConnection(): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:8000/health`);
    return response.ok;
  } catch {
    return false;
  }
}