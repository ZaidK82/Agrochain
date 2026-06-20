# ============================================================
# RUN ABLATION EXPERIMENTS ONLY (LOAD PRE-TRAINED MODELS)
# ============================================================

import numpy as np
import pandas as pd
import json
from pathlib import Path
from joblib import load
import warnings
warnings.filterwarnings('ignore')

from sklearn.metrics import r2_score, mean_squared_error
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer

# ============================================================
# CONFIG - USE YOUR EXISTING PATHS
# ============================================================

DATA_PATH = Path("C:/College work/BE sem 7/Major Project/Agrochain/agrochain-backend/data/cleaned_dataset_unified_v2_ready.parquet")
MODEL_DIR = Path("C:/College work/BE sem 7/Major Project/Agrochain/agrochain-backend/ml/models/crop_unified_v2")
OUTPUT_DIR = MODEL_DIR  # Save ablation results here

TRAIN_END = 2018
VAL_END = 2021
TEST_START = 2022

print("="*80)
print("🔬 RUNNING ABLATION EXPERIMENTS ONLY")
print("="*80)

# ============================================================
# LOAD DATA
# ============================================================

print("\n📂 Loading dataset...")
df = pd.read_parquet(DATA_PATH)
df = df.sort_values(["district_uid", "crop", "year"])

# ============================================================
# TEMPORAL SPLIT
# ============================================================

train = df[df["year"] <= TRAIN_END].copy()
val = df[(df["year"] > TRAIN_END) & (df["year"] <= VAL_END)].copy()
test = df[df["year"] >= TEST_START].copy()

print(f"Train: {len(train)} | Val: {len(val)} | Test: {len(test)}")

# ============================================================
# LOAD ENCODERS AND TRANSFORM CATEGORICAL DATA
# ============================================================

print("\n🔠 Loading categorical encoders...")
encoders = load(MODEL_DIR / "categorical_encoders.pkl")

object_cols = train.select_dtypes(include=["object"]).columns.tolist()
for col in object_cols:
    if col in encoders:
        le = encoders[col]
        train.loc[:, col] = train[col].astype(str).apply(
            lambda x: le.transform([x])[0] if x in le.classes_ else -1
        )
        test.loc[:, col] = test[col].astype(str).apply(
            lambda x: le.transform([x])[0] if x in le.classes_ else -1
        )

# ============================================================
# LOAD FEATURE LIST AND BEST MODEL
# ============================================================

print("\n📦 Loading best model...")
with open(MODEL_DIR / "feature_order.json", "r") as f:
    all_features = json.load(f)

# Load metadata to get best model name
with open(MODEL_DIR / "model_metadata.json", "r") as f:
    metadata = json.load(f)
    best_model_name = metadata["best_model"]

print(f"Best model: {best_model_name}")

# Load the trained model
best_model = load(MODEL_DIR / "BEST_MODEL.pkl")

# ============================================================
# DEFINE FEATURE GROUPS (SAME AS ORIGINAL)
# ============================================================

lag_features = [c for c in all_features if "lag" in c or "historical" in c or "drift" in c]
climate_features = [c for c in all_features if "climate" in c or "rain" in c or "temp" in c or "anomaly" in c]
soil_features = [c for c in all_features if c in ["ph","organic_carbon_pct","cec","clay_pct",
                                                   "sand_pct","silt_pct","water_holding_capacity_index",
                                                   "soil_structure_index","bdod"]]
irrigation_features = [c for c in all_features if "irrigation" in c or "gw_" in c or "surface_" in c]
crop_family_features = [c for c in all_features if "family_" in c]

no_lag = [c for c in all_features if c not in lag_features]
no_climate = [c for c in all_features if c not in climate_features]

print(f"\nFeature groups:")
print(f"  All features: {len(all_features)}")
print(f"  Lag features: {len(lag_features)}")
print(f"  Climate features: {len(climate_features)}")
print(f"  Soil features: {len(soil_features)}")
print(f"  Irrigation features: {len(irrigation_features)}")
print(f"  Crop family features: {len(crop_family_features)}")

# ============================================================
# ABLATION FUNCTION (FIXED VERSION)
# ============================================================

