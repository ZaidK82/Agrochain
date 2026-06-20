from fastapi import APIRouter
from ml.services.resilience_service import ResilienceService
from app.schemas import ResilienceOutput

router = APIRouter()

service = ResilienceService()


@router.post("/resilience/evaluate", response_model=ResilienceOutput)
def evaluate_resilience(payload: dict):

    result = service.compute(
        payload,
        predicted_yield=payload.get("predicted_yield", 0),
        yield_range=payload.get("yield_range", [0, 0])
    )

    return result