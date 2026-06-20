from fastapi import APIRouter, HTTPException
from app.schemas import PredictionRequest, PredictionResponse
from ml.services.inference import inference_service
import os

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
async def predict_yield(request: PredictionRequest):
    """
    Main prediction endpoint
    """

    try:
        print(f"\n[DEBUG] Received prediction request for crop: {request.crop}")

        # Run inference
        result, debug_info = inference_service.predict_yield(
            crop=request.crop,
            request_data=request.model_dump()
        )

        # Build structured response
        response = PredictionResponse(
            crop=request.crop,
            predicted_yield=result["predicted_yield"],
            yield_range=tuple(result["yield_range"]),
            confidence_score=result["confidence_score"],
            confidence_label=result["confidence_label"],
            top_contributing_factors=result["top_contributing_factors"],
            model_route=result["model_route"],
            resilience=result.get("resilience"),
            advisory=result.get("advisory")
        )

        # Add debug info only in dev mode
        if os.getenv("DEBUG", "False").lower() == "true":
            response.debug_info = debug_info

        print("[DEBUG] Full result:", result)
        print("[DEBUG] Sending response")
        return response

    except Exception as e:
        print(f"[ERROR] Prediction failed: {e}")
        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


@router.post("/debug/transform")
async def debug_transform(request: PredictionRequest):
    """
    Debug endpoint to see feature transformation
    """
    try:
        from ml.services.inference import inference_service

        features = inference_service.feature_builder.build_features(
            request.model_dump()
        )

        return {
            "frontend_input": request.model_dump(),
            "transformed_features": features.values.tolist(),
            "feature_count": features.shape[1],
            "feature_names": list(features.columns),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Transformation failed: {str(e)}"
        )