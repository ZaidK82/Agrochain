# AgroChain Models

This directory contains the trained machine learning and deep learning models used in AgroChain. These models power crop recommendation, yield prediction, disease detection, soil classification, and resilience assessment modules.

The models were trained using curated agricultural, climate, soil, and computer vision datasets and are used by the AgroChain backend for inference and decision support.

## Included Models

- Crop Recommendation Models
- Yield Prediction Models
- Disease Detection Model
- Soil Classification Model
- Resilience Scoring Model

## Note

Due to repository size limitations, trained model files may not be included directly in GitHub.

Model weights can be accessed separately through the project team or the provided storage links.

The datasets cna be accessed from :
- AgroChain Agricultural Intelligence Dataset : https://www.kaggle.com/datasets/zaidkhan4782/agrochain-agricultural-intelligence-dataset

- AgroChain Unified Crop Disease Dataset : https://www.kaggle.com/datasets/zaidkhan4782/diseasecv

- AgroChain Unified Soil Classification Dataset : https://www.kaggle.com/datasets/zaidkhan4782/soil-cv1

The datasets cna be accessed from :
### Yield Prediction Models
https://www.kaggle.com/datasets/zaidkhan4782/agrochain-yield-prediction-models

### Computer Vision Models
https://www.kaggle.com/datasets/zaidkhan4782/agrochain-disease-and-soil-classification-models

---

### Model Information

#### Disease Detection
- Architecture: EfficientNetV2-S
- Classes: 11 disease categories
- Validation Accuracy: 97.51%
- Dataset: 77,433 merged disease images from multiple public agricultural datasets

#### Soil Classification
- Architecture: EfficientNetV2-S
- Classes: 4 soil categories (Clay, Sandy, Silt, Loam)
- Validation Accuracy: 96.09%
- Dataset: 21,380 processed soil images after cleaning, balancing, and deduplication

#### Yield Prediction
- Models: XGBoost, LightGBM, CatBoost, and crop-specific ensemble models
- Dataset: 255,442 records covering 61 crops and 662 districts
- Performance: Best crop-specific models achieved R² scores up to 0.89

#### Crop Recommendation
- Models: Random Forest, Gradient Boosting, and Ensemble Models
- Inputs: Soil, climate, and environmental parameters
- Output: Suitable crop recommendations for a given region and season

#### Resilience Scoring
- Models: Tree-based ensemble regression models
- Inputs: Climate indicators, production metrics, and risk factors
- Output: Farm resilience and climate-risk assessment scores
