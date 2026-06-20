import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import r2_score, mean_absolute_error
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from tqdm import tqdm

from ml.registry import registry
from ml.services.resilience_service import ResilienceService

# --------------------------------------------------
# Load cleaned dataset
# --------------------------------------------------
print("Loading data...")
df = registry.base_df.copy()

# --------------------------------------------------
# Compute Yield Volatility Proxy
# --------------------------------------------------
print("Computing yield volatility proxy...")
grouped = df.groupby(["district_uid", "crop"])

volatility = grouped["yield_log"].std()
mean_yield = grouped["yield_log"].mean()

proxy_resilience = 1 - (volatility / volatility.max())
proxy_resilience = proxy_resilience.fillna(0)

proxy_df = proxy_resilience.reset_index()
proxy_df.columns = ["district_uid", "crop", "proxy_resilience"]

df = df.merge(proxy_df, on=["district_uid", "crop"], how="left")

# --------------------------------------------------
# Initialize deterministic service
# --------------------------------------------------
print("Computing deterministic resilience scores...")
res_service = ResilienceService()

deterministic_scores = []

for _, row in tqdm(df.iterrows(), total=len(df), desc="Computing scores"):
    features = row.to_dict()

    # Fake prediction values for training baseline
    predicted_yield = np.expm1(row["yield_log"])
    yield_range = [predicted_yield * 0.9, predicted_yield * 1.1]

    result = res_service.compute(
        features=features,
        predicted_yield=predicted_yield,
        yield_range=yield_range
    )

    deterministic_scores.append(result["resilience_score"] / 100)

df["deterministic_resilience"] = deterministic_scores

# --------------------------------------------------
# Residual Target
# --------------------------------------------------
df["residual"] = df["proxy_resilience"] - df["deterministic_resilience"]

# --------------------------------------------------
# Enhanced Feature Engineering
# --------------------------------------------------
print("Engineering features...")

base_features = [
    # Climate features
    "rain_volatility_stress",
    "flood_stress_index",
    "climate_heat_stress_days",
    "temp_anomaly",
    "rain_anomaly_pct",
    
    # Water features
    "irrigation_coverage_ratio",
    "gw_dependence_ratio",
    "heat_gw_stress",
    "drought_protection_index",
    
    # Soil features
    "soil_fertility_stress",
    "rain_whc_stability",
    "soil_structure_index",
    "organic_carbon_pct",
    "ph",
    
    # Interaction features
    "rain_irrigation_interaction",
    "heat_gw_interaction",
    "temp_irrigation_interaction",
    
    # Historical context
    "crop_historical_mean",
    "crop_yield_drift",
]

# Only keep features that exist
feature_cols = [f for f in base_features if f in df.columns]
print(f"Using {len(feature_cols)} features")

X = df[feature_cols].fillna(0)
y = df["residual"].fillna(0)

# --------------------------------------------------
# Train/Test Split
# --------------------------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"Train: {len(X_train)}, Test: {len(X_test)}")

# --------------------------------------------------
# Try Multiple Models
# --------------------------------------------------
print("\n=== MODEL COMPARISON ===\n")

models = {
    "GradientBoosting": GradientBoostingRegressor(
        n_estimators=500,
        learning_rate=0.03,
        max_depth=4,
        subsample=0.8,
        min_samples_split=20,
        random_state=42
    ),
    "RandomForest": RandomForestRegressor(
        n_estimators=300,
        max_depth=10,
        min_samples_split=10,
        n_jobs=-1,
        random_state=42
    ),
    "XGBoost": XGBRegressor(
        n_estimators=500,
        learning_rate=0.03,
        max_depth=4,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbosity=0
    ),
    "LightGBM": LGBMRegressor(
        n_estimators=500,
        learning_rate=0.03,
        max_depth=4,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbose=-1
    )
}

best_model = None
best_score = -np.inf

for name, model in models.items():
    # Cross-validation
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='r2')
    cv_mean = cv_scores.mean()
    cv_std = cv_scores.std()
    
    # Train and test
    model.fit(X_train, y_train)
    train_pred = model.predict(X_train)
    test_pred = model.predict(X_test)
    
    train_r2 = r2_score(y_train, train_pred)
    test_r2 = r2_score(y_test, test_pred)
    test_mae = mean_absolute_error(y_test, test_pred)
    
    print(f"\n{name}:")
    print(f"  CV R²: {cv_mean:.4f} ± {cv_std:.4f}")
    print(f"  Train R²: {train_r2:.4f}")
    print(f"  Test R²: {test_r2:.4f}")
    print(f"  Test MAE: {test_mae:.4f}")
    
    if test_r2 > best_score:
        best_score = test_r2
        best_model = model
        best_model_name = name

print(f"\n✅ Best model: {best_model_name} with R² = {best_score:.4f}")

# --------------------------------------------------
# Feature Importance Analysis
# --------------------------------------------------
print("\n=== FEATURE IMPORTANCE ===\n")

if hasattr(best_model, 'feature_importances_'):
    importances = best_model.feature_importances_
    indices = np.argsort(importances)[::-1][:15]
    
    for i, idx in enumerate(indices):
        print(f"{i+1}. {feature_cols[idx]}: {importances[idx]:.4f}")

# --------------------------------------------------
# Save Model
# --------------------------------------------------
save_path = Path("ml/models/resilience")
save_path.mkdir(parents=True, exist_ok=True)

model_data = {
    'model': best_model,
    'feature_cols': feature_cols,
    'model_name': best_model_name,
    'test_r2': best_score
}

joblib.dump(model_data, save_path / "resilience_hybrid.pkl")
print(f"\n✅ Model saved to {save_path / 'resilience_hybrid.pkl'}")