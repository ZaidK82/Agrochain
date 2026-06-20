import warnings
warnings.filterwarnings("ignore")

import pandas as pd
import numpy as np
import joblib
import time
from pathlib import Path

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, top_k_accuracy_score
from sklearn.preprocessing import LabelEncoder

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from lightgbm import LGBMClassifier
from xgboost import XGBClassifier

from joblib import Parallel, delayed

import shap

from ml.registry import registry


print("\n=======================================")
print("AGROCHAIN CROP RECOMMENDATION TRAINING")
print("=======================================\n")


# --------------------------------------------------
# LOAD DATA
# --------------------------------------------------

print("[STEP] Loading dataset...")

df = registry.base_df.copy()

print("Rows:", len(df))
print("Columns:", len(df.columns))


# --------------------------------------------------
# RESILIENCE PROXY
# --------------------------------------------------

print("\n[STEP] Computing resilience proxy...")

grouped = df.groupby(["district_uid", "crop"])

yield_std = grouped["yield_log"].std()

resilience_proxy = 1 - (yield_std / yield_std.max())
resilience_proxy = resilience_proxy.fillna(0)

proxy_df = resilience_proxy.reset_index()
proxy_df.columns = ["district_uid", "crop", "resilience_proxy"]

df = df.merge(proxy_df, on=["district_uid", "crop"], how="left")


# --------------------------------------------------
# NORMALIZED YIELD
# --------------------------------------------------

print("\n[STEP] Computing normalized yield...")

df["yield"] = np.expm1(df["yield_log"])

yield_norm = df.groupby(
    ["district_uid", "season"]
)["yield"].transform(
    lambda x: (x - x.min()) / (x.max() - x.min() + 1e-6)
)

df["yield_norm"] = yield_norm


# --------------------------------------------------
# SUITABILITY SCORE
# --------------------------------------------------

print("\n[STEP] Computing suitability score...")

df["score"] = 0.6 * df["yield_norm"] + 0.4 * df["resilience_proxy"]


# --------------------------------------------------
# BEST CROP LABEL
# --------------------------------------------------

print("\n[STEP] Generating best crop labels...")

best = df.loc[df.groupby(
    ["district_uid", "year", "season"]
)["score"].idxmax()]

best = best[
    ["district_uid", "year", "season", "crop"]
]

best.columns = [
    "district_uid",
    "year",
    "season",
    "recommended_crop"
]

df = df.merge(
    best,
    on=["district_uid", "year", "season"],
    how="inner"
)

print("Training rows:", len(df))


# --------------------------------------------------
# FEATURE SET
# --------------------------------------------------

print("\n[STEP] Preparing features...")

feature_cols = [

    # climate
    "rain_volatility_stress",
    "climate_heat_stress_days",

    # water
    "irrigation_coverage_ratio",
    "gw_dependence_ratio",
    "drought_protection_index",

    # soil
    "soil_fertility_stress",
    "rain_whc_stability",
    "soil_structure_index",
    "organic_carbon_pct",
    "ph",

    # interactions
    "rain_irrigation_interaction",
    "heat_gw_interaction",
    "temp_irrigation_interaction",

    # historical
    "crop_historical_mean",
    "crop_yield_drift"
]

feature_cols = [f for f in feature_cols if f in df.columns]

print("Features used:", len(feature_cols))

X = df[feature_cols].fillna(0)


# --------------------------------------------------
# LABEL ENCODING
# --------------------------------------------------

print("\n[STEP] Encoding crop labels...")

label_encoder = LabelEncoder()

y = label_encoder.fit_transform(df["recommended_crop"])

print("Crop classes:", len(label_encoder.classes_))


# --------------------------------------------------
# TRAIN TEST SPLIT
# --------------------------------------------------

print("\n[STEP] Train/Test split...")

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print("Train:", len(X_train))
print("Test:", len(X_test))


# --------------------------------------------------
# MODELS
# --------------------------------------------------

models = {

    "LightGBM": LGBMClassifier(
        n_estimators=300,
        learning_rate=0.05,
        num_leaves=64,
        class_weight="balanced",
        n_jobs=-1,
        verbosity=-1,
        random_state=42
    ),

    "XGBoost": XGBClassifier(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        tree_method="hist",
        eval_metric="mlogloss",
        n_jobs=-1,
        verbosity=0,
        random_state=42
    ),

    "RandomForest": RandomForestClassifier(
        n_estimators=250,
        max_depth=12,
        n_jobs=-1,
        class_weight="balanced",
        random_state=42
    ),

}


# --------------------------------------------------
# TRAIN FUNCTION
# --------------------------------------------------

def train_model(name, model):

    print(f"\nTraining {name}...")

    start = time.time()

    model.fit(X_train, y_train)

    pred = model.predict(X_test)

    probs = model.predict_proba(X_test)

    acc = accuracy_score(y_test, pred)

    top3 = top_k_accuracy_score(
        y_test,
        probs,
        k=3,
        labels=np.arange(len(label_encoder.classes_))
    )

    cv = cross_val_score(model, X_train, y_train, cv=3).mean()

    duration = round(time.time() - start, 2)

    print(f"{name} Accuracy:", round(acc,4))
    print(f"{name} Top3:", round(top3,4))
    print(f"{name} CV:", round(cv,4))
    print(f"{name} Time:", duration,"sec")

    return {
        "name": name,
        "model": model,
        "accuracy": acc,
        "top3": top3
    }


# --------------------------------------------------
# PARALLEL TRAINING
# --------------------------------------------------

print("\n[STEP] Training models in parallel...")

results = Parallel(n_jobs=len(models))(
    delayed(train_model)(name, model)
    for name, model in models.items()
)


# --------------------------------------------------
# BEST MODEL
# --------------------------------------------------

best = max(results, key=lambda x: x["accuracy"])

best_model = best["model"]
best_name = best["name"]

print("\n==============================")
print("BEST MODEL:", best_name)
print("BEST ACCURACY:", round(best["accuracy"],4))
print("==============================")


# --------------------------------------------------
# FEATURE IMPORTANCE
# --------------------------------------------------

print("\nTop Feature Importance:")

if hasattr(best_model, "feature_importances_"):

    importance = best_model.feature_importances_

    idx = np.argsort(importance)[::-1]

    for i in idx[:10]:

        print(feature_cols[i], ":", round(importance[i],4))


# --------------------------------------------------
# SHAP EXPLAINABILITY
# --------------------------------------------------

print("\n[STEP] Generating SHAP explainer...")

explainer = shap.TreeExplainer(best_model)

sample = X_test.iloc[:200]

_ = explainer.shap_values(sample)

print("SHAP ready.")


# --------------------------------------------------
# SAVE MODEL
# --------------------------------------------------

print("\n[STEP] Saving model...")

save_dir = Path("ml/models/recommendation")

save_dir.mkdir(parents=True, exist_ok=True)

joblib.dump(
{
    "model": best_model,
    "features": feature_cols,
    "label_encoder": label_encoder,
    "model_name": best_name,
    "classes": label_encoder.classes_
},
save_dir / "recommendation_model.pkl"
)

print("Model saved successfully.")