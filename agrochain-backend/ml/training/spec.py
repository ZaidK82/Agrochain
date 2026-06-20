
"""
AGROCHAIN — CROP-SPECIFIC MODELING (UNIFIED v2 ALIGNED - FINAL + ENSEMBLE + TUNING)
Uses: cleaned_dataset_unified_v2_ready.parquet
Temporal Split Consistent With Unified
Includes: RF, LGB, CAT, XGB, with hyperparameter tuning and ensembling
+ FEATURE ABLATION TESTING
+ TWO-STAGE PROGRESSIVE TUNING
+ WEIGHTED & STACKING ENSEMBLES
+ CHECKPOINTING (Resume after crash)
+ EARLY STOPPING FOR ALL BOOSTING MODELS
+ OPTIMIZED PARALLEL PROCESSING
Stable + Production Safe
"""

import numpy as np
import pandas as pd
import json
import warnings
import gc
import re
import time
import multiprocessing
import os
from pathlib import Path
from joblib import dump, Parallel, delayed

from sklearn.metrics import r2_score, mean_squared_error
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestRegressor, ExtraTreesRegressor, HistGradientBoostingRegressor
from sklearn.linear_model import Ridge, ElasticNet
from sklearn.neural_network import MLPRegressor
from sklearn.model_selection import ParameterSampler
from sklearn.impute import SimpleImputer

import lightgbm as lgb
import catboost as cb
import xgboost as xgb

warnings.filterwarnings("ignore")# ============================================================
# CONFIG
# ============================================================

class Config:

    # LOCAL WINDOWS PATHS
    DATA_PATH = Path(
        "C:/College work/BE sem 7/Major Project/Agrochain/agrochain-backend/data/cleaned_dataset_unified_v2_ready.parquet"
    )

    OUTPUT_DIR = Path(
        "C:/College work/BE sem 7/Major Project/Agrochain/agrochain-backend/ml/models/spec_without_tuning"
    )
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    MODEL_DIR = OUTPUT_DIR / "saved_models"
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    CHECKPOINT_DIR = OUTPUT_DIR / "checkpoints"
    CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)

    TRAIN_END = 2018
    VAL_END = 2021
    TEST_START = 2022

    MIN_TEST_SAMPLES = 100
    RANDOM_STATE = 42
    MAX_ITER = 300

    # Use ALL CPU cores automatically
    N_CORES = multiprocessing.cpu_count()

    EARLY_STOPPING_ROUNDS = 20

# ============================================================
# SAFE FILE NAME
# ============================================================

def safe_crop_name(name):
    return re.sub(r"[^\w\-]", "_", str(name))


# ============================================================
# CHECKPOINTING FUNCTIONS
# ============================================================

def save_checkpoint(crop_name, results_dict):
    """Save checkpoint after each crop"""
    safe_name = safe_crop_name(crop_name)
    checkpoint_file = Config.CHECKPOINT_DIR / f"{safe_name}_checkpoint.json"

    with open(checkpoint_file, 'w') as f:
        json.dump(results_dict, f, indent=2)

    # Also append to master checkpoint log
    master_checkpoint = Config.CHECKPOINT_DIR / "completed_crops.txt"
    with open(master_checkpoint, 'a') as f:
        f.write(f"{crop_name}\n")

    print(f"💾 Checkpoint saved for {crop_name}")


def load_checkpoints():
    """Load all completed crops from checkpoints"""
    completed_crops = set()
    all_results = []

    master_checkpoint = Config.CHECKPOINT_DIR / "completed_crops.txt"
    if master_checkpoint.exists():
        with open(master_checkpoint, 'r') as f:
            completed_crops = set(line.strip() for line in f if line.strip())

        # Load individual checkpoint data
        for crop in completed_crops:
            safe_name = safe_crop_name(crop)
            checkpoint_file = Config.CHECKPOINT_DIR / f"{safe_name}_checkpoint.json"
            if checkpoint_file.exists():
                with open(checkpoint_file, 'r') as f:
                    crop_data = json.load(f)
                    all_results.append(crop_data)

    return completed_crops, all_results


