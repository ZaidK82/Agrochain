from fastapi import APIRouter, UploadFile, File
import shutil
import os
from ml.services.vision_service import analyze_soil

router = APIRouter()

UPLOAD_DIR = "temp/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/soil-analyze")
async def analyze_soil_image(file: UploadFile = File(...)):
    filename = os.path.join(UPLOAD_DIR, file.filename)
    
    # Save uploaded image
    with open(filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Run soil analysis
    result = analyze_soil(filename)
    
    # Clean up
    os.remove(filename)
    
    return result