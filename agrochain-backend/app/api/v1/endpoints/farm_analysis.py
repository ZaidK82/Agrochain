from fastapi import APIRouter, HTTPException
from typing import Optional

from app.schemas import PredictionRequest
from ml.services.inference import inference_service
from ml.services.recommendation_service import get_recommendation_service
from ml.services.vision_service import predict_disease, estimate_severity
from ml.services.trust_pipeline import trust_pipeline

router = APIRouter()


def summarize_risk(resilience):
    """
    Identify the primary farm risk
    """

    risks = [
        ("climate", resilience["climate_risk"]),
        ("water", resilience["water_risk"]),
        ("soil", resilience["soil_risk"]),
        ("yield volatility", resilience["yield_volatility"]),
    ]

    main_risk = max(risks, key=lambda x: x[1])

    return {
        "risk_factor": main_risk[0],
        "severity_score": main_risk[1]
    }


def generate_farm_summary(prediction, resilience, advisory, best_crop):

    yield_val = prediction["predicted_yield"]
    risk_level = resilience["risk_level"]

    summary = f"Predicted yield is {round(yield_val,2)} with {risk_level.lower()} production risk. "

    # Identify dominant risk
    risks = {
        "climate": resilience["climate_risk"],
        "water": resilience["water_risk"],
        "soil": resilience["soil_risk"],
        "volatility": resilience["yield_volatility"]
    }

    main_risk = max(risks, key=risks.get)

    # Adaptive explanation
    if main_risk == "climate":
        summary += "Weather variability may affect crop growth. Monitor rainfall and temperature conditions. "

    elif main_risk == "water":
        summary += "Water availability could limit productivity. Improve irrigation scheduling. "

    elif main_risk == "soil":
        summary += "Soil fertility appears to be the primary constraint affecting yield. Consider soil nutrient management. "

    elif main_risk == "volatility":
        summary += "Yield stability is uncertain due to historical fluctuations. Diversifying crops may reduce risk. "

    # Add advisory message
    if advisory["key_risks"]:
        summary += f"Primary concern detected: {advisory['key_risks'][0]}. "

    if best_crop:
        summary += f"Based on current conditions, {best_crop} is a recommended crop option."

    return summary


@router.post("/farm-analysis")
async def farm_analysis(
    request: PredictionRequest,
    image_path: Optional[str] = None
):

    try:

        # -----------------------------------
        # 1️⃣ Yield Prediction
        # -----------------------------------

        prediction_result, _ = inference_service.predict_yield(
            crop=request.crop,
            request_data=request.model_dump()
        )

        resilience = prediction_result["resilience"]

        advisory = prediction_result["advisory"]
        print(f"[DEBUG] Advisory type: {type(advisory)}")
        print(f"[DEBUG] Advisory keys: {advisory.keys() if isinstance(advisory, dict) else 'not a dict'}")

        # -----------------------------------
        # 2️⃣ Crop Recommendation
        # -----------------------------------

        recommendation_service = get_recommendation_service()

        recommendations = recommendation_service.recommend(
            request.model_dump()
        )

        best_crop = None
        if recommendations:
            best_crop = recommendations[0]["crop"]

        # -----------------------------------
        # 3️⃣ Optional Disease Detection
        # -----------------------------------

        disease_result = None

        if image_path:

            disease = predict_disease(image_path)

            severity = estimate_severity(image_path)

            disease_result = {
                "disease": disease["disease"],
                "confidence": disease["confidence"],
                "severity": severity,
                "treatment": disease["advisory"]["treatment"],
                "action": disease["advisory"]["action"],
                "spread_risk": disease["advisory"]["spread_risk"]
            }

        # -----------------------------------
        # 4️⃣ Risk Summary
        # -----------------------------------

        risk_summary = summarize_risk(resilience)

        # -----------------------------------
        # 5️⃣ Farm Summary
        # -----------------------------------

        farm_summary = generate_farm_summary(
            prediction_result,
            resilience,
            advisory,
            best_crop
        )

        # After advisory is generated (around line ~150)
        # Add trust verification
        trust_metadata = trust_pipeline.process_advisory(advisory)

        try:
            trust_metadata = trust_pipeline.process_advisory(advisory)
            print(f"[DEBUG] Trust metadata generated: {trust_metadata.get('advisory_id', 'N/A')[:20]}...")
        except Exception as e:
            print(f"[DEBUG] Trust pipeline error: {e}")
            trust_metadata = {
                "advisory_id": "error",
                "content_hash": "error",
                "verification_status": "error",
                "error": str(e)
            }

        # -----------------------------------
        # 6️⃣ Final Response
        # -----------------------------------

        return {

            "farm_health_score": advisory["farm_health_score"],

            "farm_summary": farm_summary,

            "best_crop": best_crop,

            "risk_summary": risk_summary,

            "prediction": {
                "predicted_yield": prediction_result["predicted_yield"],
                "yield_range": prediction_result["yield_range"],
                "confidence": prediction_result["confidence_label"],
                "model_route": prediction_result["model_route"]
            },

            "resilience": resilience,

            "advisory": advisory,

            "recommended_crops": recommendations,

            "trust_metadata": trust_metadata,

            "disease_detection": disease_result
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Farm analysis failed: {str(e)}"
        )