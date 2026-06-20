import joblib
import json
from pathlib import Path
from typing import Dict, Any
import pandas as pd


class ModelRegistry:
    def __init__(self):

        # ----------------------------------------------------
        # BASE PATHS
        # ----------------------------------------------------

        self.base_dir = Path(__file__).parent / "models" / "yield"

        # Dataset used for feature reconstruction (v4 cleaned)
        self.data_path = (
            Path(__file__).parent.parent
            / "data"
            / "cleaned_dataset_unified_v2_ready.parquet"
        )

        self.base_df: pd.DataFrame = None

        # Model directories
        self.unified_dir = self.base_dir / "unified"
        self.crop_dir = self.base_dir / "crop_specific"
        self._load_confidence_scores()
        # ----------------------------------------------------
        # MODEL STORAGE
        # ----------------------------------------------------

        self.unified_model = None
        self.encoders: Dict[str, Any] = {}
        self.feature_order = []
        self.routing_config: Dict[str, Dict[str, Any]] = {}
        self.crop_models: Dict[str, Any] = {}

        # ----------------------------------------------------
        # PREDECLARE MODELS (IMPORTANT)
        # ----------------------------------------------------

        self.recommendation_model = None
        self.recommendation_features = None
        self.recommendation_label_encoder = None

        self.resilience_adjustment_model = None
        self.resilience_feature_cols = None

        # ----------------------------------------------------
        # LOAD OPTIONAL MODELS
        # ----------------------------------------------------

        self._load_recommendation_model()
        self._load_resilience_model()
        print(f"[REGISTRY] Initializing from {self.base_dir}")

        # ----------------------------------------------------
        # LOAD EVERYTHING IN CORRECT ORDER
        # ----------------------------------------------------

        self._load_unified()
        self._load_base_dataset()
        self._load_crop_models()
        self._load_routing()

        print("[REGISTRY] Initialization complete.\n")

    # ============================================================
    # LOAD BASE DATASET (FOR FEATURE ENGINE)
    # ============================================================

    def _load_base_dataset(self):
        print("[REGISTRY] Loading base modeling dataset...")

        if not self.data_path.exists():
            raise FileNotFoundError(
                f"❌ Modeling dataset not found at: {self.data_path}"
            )

        df = pd.read_parquet(self.data_path)

        # Ensure temporal ordering (CRITICAL for historical features)
        df = df.sort_values(["district_uid", "crop", "year"]).copy()

        self.base_df = df

        print(f"[REGISTRY] Base dataset loaded ({len(df)} rows)")
        print(
            f"[REGISTRY] Years: {df['year'].min()} - {df['year'].max()} | "
            f"Crops: {df['crop'].nunique()} | "
            f"Districts: {df['district_uid'].nunique()}"
        )
    
    # ============================================================
    # LOAD CONFIDENCE (R²)
    # ============================================================

    def _load_confidence_scores(self):

        self.confidence_scores = {}

        compare_path = (
            Path(__file__).parent.parent
            / "data"
            / "unified_vs_crop_comparison_v2.csv"
        )

        if not compare_path.exists():
            print("[REGISTRY] No confidence file found.")
            return

        df = pd.read_csv(compare_path)

        for _, row in df.iterrows():
            self.confidence_scores[row["crop"]] = {
                "unified_r2": float(row["unified_r2"]),
                "crop_specific_r2": float(row["crop_specific_r2"])
            }

        print(f"[REGISTRY] Loaded confidence scores for {len(self.confidence_scores)} crops")
    # ============================================================
    # LOAD UNIFIED MODEL
    # ============================================================

    def _load_unified(self):
        print("[REGISTRY] Loading unified model...")

        model_path = self.unified_dir / "BEST_MODEL.pkl"
        encoder_path = self.unified_dir / "categorical_encoders.pkl"
        feature_path = self.unified_dir / "feature_order.json"

        if not model_path.exists():
            raise FileNotFoundError(f"❌ Unified model missing: {model_path}")

        self.unified_model = joblib.load(model_path)

        if encoder_path.exists():
            self.encoders = joblib.load(encoder_path)

        if feature_path.exists():
            with open(feature_path) as f:
                self.feature_order = json.load(f)

        print(f"[REGISTRY] Unified loaded ({len(self.feature_order)} features)")

    # ============================================================
    # LOAD CROP-SPECIFIC MODELS
    # ============================================================

    def _load_crop_models(self):
        print("[REGISTRY] Loading crop-specific models...")

        if not self.crop_dir.exists():
            print("[REGISTRY] No crop-specific directory found.")
            return

        for model_file in self.crop_dir.glob("*"):

            if not model_file.suffix in [".joblib", ".pkl"]:
                continue

            name = model_file.stem

            name = (
                name
                .replace("_best_v2", "")
                .replace("_ensemble_v2", "")
            )

            self.crop_models[name.lower()] = joblib.load(model_file)

        print(f"[REGISTRY] Loaded {len(self.crop_models)} crop models")

    # ============================================================
    # LOAD ROUTING CONFIG
    # ============================================================

    def _load_routing(self):
        routing_path = self.unified_dir / "hybrid_routing_config.json"

        if not routing_path.exists():
            print("[REGISTRY] No routing config found. Defaulting to unified.")
            self.routing_config = {}
            return

        with open(routing_path) as f:
            self.routing_config = json.load(f)

        print(f"[REGISTRY] Routing config loaded ({len(self.routing_config)} crops)")


    def _load_resilience_model(self):

        res_path = (
            Path(__file__).parent
            / "models"
            / "resilience"
            / "resilience_hybrid.pkl"
        )

        if not res_path.exists():
            print("[REGISTRY] No resilience hybrid model found.")
            return

        print("[REGISTRY] Loading resilience hybrid model...")

        model_data = joblib.load(res_path)

        self.resilience_adjustment_model = model_data["model"]
        self.resilience_feature_cols = model_data["feature_cols"]

        print(
            f"[REGISTRY] Resilience model loaded "
            f"({len(self.resilience_feature_cols)} features)"
        )

    def _load_recommendation_model(self):

        path = (
            Path(__file__).parent
            / "models"
            / "recommendation"
            / "recommendation_model.pkl"
        )

        if not path.exists():
            print("[REGISTRY] No recommendation model found.")
            return

        data = joblib.load(path)

        self.recommendation_model = data["model"]
        self.recommendation_features = data["features"]
        self.recommendation_label_encoder = data["label_encoder"]

        print(
            "[REGISTRY] Recommendation model loaded",
            f"({len(self.recommendation_features)} features)"
        )
    # ============================================================
    # GET MODEL BASED ON ROUTING
    # ============================================================

    def get_model_for_crop(self, crop: str):

        crop_clean = crop.strip()
        crop_lower = crop_clean.lower()

        route_info = (
            self.routing_config.get(crop_clean)
            or self.routing_config.get(crop_lower)
        )

        # If routing says crop-specific AND model exists → use it
        if route_info and route_info.get("route") == "crop_specific":
            model = self.crop_models.get(crop_lower)
            if model:
                return "crop_specific", model

        # Fallback → unified
        return "unified", self.unified_model


# ------------------------------------------------------------
# GLOBAL REGISTRY INSTANCE
# ------------------------------------------------------------

registry = ModelRegistry()