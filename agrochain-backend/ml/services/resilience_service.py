import numpy as np
from ml.registry import registry
import pandas as pd

class ResilienceService:

    def __init__(self):
        # Updated calibrated weights
        self.weights = {
            "climate": 0.30,
            "water": 0.25,
            "soil": 0.20,
            "yield_volatility": 0.15,
            "sustainability": 0.10,
        }
        
        self.ml_model = registry.resilience_adjustment_model
        self.ml_feature_cols = registry.resilience_feature_cols

        # Pre-compute resilience proxy distribution from historical data
        self._init_proxy_distribution()

    def _init_proxy_distribution(self):
        try:
            df = registry.base_df.copy()

            # Vectorized approximations
            fertility = np.clip(df["soil_fertility_stress"] / 5, 0, 1)
            ph_dev = np.clip(abs(df["ph"] - 6.5) / 2, 0, 1)
            whc = 1 - np.clip(df["rain_whc_stability"], 0, 1)
            structure = 1 - np.clip(df["soil_structure_index"] / 3, 0, 1)

            soil = (fertility + ph_dev + whc + structure) / 4

            # Use simplified proxy volatility constant
            YV = 0.15

            # Approximate climate + water risk means
            climate = np.clip(df["rain_volatility_stress"], 0, 1)
            water = np.clip(df["gw_dependence_ratio"], 0, 1)
            sustainability = np.clip(df["irrigation_available"], 0, 1)

            weighted = (
                self.weights["climate"] * (1 - climate) +
                self.weights["water"] * (1 - water) +
                self.weights["soil"] * (1 - soil) +
                self.weights["yield_volatility"] * (1 - YV) +
                self.weights["sustainability"] * sustainability
            )

            self.proxy_distribution = np.sort(100 * weighted.values)

        except Exception as e:
            print("[WARN] Distribution build failed:", e)
            self.proxy_distribution = np.linspace(20, 80, 500)
    
    def _compute_percentile(self, score):
        try:
            percentile = np.searchsorted(self.proxy_distribution, score) / len(self.proxy_distribution)
            return round(percentile * 100, 2)
        except:
            return 50.0

    def _amplify_risk(self, raw_risk):
        """Apply nonlinear amplification to risk values"""
        alpha = 1.2
        amplified = 1 - np.exp(-alpha * raw_risk)
        return float(np.clip(amplified, 0, 1))

    # --------------------------------------------------------
    # COMPONENTS (Using YOUR REAL COLUMNS)
    # --------------------------------------------------------

    def climate_risk(self, f):

        # -------------------------
        # STRUCTURAL CLIMATE RISK
        # -------------------------

        structural_values = [
            f.get("rain_volatility_stress", 0),
            f.get("flood_stress_index", 0) / 1000,
            f.get("climate_heat_stress_days", 0) / 60,
        ]

        structural_raw = np.clip(np.mean(structural_values), 0, 1)

        # -------------------------
        # DYNAMIC CLIMATE ANOMALY
        # -------------------------

        dynamic_components = []

        # Rain anomaly
        historical_rain = f.get("historical_total_rain")
        current_rain = f.get("hybrid_total_rain")

        if historical_rain is not None and historical_rain > 0:
            rain_dev = abs(current_rain - historical_rain) / historical_rain
            dynamic_components.append(np.clip(rain_dev, 0, 1))

        # Temperature anomaly
        historical_temp = f.get("historical_avg_temp")
        current_temp = f.get("climate_avg_temp")

        if historical_temp is not None:
            temp_dev = abs(current_temp - historical_temp) / 10
            dynamic_components.append(np.clip(temp_dev, 0, 1))

        if dynamic_components:
            dynamic_raw = np.mean(dynamic_components)
        else:
            dynamic_raw = 0

        # -------------------------
        # COMBINE
        # -------------------------

        combined = 0.6 * structural_raw + 0.4 * dynamic_raw

        return self._amplify_risk(combined)

    def water_risk(self, f):
        values = [
            1 - f.get("irrigation_coverage_ratio", 0),
            f.get("gw_dependence_ratio", 0),
            1 - f.get("drought_protection_index", 0),
            f.get("heat_gw_stress", 0),
        ]
        raw = float(np.clip(np.mean(values), 0, 1))
        # Apply nonlinear amplification
        return self._amplify_risk(raw)

    def soil_risk(self, f):
        fertility = f.get("soil_fertility_stress", 0) / 5  # normalize 0-5 scale
        fertility = np.clip(fertility, 0, 1)

        ph_dev = abs(f.get("ph", 6.5) - 6.5) / 2
        ph_dev = np.clip(ph_dev, 0, 1)

        whc = 1 - np.clip(f.get("rain_whc_stability", 0), 0, 1)

        structure = 1 - np.clip(f.get("soil_structure_index", 0) / 3, 0, 1)

        raw = np.mean([fertility, ph_dev, whc, structure])

        return self._amplify_risk(raw)

    def yield_volatility(self, predicted, yield_range):
        """NO amplification applied to yield volatility"""
        mean = predicted
        std = (yield_range[1] - yield_range[0]) / 2
        if mean == 0:
            return 1
        return float(np.clip(std / mean, 0, 1))

    def sustainability(self, f):
        # Balanced cropping intensity around 1.5 is ideal
        ci = f.get("cropping_intensity", 1.5)
        ci_score = 1 - abs(ci - 1.5) / 1.5
        ci_score = np.clip(ci_score, 0, 1)

        irrigation = f.get("irrigation_available", 0)

        return float(np.mean([ci_score, irrigation]))

    # --------------------------------------------------------
    # FINAL SCORE
    # --------------------------------------------------------

    def compute(self, features, predicted_yield, yield_range):

        
        CR = self.climate_risk(features)
        WR = self.water_risk(features)
        SR = self.soil_risk(features)
        YV = self.yield_volatility(predicted_yield, yield_range)
        SF = self.sustainability(features)

        # Calculate weighted score (using updated weights)
        weighted_score = (
            self.weights["climate"] * (1 - CR) +
            self.weights["water"] * (1 - WR) +
            self.weights["soil"] * (1 - SR) +
            self.weights["yield_volatility"] * (1 - YV) +
            self.weights["sustainability"] * SF
        )

        # -------------------------
        # HYBRID CORRECTION
        # -------------------------

        base_score = np.clip(weighted_score, 0, 1)

        if self.ml_model and self.ml_feature_cols:

            safe_row = {}

            for col in self.ml_feature_cols:

                val = features.get(col, 0)

                if val is None:
                    val = 0

                if isinstance(val, float) and np.isnan(val):
                    val = 0

                safe_row[col] = val

            feature_vector = pd.DataFrame([safe_row])

            feature_vector = feature_vector.fillna(0)

            adjustment = self.ml_model.predict(feature_vector)[0]

            # Stabilize correction
            adjustment = np.clip(adjustment, -0.08, 0.08)

            hybrid_score = base_score + adjustment
        else:
            hybrid_score = base_score

        hybrid_score = np.clip(hybrid_score, 0, 1)

        resilience_score = 100 * hybrid_score
        # Calculate percentile rank
        # Determine risk level
        if resilience_score >= 70:
            level = "High"
        elif resilience_score >= 40:
            level = "Moderate"
        else:
            level = "Low"
        percentile_rank = self._compute_percentile(resilience_score)

        return {
            "resilience_score": round(resilience_score, 2),
            "percentile_rank": percentile_rank,
            "risk_level": level,
            "climate_risk": round(CR, 3),
            "water_risk": round(WR, 3),
            "soil_risk": round(SR, 3),
            "yield_volatility": round(YV, 3),
        }
    
resilience_service = ResilienceService()