def run_ablation(feature_list, label):
    if len(feature_list) == 0:
        print(f"{label}: skipped (no features)")
        return None
    
    print(f"\n▶️ Running {label} ({len(feature_list)} features)...")
    
    # Extract features
    X_train_ab = train[feature_list].astype(np.float32)
    X_test_ab = test[feature_list].astype(np.float32)
    
    # Handle missing values with a new imputer - FIXED VERSION
    if X_train_ab.isna().any().any() or X_test_ab.isna().any().any():
        print(f"  Found missing values, imputing...")
        imputer = SimpleImputer(strategy='median')
        X_train_ab = pd.DataFrame(
            imputer.fit_transform(X_train_ab),
            columns=feature_list
        )
        X_test_ab = pd.DataFrame(
            imputer.transform(X_test_ab),
            columns=feature_list
        )
    
    y_train_ab = train["yield_log"]
    y_test_ab = test["yield_log"]
    
    # Scale for ElasticNet/MLP if needed (check model type)
    if best_model_name in ["elastic", "mlp"]:
        print(f"  Scaling features for {best_model_name}...")
        scaler = StandardScaler()
        X_train_ab = pd.DataFrame(
            scaler.fit_transform(X_train_ab),
            columns=feature_list
        )
        X_test_ab = pd.DataFrame(
            scaler.transform(X_test_ab),
            columns=feature_list
        )
    
    # Train on subset
    print(f"  Training {best_model_name} on {label}...")
    
    # Create a new model instance with same parameters
    if best_model_name == "cat":
        from catboost import CatBoostRegressor
        model_copy = CatBoostRegressor(
            **best_model.get_params(),
            verbose=0  # Silence output
        )
    elif best_model_name == "xgb":
        import xgboost as xgb
        model_copy = xgb.XGBRegressor(
            **best_model.get_params(),
            verbosity=0
        )
    elif best_model_name == "lgb":
        import lightgbm as lgb
        model_copy = lgb.LGBMRegressor(
            **best_model.get_params(),
            verbose=-1
        )
    else:
        # For sklearn models
        model_copy = best_model.__class__(**best_model.get_params())
    
    # Fit the model
    model_copy.fit(X_train_ab, y_train_ab)
    
    # Evaluate
    pred = model_copy.predict(X_test_ab)
    r2 = r2_score(y_test_ab, pred)
    rmse = np.sqrt(mean_squared_error(y_test_ab, pred))
    
    print(f"  ✅ {label} - R2: {r2:.4f}, RMSE: {rmse:.4f}")
    
    return {
        "experiment": label,
        "r2": r2,
        "rmse": rmse,
        "feature_count": len(feature_list)
    }

# ============================================================
# RUN ALL ABLATION EXPERIMENTS
# ============================================================

print("\n" + "="*80)
print("🔬 RUNNING ABLATION EXPERIMENTS")
print("="*80)

ablation_configs = [
    (all_features, "FULL_FEATURE_SET"),
    (lag_features, "LAG_ONLY"),
    (climate_features, "CLIMATE_ONLY"),
    (soil_features, "SOIL_ONLY"),
    (irrigation_features, "IRRIGATION_ONLY"),
    (crop_family_features, "CROP_FAMILY_ONLY"),
    (no_lag, "NO_LAG"),
    (no_climate, "NO_CLIMATE")
]

ablation_results = []
for features, label in ablation_configs:
    result = run_ablation(features, label)
    if result:
        ablation_results.append(result)

# ============================================================
# SAVE RESULTS
# ============================================================

ablation_df = pd.DataFrame(ablation_results)
print("\n" + "="*80)
print("📊 ABLATION RESULTS SUMMARY")
print("="*80)
print(ablation_df.to_string(index=False))

# Save to CSV
output_path = OUTPUT_DIR / "feature_ablation_results.csv"
ablation_df.to_csv(output_path, index=False)
print(f"\n✅ Results saved to: {output_path}")

# Also save as JSON for easy viewing
with open(OUTPUT_DIR / "feature_ablation_results.json", "w") as f:
    json.dump(ablation_results, f, indent=4)