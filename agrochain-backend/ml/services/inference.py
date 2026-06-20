import numpy as np
import shap
from typing import Dict, Any, Tuple

from ml.registry import registry
from ml.services.feature_builder import FeatureBuilder
from ml.services.resilience_service import ResilienceService
from ml.services.advisory_service import advisory_service

class InferenceService:

    def __init__(self):
        self.registry = registry
        self.feature_builder = FeatureBuilder()
        self.resilience_service = ResilienceService()

        # ------------------------------------------------------------
        # SHAP EXPLAINERS
        # ------------------------------------------------------------

        try:
            unified_model = self._extract_model(self.registry.unified_model)
            self.unified_explainer = shap.TreeExplainer(unified_model)
        except Exception:
            self.unified_explainer = None

        self.crop_explainers = {}

        for crop, model in self.registry.crop_models.items():
            try:
                real_model = self._extract_model(model)

                if real_model is None:
                    continue

                self.crop_explainers[crop.lower()] = shap.TreeExplainer(real_model)

            except Exception:
                continue

    # ============================================================
    # MODEL EXTRACTION (Fix for nested ensemble dictionaries)
    # ============================================================

    def _extract_model(self, obj):

        if hasattr(obj, "predict"):
            return obj

        if isinstance(obj, dict):

            for key in ["model", "stacking_model", "estimator", "regressor"]:
                if key in obj:
                    result = self._extract_model(obj[key])
                    if result is not None:
                        return result

            for v in obj.values():
                result = self._extract_model(v)
                if result is not None:
                    return result

        return None

    # ============================================================
    # CALIBRATED CONFIDENCE
    # ============================================================

    def _calculate_confidence(self, crop: str, route_type: str) -> float:

        crop_scores = self.registry.confidence_scores.get(crop)

        if not crop_scores:
            return 0.6

        r2 = (
            crop_scores["crop_specific_r2"]
            if route_type == "crop_specific"
            else crop_scores["unified_r2"]
        )

        normalized = (r2 - 0.3) / (0.95 - 0.3)
        normalized = max(0.0, min(1.0, normalized))

        return round(normalized, 2)

    # ============================================================
    # MAIN PREDICTION
    # ============================================================

    def predict_yield(
        self,
        crop: str,
        request_data: Dict[str, Any]
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:

        # --------------------------------------------------------
        # 1️⃣ FEATURE BUILD
        # --------------------------------------------------------

        raw_features = self.feature_builder.build_raw_features(request_data)
        df = self.feature_builder.build_features(request_data)

        # --------------------------------------------------------
        # 2️⃣ ROUTING
        # --------------------------------------------------------

        route_type, model = self.registry.get_model_for_crop(crop)

        # Extract real model
        model = self._extract_model(model)

        if model is None:
            raise ValueError("No valid predictor found inside loaded model")

        # --------------------------------------------------------
        # 3️⃣ PREPARE INPUT
        # --------------------------------------------------------

        if route_type == "unified":

            for col, encoder in self.registry.encoders.items():
                if col in df.columns:
                    df[col] = df[col].astype(str).apply(
                        lambda x: encoder.transform([x])[0]
                        if x in encoder.classes_
                        else -1
                    )

            X = df.astype(np.float32)
            explainer = self.unified_explainer

        else:

            X = df.select_dtypes(include=[np.number]).astype(np.float32)

            explainer = self.crop_explainers.get(crop.lower())

            if explainer is None:
                explainer = self.unified_explainer

        # --------------------------------------------------------
        # 4️⃣ MODEL PREDICTION
        # --------------------------------------------------------

        raw_pred = model.predict(X.values)[0]
        predicted_yield = float(np.expm1(raw_pred))

        # --------------------------------------------------------
        # 5️⃣ SHAP EXPLANATION
        # --------------------------------------------------------

        explanation = []

        if explainer is not None:

            try:
                shap_values = explainer.shap_values(X)

                if isinstance(shap_values, list):
                    shap_values = shap_values[0]

                feature_names = list(X.columns)
                shap_contrib = list(zip(feature_names, shap_values[0]))

                shap_contrib_sorted = sorted(
                    shap_contrib,
                    key=lambda x: abs(x[1]),
                    reverse=True
                )[:5]

                explanation = [
                    f"{name} impact: {round(float(value), 4)}"
                    for name, value in shap_contrib_sorted
                ]

            except Exception:
                explanation = []

        # --------------------------------------------------------
        # 6️⃣ CONFIDENCE CALIBRATION
        # --------------------------------------------------------

        confidence_score = self._calculate_confidence(crop, route_type)

        if confidence_score >= 0.75:
            confidence_label = "High"
        elif confidence_score >= 0.5:
            confidence_label = "Medium"
        else:
            confidence_label = "Low"

        if confidence_score >= 0.75:
            uncertainty_pct = 0.07
        elif confidence_score >= 0.5:
            uncertainty_pct = 0.12
        else:
            uncertainty_pct = 0.20

        yield_min = predicted_yield * (1 - uncertainty_pct)
        yield_max = predicted_yield * (1 + uncertainty_pct)

        result = {
            "predicted_yield": round(predicted_yield, 2),
            "yield_range": [
                round(yield_min, 2),
                round(yield_max, 2)
            ],
            "confidence_score": confidence_score,
            "confidence_label": confidence_label,
            "top_contributing_factors": explanation,
            "model_route": route_type
        }

        # --------------------------------------------------------
        # 7️⃣ RESILIENCE
        # --------------------------------------------------------

        resilience_result = self.resilience_service.compute(
            features=raw_features,
            predicted_yield=predicted_yield,
            yield_range=result["yield_range"]
        )

        result["resilience"] = resilience_result

        # --------------------------------------------------------
        # ADVISORY
        # --------------------------------------------------------

        advisory = advisory_service.build_advisory(result)

        result["advisory"] = advisory

        # --------------------------------------------------------
        # DEBUG
        # --------------------------------------------------------

        debug = {
            "route": route_type,
            "model_type": type(model).__name__,
            "feature_count": X.shape[1]
        }

        return result, debug


# ------------------------------------------------------------
# GLOBAL SERVICE INSTANCE
# ------------------------------------------------------------

inference_service = InferenceService()