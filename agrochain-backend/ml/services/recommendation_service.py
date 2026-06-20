import numpy as np

from ml.registry import registry
from ml.utils.crop_geo_mapper import geo_mapper
from ml.utils.climate_scenario_engine import climate_engine
from ml.services.resilience_service import resilience_service
from ml.services.inference import inference_service


class RecommendationService:

    def __init__(self):

        from ml.registry import registry

        self.registry = registry

        # ML model
        self.model = registry.recommendation_model

        # feature list
        self.features = registry.recommendation_features

        # label encoder
        self.encoder = registry.recommendation_label_encoder

        if self.model is None:
            raise RuntimeError("Recommendation model not loaded")

        if self.encoder is None:
            raise RuntimeError("Recommendation encoder not loaded")
    # --------------------------------------------------
    # ML PREDICTION
    # --------------------------------------------------

    def ml_probabilities(self, features):

        probs = self.model.predict_proba(features)[0]

        classes = self.encoder.classes_

        result = {}

        for crop, prob in zip(classes, probs):
            result[crop] = float(prob)

        return result
    # --------------------------------------------------
    # GEO FILTER
    # --------------------------------------------------

    def filter_crops(self, crop_probs, district, season):

        valid = geo_mapper.get_crops_for_district_season(
            district,
            season
        )

        if not valid:
            valid = geo_mapper.get_crops_for_district(district)

        return {
            crop: prob
            for crop, prob in crop_probs.items()
            if crop in valid
        }

    # --------------------------------------------------
    # CLIMATE ADJUSTMENT
    # --------------------------------------------------

    def climate_adjusted_features(self, request, scenario):

        if not scenario:
            return request

        return climate_engine.apply_scenario(request, scenario)

    # --------------------------------------------------
    # FINAL RECOMMENDATION
    # --------------------------------------------------

    def recommend(self, request, scenario=None):

        district = request["district_uid"]
        season = request["season"]

        if district is None or season is None:
            raise ValueError("district_uid and season are required for recommendation")

        import pandas as pd

        features = self.climate_adjusted_features(request, scenario)

        # --------------------------------------------------
        # BUILD ML FEATURE VECTOR
        # --------------------------------------------------

        feature_vector = {}

        for f in self.features:
            feature_vector[f] = features.get(f, 0)

        # Convert to dataframe (LightGBM requirement)
        ml_df = pd.DataFrame([feature_vector])

        # Ensure column order matches training
        ml_df = ml_df[self.features]

        # ML probabilities
        crop_probs = self.ml_probabilities(ml_df)

        # Geo filtering
        crop_probs = self.filter_crops(
            crop_probs,
            district,
            season
        )

        sorted_ml = sorted(
            crop_probs.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]

        results = []

        yields = []
        resil_scores = []

        raw_results = []
        climate_stabilities = []

        for crop, prob in sorted_ml:

            crop_request = features.copy()
            crop_request["crop"] = crop

            pred, _ = inference_service.predict_yield(
                crop=crop,
                request_data=crop_request
            )

            predicted_yield = pred["predicted_yield"]
            yield_range = pred["yield_range"]

            # ---------------------------------------
            # MULTI-CLIMATE SCENARIO STABILITY
            # ---------------------------------------

            scenarios = climate_engine.generate_scenarios()

            scenario_yields = []

            for _, sc in scenarios.items():

                scenario_features = climate_engine.apply_scenario(
                    crop_request,
                    sc
                )

                s_pred, _ = inference_service.predict_yield(
                    crop=crop,
                    request_data=scenario_features
                )

                scenario_yields.append(s_pred["predicted_yield"])

            # stability = lower variation across climates
            stability = 1 - (np.std(scenario_yields) / (np.mean(scenario_yields) + 1e-6))
            stability = float(np.clip(stability, 0, 1))

            # IMPORTANT FIX
            res = resilience_service.compute(
                crop_request,
                predicted_yield,
                yield_range
            )

            raw_results.append({
                "crop": crop,
                "yield": predicted_yield,
                "resilience": res["resilience_score"],
                "ml_probability": prob,
                "climate_stability": stability
            })

            yields.append(predicted_yield)
            resil_scores.append(res["resilience_score"])

        # --------------------------------
        # NORMALIZATION
        # --------------------------------
        y_min, y_max = min(yields), max(yields)
        r_min, r_max = min(resil_scores), max(resil_scores)

        for r in raw_results:

            y_norm = (r["yield"] - y_min) / (y_max - y_min + 1e-6)
            r_norm = (r["resilience"] - r_min) / (r_max - r_min + 1e-6)

            # Optional climate stability proxy

            score = (
                0.40 * y_norm +
                0.35 * r_norm +
                0.20 * r["ml_probability"] +
                0.05 * r["climate_stability"]
            )

            r["score"] = score
            results.append(r)

        results.sort(key=lambda x: x["score"], reverse=True)

        return results[:3]


_recommendation_service = None


def get_recommendation_service():
    global _recommendation_service

    if _recommendation_service is None:
        _recommendation_service = RecommendationService()

    return _recommendation_service