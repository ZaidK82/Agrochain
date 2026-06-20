from fastapi import APIRouter, UploadFile, File
import shutil
import os

from ml.services.vision_service import predict_disease, estimate_severity

router = APIRouter()

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/disease-detect")
async def detect_disease(file: UploadFile = File(...)):

    filename = os.path.join(UPLOAD_DIR, file.filename)

    # save uploaded image
    with open(filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # run disease prediction
    result = predict_disease(filename)

    disease = result["disease"]
    confidence = result["confidence"]
    advisory = result["advisory"]

    # severity estimation
    severity = estimate_severity(filename)

    return {
        "disease": disease,
        "confidence": confidence,
        "severity": severity,
        "treatment": advisory["treatment"],
        "action": advisory["action"],
        "spread_risk": advisory["spread_risk"]
    }