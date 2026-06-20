import torch
import timm
import json
import cv2
import numpy as np
import json
import os

from PIL import Image
from torchvision import transforms


from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

VISION_DIR = BASE_DIR / "models" / "vision"

CLASSES_PATH = VISION_DIR / "disease" / "classes.json"
MODEL_PATH = VISION_DIR / "disease" / "disease_model.pth"
CHECKPOINT_PATH = VISION_DIR / "disease" / "agrochain_checkpoint.pth"

device = "cuda" if torch.cuda.is_available() else "cpu"


# Load classes
with open(CLASSES_PATH) as f:
    classes = json.load(f)


model = timm.create_model(
    "tf_efficientnetv2_s.in21k_ft_in1k",
    pretrained=False,
    num_classes=len(classes)
)

checkpoint = torch.load(MODEL_PATH, map_location=device)

# handle DataParallel models from training
if "module." in list(checkpoint.keys())[0]:
    checkpoint = {k.replace("module.", ""): v for k, v in checkpoint.items()}

model.load_state_dict(checkpoint, strict=False)

model.to(device)
model.eval()

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

ADVISORY_PATH = os.path.join(BASE_DIR, "knowledge", "disease_advisory.json")

with open(ADVISORY_PATH) as f:
    DISEASE_ADVISORY = json.load(f)

preprocess = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485,0.456,0.406],
        [0.229,0.224,0.225]
    )
])

def predict_disease(image_path):

    image = Image.open(image_path).convert("RGB")

    img_tensor = preprocess(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(img_tensor)
        probs = torch.softmax(outputs, dim=1)

    confidence, pred = torch.max(probs, 1)

    disease = classes[pred.item()]
    confidence = confidence.item()

    # Hybrid confidence filter
    if confidence < 0.45:
        disease = "unknown"

    advisory = DISEASE_ADVISORY.get(disease, {
        "treatment": "consult agronomist",
        "action": "manual inspection required",
        "spread_risk": "unknown"
    })

    return {
        "disease": disease,
        "confidence": confidence,
        "advisory": advisory
    }


def estimate_severity(image_path):

    image = cv2.imread(image_path)

    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    lower = np.array([10,40,40])
    upper = np.array([35,255,255])

    mask = cv2.inRange(hsv, lower, upper)

    lesion_pixels = np.sum(mask > 0)
    total_pixels = image.shape[0] * image.shape[1]

    ratio = lesion_pixels / total_pixels

    if ratio < 0.05:
        return "mild"

    elif ratio < 0.15:
        return "moderate"

    else:
        return "severe"

def analyze_soil(image_path: str) -> dict:
    """Analyze soil image and return predictions"""
    # Load soil model
    import torch
    import timm
    from pathlib import Path
    
    BASE_DIR = Path(__file__).resolve().parent.parent
    SOIL_MODEL_PATH = BASE_DIR / "models" / "vision" / "soil" / "soil_best_model.pth"
    
    # Load model (you'll need to implement the actual model loading)
    # This is a placeholder - implement based on your actual soil CV model
    model = torch.load(SOIL_MODEL_PATH, map_location='cpu')
    
    # Process image and get predictions
    # ... implement actual inference
    
    return {
        "ph": 6.8,
        "organic_carbon": 0.62,
        "clay_pct": 28.5,
        "structure_index": 3.2,
        "health_score": 68,
        "recommendations": [
            "Add organic compost to improve soil structure",
            "Maintain current pH level",
            "Consider cover cropping"
        ]
    }