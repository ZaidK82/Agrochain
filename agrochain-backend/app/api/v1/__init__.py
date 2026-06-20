from fastapi import APIRouter

from .endpoints import predict
from .endpoints import metadata
from .endpoints import resilience
from .endpoints import recommendation
from .endpoints import disease
from .endpoints import farm_analysis
from .endpoints import climate_simulation
from .endpoints import chatbot
from .endpoints import blockchain  # ← MAKE SURE THIS IS UNCOMMENTED
from .endpoints import soil

api_router = APIRouter()

api_router.include_router(predict.router)
api_router.include_router(metadata.router)
api_router.include_router(resilience.router)
api_router.include_router(recommendation.router)
api_router.include_router(disease.router)
api_router.include_router(farm_analysis.router)
api_router.include_router(climate_simulation.router)
api_router.include_router(chatbot.router)
api_router.include_router(blockchain.router)  # ← MAKE SURE THIS IS UNCOMMENTED
api_router.include_router(soil.router)