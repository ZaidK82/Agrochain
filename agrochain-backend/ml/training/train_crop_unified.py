# ============================================================
# AGROCHAIN UNIFIED PIPELINE WITH TWO-STAGE PROGRESSIVE TUNING
# LOCAL MACHINE VERSION
# ============================================================

import numpy as np
import pandas as pd
import json
from pathlib import Path
from joblib import dump, Parallel, delayed
import multiprocessing
import time
import warnings
warnings.filterwarnings('ignore')

from sklearn.metrics import r2_score, mean_squared_error
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.model_selection import ParameterSampler
from sklearn.ensemble import ExtraTreesRegressor
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.linear_model import ElasticNet
from sklearn.neural_network import MLPRegressor
from sklearn.impute import SimpleImputer  # ADDED: Import for imputation

import lightgbm as lgb
import xgboost as xgb
import catboost as cb


# ============================================================
# CONFIG
# ============================================================

DATA_PATH = Path("C:/College work/BE sem 7/Major Project/Agrochain/agrochain-backend/data/cleaned_dataset_unified_v2_ready.parquet")

OUTPUT_DIR = Path("C:/College work/BE sem 7/Major Project/Agrochain/agrochain-backend/ml/models/crop_unified_v2")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

TRAIN_END = 2018
VAL_END = 2021
TEST_START = 2022

RANDOM_STATE = 42
MAX_ITER = 300

# Two-stage tuning config
STAGE1_TRIALS = 8
STAGE2_TRIALS = 25

# Early stopping config (only for slow models)
EARLY_STOPPING_ROUNDS = 20
SLOW_MODELS = ['rf', 'extra', 'mlp']  # Models that benefit from early stopping

# LOCAL CPU CORES
N_CORES = multiprocessing.cpu_count()

print("="*80)
print("🚀 AGROCHAIN UNIFIED PIPELINE WITH TWO-STAGE TUNING (LOCAL)")
print("CPU CORES:", N_CORES)
print(f"Stage 1 trials: {STAGE1_TRIALS} | Stage 2 trials: {STAGE2_TRIALS}")
print(f"Early stopping on: {SLOW_MODELS}")
print("="*80)


# ============================================================
# LOAD DATA
# ============================================================

print("\n📂 Loading dataset...")
start_time = time.time()

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
# SAFE CATEGORICAL ENCODING
# ============================================================

print("\n🔠 Encoding categorical columns...")

object_cols = train.select_dtypes(include=["object"]).columns.tolist()
encoders = {}

for col in object_cols:
    le = LabelEncoder()
    train.loc[:, col] = le.fit_transform(train[col].astype(str))
    val.loc[:, col] = val[col].astype(str).apply(
        lambda x: le.transform([x])[0] if x in le.classes_ else -1
    )
    test.loc[:, col] = test[col].astype(str).apply(
        lambda x: le.transform([x])[0] if x in le.classes_ else -1
    )
    encoders[col] = le

print("Encoded columns:", object_cols)


# ============================================================
# FEATURES
# ============================================================

exclude = ["yield_log", "year"]
features = [c for c in df.columns if c not in exclude]
print("\nFeature count:", len(features))

# Feature groups for ablation
lag_features = [c for c in features if "lag" in c or "historical" in c or "drift" in c]
climate_features = [c for c in features if "climate" in c or "rain" in c or "temp" in c or "anomaly" in c]
soil_features = [c for c in features if c in ["ph","organic_carbon_pct","cec","clay_pct",
                                               "sand_pct","silt_pct","water_holding_capacity_index",
                                               "soil_structure_index","bdod"]]
irrigation_features = [c for c in features if "irrigation" in c or "gw_" in c or "surface_" in c]
crop_family_features = [c for c in features if "family_" in c]

# Convert to numpy arrays
X_train = train[features].to_numpy(dtype=np.float32, copy=True)
X_val = val[features].to_numpy(dtype=np.float32, copy=True)
X_test = test[features].to_numpy(dtype=np.float32, copy=True)

# ============================================================
# HANDLE MISSING VALUES (IMPUTATION) - ADDED SECTION
# ============================================================
print("\n🩺 Handling missing values with imputation...")

# Check for missing values before imputation
print(f"Missing values before imputation - Train: {np.isnan(X_train).sum()}, Val: {np.isnan(X_val).sum()}, Test: {np.isnan(X_test).sum()}")