# ============================================================
# HYPERPARAMETER SPACES
# ============================================================

def get_param_spaces():
    return {
        "rf": {
            "n_estimators": [150, 200, 250],
            "max_depth": [10, 15, 20],
            "min_samples_leaf": [5, 10, 15],
            "max_features": ['sqrt', 'log2']
        },
        "lgb": {
            "num_leaves": [31, 63, 95, 127],
            "learning_rate": [0.01, 0.03, 0.05],
            "subsample": [0.7, 0.8, 0.9],
            "colsample_bytree": [0.7, 0.8, 0.9]
        },
        "xgb": {
            "max_depth": [4, 6, 8, 10],
            "learning_rate": [0.01, 0.03, 0.05],
            "subsample": [0.7, 0.8, 0.9],
            "colsample_bytree": [0.7, 0.8, 0.9]
        },
        "cat": {
            "depth": [4, 6, 8, 10],
            "learning_rate": [0.03, 0.05, 0.1],
            "l2_leaf_reg": [1, 3, 5]
        },
        "extra": {
            "n_estimators": [150, 200, 250],
            "max_depth": [10, 15, 20],
            "min_samples_leaf": [5, 10, 15],
            "max_features": ['sqrt', 'log2']
        },
        "histgb": {
            "max_iter": [200, 300],
            "learning_rate": [0.03, 0.05],
            "max_depth": [6, 8, 10]
        },
        "elastic": {
            "alpha": [0.0001, 0.001, 0.01, 0.1],
            "l1_ratio": [0.1, 0.3, 0.5, 0.7, 0.9]
        },
        "mlp": {
            "hidden_layer_sizes": [(64,), (128,), (64, 32), (128, 64)],
            "alpha": [0.0001, 0.001, 0.01],
            "learning_rate_init": [0.001, 0.01],
            "batch_size": [128, 256],
            "max_iter": [200]
        }
    }


# ============================================================
# MODEL BUILDER
# ============================================================

def build_model(name, params, random_state=Config.RANDOM_STATE, max_iter=Config.MAX_ITER):
    if name == "rf":
        return RandomForestRegressor(
            **params,
            random_state=random_state,
            n_jobs=1,
            max_samples=0.8
        )
    elif name == "lgb":
        return lgb.LGBMRegressor(
            **params,
            n_estimators=max_iter,
            random_state=random_state,
            n_jobs=1,
            force_col_wise=True,
            verbose=-1
        )
    elif name == "xgb":
        return xgb.XGBRegressor(
            **params,
            n_estimators=max_iter,
            tree_method="hist",
            random_state=random_state,
            n_jobs=1,
            verbosity=0
        )
    elif name == "cat":
        return cb.CatBoostRegressor(
            **params,
            iterations=max_iter,
            random_seed=random_state,
            verbose=0,
            allow_writing_files=False,
            thread_count=1
        )
    elif name == "extra":
        return ExtraTreesRegressor(
            **params,
            random_state=random_state,
            n_jobs=1
        )
    elif name == "histgb":
        return HistGradientBoostingRegressor(
            **params,
            random_state=random_state
        )
    elif name == "elastic":
        return ElasticNet(
            **params,
            random_state=random_state,
            max_iter=1000
        )
    elif name == "mlp":
        return MLPRegressor(
            **params,
            random_state=random_state,
            early_stopping=True,
            validation_fraction=0.1,
            n_iter_no_change=10,
            verbose=False
        )


# ============================================================
# EVALUATION FUNCTION - EARLY STOPPING ONLY FOR SLOW MODELS
# ============================================================

