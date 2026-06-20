from fastapi import APIRouter, HTTPException
from typing import List, Dict
from pydantic import BaseModel

from app.schemas import PredictionRequest
from ml.services.inference import inference_service

router = APIRouter()


# ---------------------------------------------------------
# Request schema
# ---------------------------------------------------------

class ClimateSimulationRequest(BaseModel):
    farm: PredictionRequest
    scenarios: List[str]


# ---------------------------------------------------------
# Scenario modifiers
# ---------------------------------------------------------

SCENARIO_MODIFIERS = {
    "drought": {"rainfall_factor": 0.7},
    "heatwave": {"temperature_add": 3},
    "flood": {"rainfall_factor": 1.3},
    "cool_season": {"temperature_add": -2},
    "irrigation_improvement": {"irrigation_factor": 1.25}
}


# ---------------------------------------------------------
# Impact classification
# ---------------------------------------------------------

def classify_impact(change_percent: float):

    if change_percent > 10:
        return "Strong Positive"

    elif change_percent > 3:
        return "Moderate Positive"

    elif change_percent > -3:
        return "Minimal Impact"

    elif change_percent > -10:
        return "Moderate Negative"

    else:
        return "Severe Negative"


# ---------------------------------------------------------
# Scenario advisory messages
# ---------------------------------------------------------

def scenario_advice(scenario: str):

    advice = {
        "drought": "Reduced rainfall may stress crops. Consider drought-tolerant varieties and irrigation.",
        "heatwave": "High temperatures may affect crop growth. Monitor irrigation and heat stress.",
        "flood": "Excess rainfall can damage roots and cause nutrient leaching.",
        "cool_season": "Cooler temperatures may improve crop growth under heat stress conditions.",
        "irrigation_improvement": "Improved irrigation increases water availability for crops."
    }

    return advice.get(scenario, "Scenario analysis completed.")


# ---------------------------------------------------------
# Apply scenario modifications
# ---------------------------------------------------------

def apply_scenario(data: Dict, scenario: str):

    modified = data.copy()

    modifiers = SCENARIO_MODIFIERS.get(scenario)

    if not modifiers:
        raise ValueError(f"Unsupported scenario: {scenario}")

    if "rainfall_factor" in modifiers and modified.get("rainfall_override") is not None:
        modified["rainfall_override"] *= modifiers["rainfall_factor"]

    if "temperature_add" in modifiers and modified.get("temperature_override") is not None:
        modified["temperature_override"] += modifiers["temperature_add"]

    if "irrigation_factor" in modifiers and modified.get("irrigation_override") is not None:
        modified["irrigation_override"] *= modifiers["irrigation_factor"]

    return modified


# ---------------------------------------------------------
# Climate Simulation Endpoint
# ---------------------------------------------------------

@router.post("/simulate-climate")
async def simulate_climate(data: ClimateSimulationRequest):

    try:

        request = data.farm
        scenarios = data.scenarios

        base_input = request.model_dump()

        # -------------------------------
        # Baseline prediction
        # -------------------------------

        baseline_result, _ = inference_service.predict_yield(
            crop=request.crop,
            request_data=base_input
        )

        baseline_yield = baseline_result["predicted_yield"]

        results = []

        # -------------------------------
        # Run scenario simulations
        # -------------------------------

        for scenario in scenarios:

            modified_input = apply_scenario(base_input, scenario)

            scenario_result, _ = inference_service.predict_yield(
                crop=request.crop,
                request_data=modified_input
            )

            scenario_yield = scenario_result["predicted_yield"]

            change = scenario_yield - baseline_yield

            change_percent = (
                (change / baseline_yield) * 100 if baseline_yield else 0
            )

            results.append({

                "scenario": scenario,

                "predicted_yield": round(scenario_yield, 2),

                "resilience": scenario_result["resilience"],

                "yield_change": round(change, 2),

                "yield_change_percent": round(change_percent, 2),

                "impact_level": classify_impact(change_percent),

                "scenario_advice": scenario_advice(scenario)
            })

        # -------------------------------
        # Identify best scenario
        # -------------------------------

        best = max(results, key=lambda x: x["predicted_yield"])

        # -------------------------------
        # Return simulation results
        # -------------------------------

        return {

            "baseline": {
                "yield": round(baseline_yield, 2),
                "resilience": baseline_result["resilience"]
            },

            "best_scenario": {
                "scenario": best["scenario"],
                "predicted_yield": best["predicted_yield"],
                "impact_level": best["impact_level"]
            },

            "scenario_results": results
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Climate simulation failed: {str(e)}"
        )