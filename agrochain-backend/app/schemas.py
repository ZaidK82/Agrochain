from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from enum import Enum


class ChatRequest(BaseModel):
    question: str
    session_id: str
    farm_analysis: Optional[Dict[str, Any]] = None

class ModelType(str, Enum):
    YIELD_REGRESSION = "yield_regression"
    RISK_CLASSIFIER = "risk_classifier"


class PredictionRequest(BaseModel):
    crop: str
    district_uid: str
    year: int
    season: str

    # Optional overrides
    rainfall_override: Optional[float] = None
    temperature_override: Optional[float] = None

class ResilienceOutput(BaseModel):
    resilience_score: float
    percentile_rank: float  # Added this field
    risk_level: str
    climate_risk: float
    water_risk: float
    soil_risk: float
    yield_volatility: float

    
class PredictionResponse(BaseModel):
    model_config = ConfigDict(
        protected_namespaces=(),
        use_enum_values=True
    )

    crop: str
    model_type: ModelType = ModelType.YIELD_REGRESSION

    predicted_yield: float
    yield_range: List[float]

    confidence_score: float
    confidence_label: str

    top_contributing_factors: List[str]
    model_route: str

    debug_info: Optional[Dict[str, Any]] = None
    resilience: Optional[ResilienceOutput] = None
    advisory: Optional[Dict[str, Any]] = None

2