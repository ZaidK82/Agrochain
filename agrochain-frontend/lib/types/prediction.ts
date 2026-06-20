const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PredictionRequest {
  crop: string;
  district_uid: string;
  year: number;
  season: string;
}

export interface ResilienceOutput {
  resilience_score: number
  risk_level: "Low" | "Moderate" | "High"
  climate_risk: number
  water_risk: number
  soil_risk: number
  yield_volatility: number
}

export interface PredictionResponse {
  crop: string;
  model_type: string;
  predicted_yield: number;
  yield_range: [number, number];
  confidence_score: number;
  confidence_label: string;
  top_contributing_factors: string[];
  model_route: string;
  debug_info?: any;
  resilience?: ResilienceOutput;
}

export async function fetchPrediction(
  data: PredictionRequest
): Promise<PredictionResponse> {
  const response = await fetch(`${API_BASE}/api/v1/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Prediction failed (${response.status}): ${errorText}`);
  }

  return response.json();
}