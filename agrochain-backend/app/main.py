from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.endpoints import predict
from app.api.v1 import api_router
from app.api.v1.endpoints import disease
from datetime import datetime

app = FastAPI(title=settings.app_name, version="1.0.0", debug=settings.debug)

app.include_router(api_router, prefix="/api/v1")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/")
async def root():
    from ml.registry import registry
    return {
        "message": "AgroChain API",
        "status": "operational",
        "models_loaded": registry.list_available_crops(),
        "timestamp": datetime.utcnow().isoformat(),
    }

@app.get("/health")
async def health():
    from ml.registry import registry
    return {
        "status": "healthy",
        "models_loaded": len(registry.models),
        "available_crops": registry.list_available_crops(),
    }

# ============================================
# BLOCKCHAIN INITIALIZATION (NON-BLOCKING)
# ============================================

@app.on_event("startup")
async def initialize_blockchain():
    """Initialize blockchain service on startup (never blocks)"""
    try:
        from app.api.v1.endpoints.blockchain import blockchain_service
        result = blockchain_service.initialize()
        print(f"[STARTUP] Blockchain: {result.get('status', 'unknown')}")
    except Exception as e:
        print(f"[STARTUP] Blockchain init skipped: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.debug)