def evaluate_params(model_name, params, X_tune, y_tune, X_val, y_val,
                    X_tune_scaled=None, X_val_scaled=None):

    # Use scaled data for ElasticNet and MLP
    if model_name in ["elastic", "mlp"]:
        X_tune_use = X_tune_scaled
        X_val_use = X_val_scaled
    else:
        X_tune_use = X_tune
        X_val_use = X_val

    model = build_model(model_name, params)

    # Apply early stopping ONLY for slow models (RF, CatBoost, MLP)
    if model_name == "rf":
        # Random Forest - manual early stopping
        n_estimators = params.get('n_estimators', 200)
        eval_interval = max(1, n_estimators // 5)
        best_score = -np.inf
        best_n_estimators = n_estimators
        no_improve = 0

        for i in range(eval_interval, n_estimators + 1, eval_interval):
            model.set_params(n_estimators=i)
            model.fit(X_tune_use, y_tune)
            score = r2_score(y_val, model.predict(X_val_use))

            if score > best_score:
                best_score = score
                best_n_estimators = i
                no_improve = 0
            else:
                no_improve += 1

            if no_improve >= 2:
                break

        model.set_params(n_estimators=best_n_estimators)
        model.fit(X_tune_use, y_tune)
        final_score = best_score

    elif model_name == "cat":
        # CatBoost - built-in early stopping (slow model)
        model.fit(
            X_tune_use, y_tune,
            eval_set=[(X_val_use, y_val)],
            early_stopping_rounds=Config.EARLY_STOPPING_ROUNDS,
            verbose=False
        )
        final_score = r2_score(y_val, model.predict(X_val_use))

    elif model_name == "mlp":
        # MLP - built-in early stopping (slow model)
        model.fit(X_tune_use, y_tune)
        final_score = r2_score(y_val, model.predict(X_val_use))

    else:
        # FAST MODELS - NO EARLY STOPPING
        # This includes: lgb, xgb, extra, histgb, elastic
        model.fit(X_tune_use, y_tune)
        final_score = r2_score(y_val, model.predict(X_val_use))

    return model, final_score


# ============================================================
# TUNE MODEL (TWO-STAGE) - OPTIMIZED
# ============================================================

def tune_model_two_stage(model_name, X_tune, y_tune, X_val, y_val,
                         X_tune_scaled, X_val_scaled, param_spaces,
                         stage1_trials, stage2_trials):

    # Stage 1: Quick screening
    param_list = list(ParameterSampler(
        param_spaces[model_name],
        n_iter=stage1_trials,
        random_state=Config.RANDOM_STATE
    ))

    # Use sequential processing if dataset is small, parallel if large
    if len(X_tune) < 5000:
        # Sequential for small datasets (avoid parallel overhead)
        results = []
        for p in param_list:
            results.append(evaluate_params(
                model_name, p, X_tune, y_tune, X_val, y_val,
                X_tune_scaled, X_val_scaled
            ))
    else:
        # Parallel for larger datasets
        results = Parallel(n_jobs=Config.N_JOBS_TUNING, prefer="threads")(
            delayed(evaluate_params)(
                model_name, p, X_tune, y_tune, X_val, y_val,
                X_tune_scaled, X_val_scaled
            ) for p in param_list
        )

    # Find best stage 1 model
    best_model = None
    best_score = -np.inf

    for model, score in results:
        if score > best_score:
            best_score = score
            best_model = model

    # Stage 2: Deep dive (skip for non-tunable models)
    if model_name in param_spaces and stage2_trials > 0:
        # Create focused space around best params
        focused_space = create_focused_space(model_name, best_model, param_spaces)

        param_list = list(ParameterSampler(
            focused_space,
            n_iter=stage2_trials,
            random_state=Config.RANDOM_STATE
        ))

        # Use sequential for stage 2 (focused search)
        results = []
        for p in param_list:
            model, score = evaluate_params(
                model_name, p, X_tune, y_tune, X_val, y_val,
                X_tune_scaled, X_val_scaled
            )
            results.append((model, score))

            # Early break if we find a very good model
            if score > 0.95:
                break

        # Find best
        best_model = None
        best_score = -np.inf

        for model, score in results:
            if score > best_score:
                best_score = score
                best_model = model

    return best_model, best_score


# ============================================================
# CREATE FOCUSED PARAMETER SPACE
# ============================================================

def create_focused_space(model_name, best_model, param_spaces):
    """Create focused parameter grid around best Stage 1 params"""

    if model_name not in param_spaces:
        return param_spaces.get(model_name, {})

    best_params = best_model.get_params()

    if model_name == "rf" or model_name == "extra":
        n_est = best_params.get('n_estimators', 200)
        max_d = best_params.get('max_depth', 15)
        min_s = best_params.get('min_samples_leaf', 10)
        max_f = best_params.get('max_features', 'sqrt')

        return {
            "n_estimators": [
                int(n_est * 0.8),
                n_est,
                int(n_est * 1.2)
            ],
            "max_depth": [
                max(5, int(max_d * 0.7)),
                max_d,
                int(max_d * 1.3)
            ],
            "min_samples_leaf": [
                max(2, int(min_s * 0.7)),
                min_s,
                int(min_s * 1.3)
            ],
            "max_features": [max_f]
        }

    elif model_name == "lgb":
        n_leaves = best_params.get('num_leaves', 63)
        lr = best_params.get('learning_rate', 0.03)
        subsample = best_params.get('subsample', 0.8)
        colsample = best_params.get('colsample_bytree', 0.8)

        return {
            "num_leaves": [
                int(n_leaves * 0.7),
                n_leaves,
                int(n_leaves * 1.3)
            ],
            "learning_rate": [
                lr * 0.5,
                lr,
                lr * 2.0
            ],
            "subsample": [
                max(0.6, subsample * 0.9),
                subsample,
                min(1.0, subsample * 1.1)
            ],
            "colsample_bytree": [
                max(0.6, colsample * 0.9),
                colsample,
                min(1.0, colsample * 1.1)
            ]
        }

    elif model_name == "xgb":
        max_d = best_params.get('max_depth', 6)
        lr = best_params.get('learning_rate', 0.03)
        subsample = best_params.get('subsample', 0.8)
        colsample = best_params.get('colsample_bytree', 0.8)

        return {
            "max_depth": [
                max(3, int(max_d * 0.7)),
                max_d,
                int(max_d * 1.3)
            ],
            "learning_rate": [
                lr * 0.5,
                lr,
                lr * 2.0
            ],
            "subsample": [
                max(0.6, subsample * 0.9),
                subsample,
                min(1.0, subsample * 1.1)
            ],
            "colsample_bytree": [
                max(0.6, colsample * 0.9),
                colsample,
                min(1.0, colsample * 1.1)
            ]
        }

    elif model_name == "cat":
        depth = best_params.get('depth', 6)
        lr = best_params.get('learning_rate', 0.03)
        l2 = best_params.get('l2_leaf_reg', 3)

        return {
            "depth": [
                max(3, int(depth * 0.7)),
                depth,
                int(depth * 1.3)
            ],
            "learning_rate": [
                lr * 0.5,
                lr,
                lr * 2.0
            ],
            "l2_leaf_reg": [
                max(1, int(l2 * 0.7)),
                l2,
                int(l2 * 1.3)
            ]
        }

    elif model_name == "elastic":
        alpha = best_params.get('alpha', 0.01)
        l1 = best_params.get('l1_ratio', 0.5)

        return {
            "alpha": [
                alpha * 0.1,
                alpha,
                alpha * 10
            ],
            "l1_ratio": [
                max(0.1, l1 - 0.2),
                l1,
                min(0.9, l1 + 0.2)
            ]
        }

    elif model_name == "mlp":
        hidden = best_params.get('hidden_layer_sizes', (64,))
        alpha = best_params.get('alpha', 0.001)
        lr_init = best_params.get('learning_rate_init', 0.001)
        batch = best_params.get('batch_size', 128)

        return {
            "hidden_layer_sizes": [
                hidden,
                (hidden[0] * 2,) if isinstance(hidden, tuple) else (128,),
                (hidden[0] // 2, hidden[0] // 2) if isinstance(hidden, tuple) and hidden[0] > 32 else (64, 32)
            ],
            "alpha": [
                alpha * 0.1,
                alpha,
                alpha * 10
            ],
            "learning_rate_init": [
                lr_init * 0.5,
                lr_init,
                lr_init * 2.0
            ],
            "batch_size": [
                max(32, batch // 2),
                batch,
                batch * 2
            ]
        }

    return param_spaces[model_name]

# ============================================================
# TRAIN ALL MODELS (DEFAULT PARAMETERS ONLY)
# ============================================================

def train_all_models(X_train, y_train, X_val, y_val, X_test, y_test,
                     X_train_scaled, X_val_scaled, X_test_scaled):

    model_names = ["rf", "lgb", "xgb", "cat", "extra", "histgb"]

    trained_models = {}
    val_preds = {}
    test_preds = {}
    model_scores = {}

    print("\n🔍 Training models with DEFAULT parameters...")

    for name in model_names:

        print(f"\n📊 Training {name}...")
        start_time = time.time()

        model = build_model(name, {})

        # Train model
        if name in ["elastic", "mlp"]:
            model.fit(X_train_scaled, y_train)
            val_pred = model.predict(X_val_scaled)
            test_pred = model.predict(X_test_scaled)

        else:
            model.fit(X_train, y_train)
            val_pred = model.predict(X_val)
            test_pred = model.predict(X_test)

        val_r2 = r2_score(y_val, val_pred)

        trained_models[name] = model
        val_preds[name] = val_pred
        test_preds[name] = test_pred
        model_scores[name] = val_r2

        elapsed = time.time() - start_time

        print(f"  ✓ Val R²: {val_r2:.4f} (took {elapsed:.1f}s)")

        gc.collect()

    return trained_models, val_preds, test_preds, model_scores, model_names

# ============================================================
# CREATE WEIGHTED ENSEMBLE
# ============================================================

def create_weighted_ensemble(model_names, val_preds, test_preds, model_scores, y_val, y_test):

    # Temperature scaling for weights
    temperature = 2.0
    weights = np.exp(np.array([model_scores[name] for name in model_names]) * temperature)
    weights = weights / weights.sum()

    # Weighted predictions
    ensemble_val = np.zeros(len(y_val))
    ensemble_test = np.zeros(len(y_test))

    for i, name in enumerate(model_names):
        ensemble_val += weights[i] * val_preds[name]
        ensemble_test += weights[i] * test_preds[name]

    val_r2 = r2_score(y_val, ensemble_val)
    test_r2 = r2_score(y_test, ensemble_test)

    return {
        "type": "weighted",
        "weights": dict(zip(model_names, weights)),
        "val_r2": val_r2,
        "test_r2": test_r2,
        "predictions_val": ensemble_val.tolist() if isinstance(ensemble_val, np.ndarray) else ensemble_val,
        "predictions_test": ensemble_test.tolist() if isinstance(ensemble_test, np.ndarray) else ensemble_test
    }


# ============================================================
# CREATE STACKING ENSEMBLE
# ============================================================

def create_stacking_ensemble(model_names, val_preds, test_preds, y_val, y_test):

    # Stack predictions
    stack_train = np.column_stack([val_preds[name] for name in model_names])
    stack_test = np.column_stack([test_preds[name] for name in model_names])

    # Meta model
    meta_model = Ridge(alpha=1.0)
    meta_model.fit(stack_train, y_val)

    # Predictions
    stack_pred = meta_model.predict(stack_test)
    test_r2 = r2_score(y_test, stack_pred)

    # Get meta-model coefficients
    coef_dict = dict(zip(model_names, meta_model.coef_.tolist()))

    return {
        "type": "stacking",
        "meta_model": meta_model,
        "coefficients": coef_dict,
        "test_r2": test_r2,
        "predictions_test": stack_pred.tolist() if isinstance(stack_pred, np.ndarray) else stack_pred
    }


# ============================================================
# PROCESS SINGLE CROP - WITH CHECKPOINTING
# ============================================================

def process_crop(crop_name, df_crop):

    print("\n" + "="*80)
    print(f"🌾 CROP: {crop_name}")
    print("="*80)

    df_crop = df_crop.sort_values(["district_uid", "year"]).copy()

    test_samples = len(df_crop[df_crop["year"] >= Config.TEST_START])
    if test_samples < Config.MIN_TEST_SAMPLES:
        print("⚠️ Skipping — insufficient test samples")
        return None

    # Temporal split
    train = df_crop[df_crop["year"] <= Config.TRAIN_END]
    val = df_crop[(df_crop["year"] > Config.TRAIN_END) & (df_crop["year"] <= Config.VAL_END)]
    test = df_crop[df_crop["year"] >= Config.TEST_START]

    print(f"Train: {len(train)} | Val: {len(val)} | Test: {len(test)}")

    # Define features
    exclude = ["yield_log", "year", "district_uid", "state", "crop", "crop_family", "season"]
    numeric_cols = df_crop.select_dtypes(include=[np.number]).columns.tolist()
    all_features = [c for c in numeric_cols if c not in exclude]

    # Feature groups for ablation
    lag_features = [c for c in all_features if "historical" in c or "drift" in c or "first_year" in c]
    climate_features = [c for c in all_features if "climate" in c or "rain" in c or "temp" in c or "anomaly" in c]
    soil_features = [c for c in all_features if c in ["ph", "organic_carbon_pct", "cec", "clay_pct",
                                                      "sand_pct", "silt_pct", "water_holding_capacity_index",
                                                      "soil_structure_index", "bdod"]]
    irrigation_features = [c for c in all_features if "irrigation" in c or "gw_" in c or "surface_" in c]

    # Prepare data
    X_train = train[all_features].astype(np.float32)
    X_val = val[all_features].astype(np.float32)
    X_test = test[all_features].astype(np.float32)

    y_train = train["yield_log"]
    y_val = val["yield_log"]
    y_test = test["yield_log"]

    # Handle missing values
    print("\n🩺 Imputing missing values...")
    imputer = SimpleImputer(strategy='median')
    X_train = pd.DataFrame(
        imputer.fit_transform(X_train),
        columns=all_features
    )

    X_val = pd.DataFrame(
        imputer.transform(X_val),
        columns=all_features
    )

    X_test = pd.DataFrame(
        imputer.transform(X_test),
        columns=all_features
    )

    # Scale for sensitive models
    scaler = StandardScaler()
    X_train_scaled = pd.DataFrame(
        scaler.fit_transform(X_train),
        columns=all_features
    )

    X_val_scaled = pd.DataFrame(
        scaler.transform(X_val),
        columns=all_features
    )

    X_test_scaled = pd.DataFrame(
        scaler.transform(X_test),
        columns=all_features
    )

    # Train all models and get predictions
    trained_models, val_preds, test_preds, model_scores, model_names = train_all_models(
        X_train, y_train, X_val, y_val, X_test, y_test,
        X_train_scaled, X_val_scaled, X_test_scaled
    )

    # Create ensembles
    weighted_ensemble = create_weighted_ensemble(
        model_names, val_preds, test_preds, model_scores, y_val, y_test
    )

    stacking_ensemble = create_stacking_ensemble(
        model_names, val_preds, test_preds, y_val, y_test
    )

    print(f"\n📊 Ensemble Results:")
    print(f"  Weighted Ensemble Test R²: {weighted_ensemble['test_r2']:.4f}")
    print(f"  Stacking Ensemble Test R²: {stacking_ensemble['test_r2']:.4f}")

    # Run feature ablation experiments
    print("\n🔬 Running feature ablation...")

    ablation_sets = {
        "FULL": all_features,
        "LAG_ONLY": lag_features,
        "CLIMATE_ONLY": climate_features,
        "SOIL_ONLY": soil_features,
        "IRRIGATION_ONLY": irrigation_features,
        "NO_LAG": [c for c in all_features if c not in lag_features],
        "NO_CLIMATE": [c for c in all_features if c not in climate_features],
        "LAG_CLIMATE_ONLY": lag_features + climate_features
    }

    ablation_results = []

    # Use a consistent model for ablation (LightGBM is fast and good)
    ablation_model_type = 'lgb'
    ablation_model = build_model(ablation_model_type, {'learning_rate': 0.05, 'num_leaves': 31})

    for label, features in ablation_sets.items():
        if len(features) == 0:
            continue

        # Get feature indices
        feature_indices = [all_features.index(f) for f in features if f in all_features]

        if len(feature_indices) == 0:
            continue

        # Subset data using pandas indexing
        X_train_sub = X_train.iloc[:, feature_indices]
        X_test_sub = X_test.iloc[:, feature_indices]

        ablation_model.fit(X_train_sub, y_train)
        pred = ablation_model.predict(X_test_sub)

        r2 = r2_score(y_test, pred)
        rmse = np.sqrt(mean_squared_error(y_test, pred))

        ablation_results.append({
            "experiment": label,
            "r2": r2,
            "rmse": rmse,
            "n_features": len(features)
        })

        print(f"  {label:15} → R²: {r2:.4f}")

    # Compile all results
    crop_results = {
        "crop": crop_name,
        "n_train": len(train),
        "n_val": len(val),
        "n_test": len(test),
        "n_features": len(all_features),
        "individual_models": {
            name: {
                "val_r2": float(model_scores[name]),
                "test_r2": float(r2_score(y_test, test_preds[name])),
                "rmse": float(np.sqrt(mean_squared_error(y_test, test_preds[name])))
            }
            for name in model_names
        },
        "weighted_ensemble": {
            "test_r2": float(weighted_ensemble["test_r2"]),
            "weights": {k: float(v) for k, v in weighted_ensemble["weights"].items()}
        },
        "stacking_ensemble": {
            "test_r2": float(stacking_ensemble["test_r2"]),
            "coefficients": {k: float(v) for k, v in stacking_ensemble["coefficients"].items()}
        },
        "ablation": ablation_results
    }

    # Save artifacts
    safe_name = safe_crop_name(crop_name)

    # Save best individual model
    best_model_name = max(model_scores, key=model_scores.get)
    dump(trained_models[best_model_name], Config.MODEL_DIR / f"{safe_name}_best_v2.joblib")

    # Save ensemble package
    ensemble_package = {
        "models": trained_models,
        "weighted_ensemble": weighted_ensemble,
        "stacking_ensemble": stacking_ensemble,
        "model_names": model_names,
        "model_scores": model_scores,
        "features": all_features,
        "imputer": imputer,
        "scaler": scaler,
        "best_model_name": best_model_name
    }
    dump(ensemble_package, Config.MODEL_DIR / f"{safe_name}_ensemble_v2.pkl")

    # Save ablation results
    pd.DataFrame(ablation_results).to_csv(
        Config.OUTPUT_DIR / f"{safe_name}_ablation_v2.csv", index=False
    )

    # Save checkpoint
    save_checkpoint(crop_name, crop_results)

    gc.collect()

    return crop_results

# ============================================================
# PARALLEL CROP WRAPPER
# ============================================================

def process_crop_wrapper(args):
    crop_name, group = args
    try:
        return process_crop(crop_name, group.copy())
    except Exception as e:
        print(f"❌ Error processing {crop_name}: {e}")
        return None

# ============================================================
# MAIN - WITH CHECKPOINT LOADING
# ============================================================

def main():

    print("="*80)
    print("🚀 AGROCHAIN CROP-SPECIFIC PIPELINE (UNIFIED v2 ALIGNED)")
    print("="*80)
    print(f"CPU Cores: {Config.N_CORES}")
    print("Hyperparameter tuning: DISABLED (default models)")
    print(f"Early stopping on ALL boosting models")
    print(f"Checkpoint directory: {Config.CHECKPOINT_DIR}")
    print("="*80)

    start_time = time.time()

    # Load existing checkpoints
    completed_crops, all_results = load_checkpoints()
    print(f"\n📋 Found {len(completed_crops)} already completed crops")

    # Load data
    print("\n📂 Loading dataset...")
    df = pd.read_parquet(Config.DATA_PATH)
    print(f"Total samples: {len(df)}")

    # Get unique crops
    all_crops = list(df["crop"].unique())
    print(f"Total unique crops: {len(all_crops)}")
    print(f"Remaining to process: {len(all_crops) - len(completed_crops)}")

    # ============================================================
    # PARALLEL CROP PROCESSING
    # ============================================================

    print("\n🚀 Running crops in parallel...")

    crop_jobs = []

    for crop, group in df.groupby("crop"):
        if crop not in completed_crops:
            crop_jobs.append((crop, group))

    print(f"Total crops to process: {len(crop_jobs)}")
    print(f"Using {Config.N_CORES} CPU cores")

    results = Parallel(n_jobs=Config.N_CORES)(
        delayed(process_crop_wrapper)(job)
        for job in crop_jobs
    )

    for r in results:
        if r:
            all_results.append(r)

    if not all_results:
        print("❌ No crops processed")
        return

    # Compile summary
    print("\n" + "="*80)
    print("📊 CROP-SPECIFIC SUMMARY")
    print("="*80)

    summary_rows = []
    for res in all_results:
        # Find best individual model
        best_indiv = max(res["individual_models"].items(), key=lambda x: x[1]["test_r2"])

        row = {
            "crop": res["crop"],
            "n_train": res["n_train"],
            "n_test": res["n_test"],
            "n_features": res["n_features"],
            "best_individual": best_indiv[0],
            "best_individual_r2": best_indiv[1]["test_r2"],
            "weighted_ensemble_r2": res["weighted_ensemble"]["test_r2"],
            "stacking_ensemble_r2": res["stacking_ensemble"]["test_r2"]
        }
        summary_rows.append(row)

    summary_df = pd.DataFrame(summary_rows)
    summary_df.to_csv(Config.OUTPUT_DIR / "crop_summary_v2.csv", index=False)

    print("\n" + summary_df.to_string())

    # Save metadata
    metadata = {
        "config": {
            "train_end": Config.TRAIN_END,
            "val_end": Config.VAL_END,
            "test_start": Config.TEST_START,
            "max_iter": Config.MAX_ITER,
            "early_stopping_rounds": Config.EARLY_STOPPING_ROUNDS,
            "cores_used": Config.N_CORES
        },
        "n_crops_processed": len(all_results),
        "total_time_minutes": (time.time() - start_time) / 60,
        "summary": summary_rows
    }

    with open(Config.OUTPUT_DIR / "metadata_v2.json", "w") as f:
        json.dump(metadata, f, indent=4)

    print("\n" + "="*80)
    print(f"✅ PIPELINE COMPLETE")
    print(f"Total time: {metadata['total_time_minutes']:.1f} minutes")
    print(f"Results saved to: {Config.OUTPUT_DIR}")
    print("="*80)


if __name__ == "__main__":
    main()