# Create an imputer (using median is robust to outliers)
imputer = SimpleImputer(strategy='median')

# Fit on training data and transform all sets
X_train_imputed = imputer.fit_transform(X_train)
X_val_imputed = imputer.transform(X_val)
X_test_imputed = imputer.transform(X_test)

# Check after imputation
print(f"Missing values after imputation - Train: {np.isnan(X_train_imputed).sum()}, Val: {np.isnan(X_val_imputed).sum()}, Test: {np.isnan(X_test_imputed).sum()}")

# Replace original arrays with imputed versions
X_train = X_train_imputed.astype(np.float32)
X_val = X_val_imputed.astype(np.float32)
X_test = X_test_imputed.astype(np.float32)

# ============================================================
# SCALE FEATURES (NOW USING IMPUTED DATA)
# ============================================================
print("\n📊 Scaling features...")

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_val_scaled = scaler.transform(X_val)
X_test_scaled = scaler.transform(X_test)

# Keep original for tree models
y_train = train["yield_log"]
y_val = val["yield_log"]
y_test = test["yield_log"]


# ============================================================
# FAST TUNING SUBSET
# ============================================================

TUNE_SAMPLE_SIZE = 30000
rng = np.random.default_rng(RANDOM_STATE)
tune_idx = rng.choice(len(X_train), TUNE_SAMPLE_SIZE, replace=False)

X_tune = X_train[tune_idx].copy()
X_tune_scaled = X_train_scaled[tune_idx].copy()
X_tune.setflags(write=True)
X_tune_scaled.setflags(write=True)
y_tune = y_train.iloc[tune_idx]


# ============================================================
# HYPERPARAMETER SPACES
# ============================================================

