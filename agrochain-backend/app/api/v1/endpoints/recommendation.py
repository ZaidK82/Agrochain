from fastapi import APIRouter
from ml.services.recommendation_service import get_recommendation_service

router = APIRouter()


@router.post("/recommend")
def recommend(payload: dict):

    service = get_recommendation_service()

    scenario = payload.get("climate_scenario")

    results = service.recommend(
        payload,
        scenario
    )

    return {
        "recommendations": results
    }