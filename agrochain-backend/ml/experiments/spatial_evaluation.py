# ============================================================
# AGROCHAIN SPATIAL EVALUATION (PARALLEL VERSION)
# Location: ml/experiments/spatial_evaluation.py
# ============================================================

import numpy as np
import pandas as pd
import time

from joblib import Parallel, delayed

from sklearn.model_selection import GroupKFold
from sklearn.metrics import r2_score, mean_absolute_error

from xgboost import XGBRegressor

from ml.registry import registry


print("\n=======================================")
print("AGROCHAIN SPATIAL EVALUATION (PARALLEL)")
print("=======================================\n")

start_total = time.time()


# --------------------------------------------------
# LOAD DATA
# --------------------------------------------------

df = registry.base_df.copy()

print("Rows:", len(df))


# --------------------------------------------------
# FEATURES
# --------------------------------------------------

feature_cols = [
    "rain_volatility_stress",
    "climate_heat_stress_days",
    "irrigation_coverage_ratio",
    "gw_dependence_ratio",
    "drought_protection_index",
    "soil_fertility_stress",
    "rain_whc_stability",
    "soil_structure_index",
    "organic_carbon_pct",
    "ph",
    "rain_irrigation_interaction",
    "heat_gw_interaction",
    "temp_irrigation_interaction",
    "crop_historical_mean",
    "crop_yield_drift"
]

feature_cols = [f for f in feature_cols if f in df.columns]

X = df[feature_cols].fillna(0)
y = df["yield_log"].fillna(0)

print("Features:", len(feature_cols))


# ============================================================
# PARALLEL DISTRICT CV FUNCTION
# ============================================================

def run_fold(fold, train_idx, test_idx):

    print(f"Running Fold {fold+1}")

    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

    model = XGBRegressor(
        n_estimators=350,
        learning_rate=0.05,
        max_depth=5,
        subsample=0.8,
        colsample_bytree=0.8,
        n_jobs=1,  # IMPORTANT: avoid nested parallelism
        random_state=42 + fold,
        verbosity=0
    )

    model.fit(X_train, y_train)

    preds = model.predict(X_test)

    r2 = r2_score(y_test, preds)
    mae = mean_absolute_error(y_test, preds)

    return r2, mae


# ============================================================
# 1. DISTRICT CV (PARALLEL)
# ============================================================

print("\n[STEP 1] District CV (Parallel)...")

groups = df["district_uid"]
gkf = GroupKFold(n_splits=5)

folds = list(gkf.split(X, y, groups))

results = Parallel(n_jobs=5)(
    delayed(run_fold)(i, train_idx, test_idx)
    for i, (train_idx, test_idx) in enumerate(folds)
)

r2_scores = [r[0] for r in results]
mae_scores = [r[1] for r in results]

print("\n-------------------------------")
print("DISTRICT CV RESULTS")
print("-------------------------------")
print("Mean R²:", round(np.mean(r2_scores), 4))
print("Std R²:", round(np.std(r2_scores), 4))
print("Mean MAE:", round(np.mean(mae_scores), 4))
print("-------------------------------")

print(df.columns.tolist())

# ============================================================
# 2. STATE HOLDOUT (ROBUST VERSION)
# ============================================================

print("\n[STEP 2] State Holdout...")

# Try to detect state column automatically
state_col = None

possible_cols = ["state_name", "state", "State", "state_code", "State_Name"]

for col in possible_cols:
    if col in df.columns:
        state_col = col
        break

if state_col is None:
    print("⚠️ No state column found. Skipping state-level evaluation.")

else:
    print(f"Using state column: {state_col}")

    states = df[state_col].dropna().unique()

    if len(states) < 5:
        print("⚠️ Not enough states for holdout. Skipping.")
    else:

        np.random.seed(42)
        test_states = np.random.choice(
            states,
            size=max(1, int(len(states) * 0.2)),
            replace=False
        )

        train_df = df[~df[state_col].isin(test_states)]
        test_df  = df[df[state_col].isin(test_states)]

        X_train = train_df[feature_cols].fillna(0)
        y_train = train_df["yield_log"].fillna(0)

        X_test = test_df[feature_cols].fillna(0)
        y_test = test_df["yield_log"].fillna(0)

        model = XGBRegressor(
            n_estimators=350,
            learning_rate=0.05,
            max_depth=5,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            verbosity=0
        )

        model.fit(X_train, y_train)

        preds = model.predict(X_test)

        print("\nSTATE HOLDOUT RESULTS")
        print("R²:", round(r2_score(y_test, preds), 4))
        print("MAE:", round(mean_absolute_error(y_test, preds), 4))


# ============================================================
# 3. COLD-START DISTRICTS
# ============================================================

print("\n[STEP 3] Cold-start districts...")

district_counts = df["district_uid"].value_counts()

low_districts = district_counts[district_counts < 5].index

test_df = df[df["district_uid"].isin(low_districts)]
train_df = df[~df["district_uid"].isin(low_districts)]

if len(test_df) > 0:

    X_train = train_df[feature_cols].fillna(0)
    y_train = train_df["yield_log"].fillna(0)

    X_test = test_df[feature_cols].fillna(0)
    y_test = test_df["yield_log"].fillna(0)

    model = XGBRegressor(
        n_estimators=350,
        learning_rate=0.05,
        max_depth=5,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbosity=0
    )

    model.fit(X_train, y_train)

    preds = model.predict(X_test)

    print("\nCOLD START")
    print("R²:", round(r2_score(y_test, preds), 4))
    print("MAE:", round(mean_absolute_error(y_test, preds), 4))

else:
    print("No low-data districts found.")


# ============================================================
# 4. UNCERTAINTY
# ============================================================

print("\n[STEP 4] Uncertainty...")

preds_all = []

for seed in range(5):

    model = XGBRegressor(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=5,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=seed,
        verbosity=0
    )

    model.fit(X, y)

    preds_all.append(model.predict(X))

preds_all = np.array(preds_all)

print("Avg uncertainty:", round(preds_all.std(axis=0).mean(), 4))


print("\n=======================================")
print("DONE")
print("Total Time:", round(time.time() - start_total, 2), "sec")
print("=======================================\n")