param_spaces = {
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

def build_model(name, params):
    if name == "rf":
        return RandomForestRegressor(
            **params,
            random_state=RANDOM_STATE,
            n_jobs=1,
            max_samples=0.8
        )
    elif name == "lgb":
        return lgb.LGBMRegressor(
            **params,
            n_estimators=MAX_ITER,
            random_state=RANDOM_STATE,
            n_jobs=1,
            force_col_wise=True,
            verbose=-1
        )
    elif name == "xgb":
        return xgb.XGBRegressor(
            **params,
            n_estimators=MAX_ITER,
            tree_method="hist",
            random_state=RANDOM_STATE,
            n_jobs=1,
            verbosity=0
        )
    elif name == "cat":
        return cb.CatBoostRegressor(
            **params,
            iterations=MAX_ITER,
            random_seed=RANDOM_STATE,
            verbose=0,
            allow_writing_files=False,
            thread_count=1
        )
    elif name == "extra":
        return ExtraTreesRegressor(
            **params,
            random_state=RANDOM_STATE,
            n_jobs=1
        )
    elif name == "histgb":
        return HistGradientBoostingRegressor(
            **params,
            random_state=RANDOM_STATE
        )
    elif name == "elastic":
        return ElasticNet(
            **params,
            random_state=RANDOM_STATE,
            max_iter=1000
        )
    elif name == "mlp":
        return MLPRegressor(
            **params,
            random_state=RANDOM_STATE,
            early_stopping=True,
            validation_fraction=0.1,
            n_iter_no_change=10,
            verbose=False
        )
    
# ============================================================
# CONFIG - SAFE EARLY STOPPING
# ============================================================

EARLY_STOPPING_ROUNDS = 20
SLOW_MODELS = ['rf', 'cat', 'mlp']  # Only these 3

# ============================================================
# EVALUATION FUNCTION - ERROR-FREE VERSION
# ============================================================

def evaluate_params(model_name, params):
    model = build_model(model_name, params)
    
    # Use scaled data for ElasticNet and MLP, original for tree models
    if model_name in ["elastic", "mlp"]:
        X_tune_use = X_tune_scaled
        X_val_use = X_val_scaled
    else:
        X_tune_use = X_tune
        X_val_use = X_val
    
    # Apply early stopping only for slow models
    if model_name == "rf":
        # Random Forest - safe manual early stopping
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
        # CatBoost - safe built-in
        model.fit(
            X_tune_use, y_tune,
            eval_set=[(X_val_use, y_val)],
            early_stopping_rounds=EARLY_STOPPING_ROUNDS,
            verbose=False
        )
        final_score = r2_score(y_val, model.predict(X_val_use))
    
    elif model_name == "mlp":
        # MLP - safe (early stopping already in constructor)
        model.fit(X_tune_use, y_tune)
        final_score = r2_score(y_val, model.predict(X_val_use))
    
    else:
        # All other models - simple fit (NO EARLY STOPPING PARAMETERS)
        model.fit(X_tune_use, y_tune)
        final_score = r2_score(y_val, model.predict(X_val_use))
    
    return model, final_score

# ============================================================
# STAGE 1: QUICK SCREENING
# ============================================================

print("\n🔍 STAGE 1: Quick screening (8 trials per model)")
stage1_start = time.time()

model_names = ["rf", "lgb", "xgb", "cat", "extra", "histgb", "elastic", "mlp"]
stage1_results = {}
stage1_models = {}

for name in model_names:
    print(f"\nScreening {name}...")
    model_start = time.time()
    
    # Handle models without parameter spaces
    if name in param_spaces:
        param_list = list(ParameterSampler(
            param_spaces[name],
            n_iter=STAGE1_TRIALS,
            random_state=RANDOM_STATE
        ))
    else:
        param_list = [{}]  # Models without hyperparameter tuning
    
    results = Parallel(n_jobs=min(N_CORES, 4), prefer="threads")(  # Limit parallel jobs to avoid memory issues
        delayed(evaluate_params)(name, p) for p in param_list
    )
    
    # Find best
    best_model = None
    best_score = -np.inf
    
    for model, score in results:
        if score > best_score:
            best_score = score
            best_model = model
    
    stage1_results[name] = {
        'score': best_score,
        'model': best_model
    }
    stage1_models[name] = best_model
    
    print(f"Best {name} R²: {best_score:.4f} (took {time.time() - model_start:.1f}s)")

print(f"\n✅ Stage 1 completed in {time.time() - stage1_start:.1f}s")


# ============================================================
# CREATE FOCUSED PARAMETER SPACES FOR STAGE 2
# ============================================================

def create_focused_space(model_name, best_model):
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
    
    elif model_name == "histgb":
        max_iter = best_params.get('max_iter', 250)
        lr = best_params.get('learning_rate', 0.04)
        max_d = best_params.get('max_depth', 8)
        
        return {
            "max_iter": [
                int(max_iter * 0.8),
                max_iter,
                int(max_iter * 1.2)
            ],
            "learning_rate": [
                lr * 0.5,
                lr,
                lr * 2.0
            ],
            "max_depth": [
                max(3, int(max_d * 0.7)),
                max_d,
                int(max_d * 1.3)
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
# STAGE 2: DEEP DIVE ON TOP 2 MODELS
# ============================================================

print("\n🎯 STAGE 2: Deep tuning on top performers")

# Sort models by validation score
sorted_models = sorted(
    stage1_results.items(),
    key=lambda x: x[1]['score'],
    reverse=True
)

top_models = sorted_models[:2]  # Take top 2
print(f"Top 2 models: {[m[0] for m in top_models]}")

stage2_results = {}
stage2_models = {}

for model_name, model_info in top_models:
    print(f"\nDeep tuning {model_name} (Stage 1 score: {model_info['score']:.4f})")
    model_start = time.time()
    
    # Only do Stage 2 for models with parameter spaces
    if model_name in param_spaces:
        # Create focused parameter space
        focused_space = create_focused_space(model_name, model_info['model'])
        
        # Run more trials
        param_list = list(ParameterSampler(
            focused_space,
            n_iter=STAGE2_TRIALS,
            random_state=RANDOM_STATE
        ))
        
        results = Parallel(n_jobs=min(N_CORES, 4), prefer="threads")(
            delayed(evaluate_params)(model_name, p) for p in param_list
        )
        
        # Find best with early stopping
        best_model = None
        best_score = -np.inf
        no_improve = 0
        
        for model, score in results:
            if score > best_score:
                best_score = score
                best_model = model
                no_improve = 0
            else:
                no_improve += 1
            
            if no_improve >= 5:
                print(f"Early stopping at trial {len(results)}")
                break
        
        stage2_results[model_name] = best_score
        stage2_models[model_name] = best_model
        
        improvement = best_score - model_info['score']
        print(f"Improved {model_name} R²: {best_score:.4f} (+{improvement:.4f})")
    else:
        # Keep Stage 1 model for untuned models
        stage2_results[model_name] = model_info['score']
        stage2_models[model_name] = model_info['model']
        print(f"No tuning needed for {model_name}")
    
    print(f"Took {time.time() - model_start:.1f}s")


# ============================================================
# PREPARE FINAL MODELS FOR ENSEMBLE
# ============================================================

print("\n📦 Preparing final models...")

# Update trained_models with Stage 2 improvements
trained_models = stage1_models.copy()
for name in stage2_models:
    trained_models[name] = stage2_models[name]

# Get predictions from all models
val_predictions = {}
test_predictions = {}
results = []

for name in model_names:
    model = trained_models[name]
    
    # Use scaled data for ElasticNet and MLP predictions
    if name in ["elastic", "mlp"]:
        val_pred = model.predict(X_val_scaled)
        test_pred = model.predict(X_test_scaled)
    else:
        val_pred = model.predict(X_val)
        test_pred = model.predict(X_test)
    
    val_predictions[name] = val_pred
    test_predictions[name] = test_pred
    
    # Use Stage 2 score if available
    if name in stage2_results:
        val_r2 = stage2_results[name]
    else:
        val_r2 = stage1_results[name]['score']
    
    test_r2 = r2_score(y_test, test_pred)
    rmse = np.sqrt(mean_squared_error(y_test, test_pred))
    
    results.append({
        "model": name,
        "val_r2": val_r2,
        "test_r2": test_r2,
        "rmse": rmse
    })

results_df = pd.DataFrame(results)
results_df.to_csv(OUTPUT_DIR / "model_family_performance.csv", index=False)


# ============================================================
# WEIGHTED ENSEMBLE
# ============================================================

print("\n⚖️ Creating weighted ensemble...")

# Temperature scaling for weights
temperature = 2.0
weights = np.exp(results_df["val_r2"].values * temperature)
weights = weights / weights.sum()

ensemble_val = np.zeros(len(y_val))
ensemble_test = np.zeros(len(y_test))

for i, name in enumerate(model_names):
    ensemble_val += weights[i] * val_predictions[name]
    ensemble_test += weights[i] * test_predictions[name]

val_r2 = r2_score(y_val, ensemble_val)
test_r2 = r2_score(y_test, ensemble_test)

ensemble_df = pd.DataFrame([{
    "model": "weighted_ensemble",
    "val_r2": val_r2,
    "test_r2": test_r2
}])
ensemble_df.to_csv(OUTPUT_DIR / "ensemble_results.csv", index=False)

# Save weighted ensemble
weighted_ensemble_package = {
    "type": "weighted",
    "models": trained_models,
    "weights": weights,
    "features": features,
    "scaler": scaler,
    "imputer": imputer,  # ADDED: Save imputer for inference
    "model_names": model_names
}
dump(weighted_ensemble_package, OUTPUT_DIR / "WEIGHTED_ENSEMBLE.pkl")


# ============================================================
# STACKING ENSEMBLE
# ============================================================

print("\n🏗️ Creating stacking ensemble...")

stack_train = np.column_stack([val_predictions[m] for m in model_names])
stack_test = np.column_stack([test_predictions[m] for m in model_names])

meta_model = Ridge(alpha=1.0)
meta_model.fit(stack_train, y_val)
stack_pred = meta_model.predict(stack_test)
stack_r2 = r2_score(y_test, stack_pred)

stack_df = pd.DataFrame([{
    "model": "stacking_ensemble",
    "test_r2": stack_r2
}])
stack_df.to_csv(OUTPUT_DIR / "stacking_results.csv", index=False)

# Save stacking model
stacking_package = {
    "type": "stacking",
    "models": trained_models,
    "meta_model": meta_model,
    "features": features,
    "scaler": scaler,
    "imputer": imputer,  # ADDED: Save imputer for inference
    "model_names": model_names
}
dump(stacking_package, OUTPUT_DIR / "STACKING_MODEL.pkl")


# ============================================================
# FINAL MODEL TRAINING (Best Single Model)
# ============================================================

print("\n💾 Training final best single model...")

full_train = pd.concat([train, val])
X_full = full_train[features].astype(np.float32)
X_full_imputed = imputer.transform(X_full)  # ADDED: Impute full data
X_full_scaled = scaler.transform(X_full_imputed)
y_full = full_train["yield_log"]

best_model_name = results_df.sort_values("val_r2", ascending=False).iloc[0]["model"]
print(f"Best model: {best_model_name}")

final_model = trained_models[best_model_name]

# Train on full data
if best_model_name in ["elastic", "mlp"]:
    final_model.fit(X_full_scaled, y_full)
else:
    final_model.fit(X_full_imputed, y_full)  # Use imputed but not scaled for tree models

dump(final_model, OUTPUT_DIR / "BEST_MODEL.pkl")


# ============================================================
# FEATURE ABLATION EXPERIMENTS
# ============================================================

print("\n🔬 Running feature ablation...")

def run_ablation(feature_list, label):
    if len(feature_list) == 0:
        print(label, "skipped")
        return None
    
    X_train_ab = train[feature_list].astype(np.float32)
    X_test_ab = test[feature_list].astype(np.float32)
    
    # IMPUTE ablation data
    X_train_ab = imputer.transform(X_train_ab)
    X_test_ab = imputer.transform(X_test_ab)
    
    y_train_ab = train["yield_log"]
    y_test_ab = test["yield_log"]
    
    # Scale for ElasticNet and MLP if needed
    if best_model_name in ["elastic", "mlp"]:
        scaler_ab = StandardScaler()
        X_train_ab = scaler_ab.fit_transform(X_train_ab)
        X_test_ab = scaler_ab.transform(X_test_ab)
    
    model = trained_models[best_model_name]
    model.fit(X_train_ab, y_train_ab)
    pred = model.predict(X_test_ab)
    
    r2 = r2_score(y_test_ab, pred)
    rmse = np.sqrt(mean_squared_error(y_test_ab, pred))
    print(label, "R2:", r2)
    
    return {
        "experiment": label,
        "r2": r2,
        "rmse": rmse,
        "feature_count": len(feature_list)
    }

ablation_results = []
ablation_results.append(run_ablation(features, "FULL_FEATURE_SET"))
ablation_results.append(run_ablation(lag_features, "LAG_ONLY"))
ablation_results.append(run_ablation(climate_features, "CLIMATE_ONLY"))
ablation_results.append(run_ablation(soil_features, "SOIL_ONLY"))
ablation_results.append(run_ablation(irrigation_features, "IRRIGATION_ONLY"))
ablation_results.append(run_ablation(crop_family_features, "CROP_FAMILY_ONLY"))

no_lag = [c for c in features if c not in lag_features]
ablation_results.append(run_ablation(no_lag, "NO_LAG"))

no_climate = [c for c in features if c not in climate_features]
ablation_results.append(run_ablation(no_climate, "NO_CLIMATE"))

ablation_df = pd.DataFrame([r for r in ablation_results if r is not None])
ablation_df.to_csv(OUTPUT_DIR / "feature_ablation_results.csv", index=False)


# ============================================================
# SAVE METADATA
# ============================================================

metadata = {
    "best_model": best_model_name,
    "feature_count": len(features),
    "train_end": TRAIN_END,
    "val_end": VAL_END,
    "test_start": TEST_START,
    "stage1_trials": STAGE1_TRIALS,
    "stage2_trials": STAGE2_TRIALS,
    "early_stopping_models": SLOW_MODELS,
    "total_time_minutes": (time.time() - start_time) / 60,
    "model_performance": results_df.to_dict('records')
}

with open(OUTPUT_DIR / "model_metadata.json", "w") as f:
    json.dump(metadata, f, indent=4)

dump(encoders, OUTPUT_DIR / "categorical_encoders.pkl")
dump(scaler, OUTPUT_DIR / "feature_scaler.pkl")
dump(imputer, OUTPUT_DIR / "feature_imputer.pkl")  # ADDED: Save imputer separately

with open(OUTPUT_DIR / "feature_order.json", "w") as f:
    json.dump(features, f, indent=4)

print("\n" + "="*80)
print("✅ AGROCHAIN PIPELINE COMPLETE")
print(f"Total time: {metadata['total_time_minutes']:.1f} minutes")
print("Results saved to:")
print(OUTPUT_DIR)
print("="*80)