import numpy as np
import pandas as pd
from typing import Dict, Any
from ml.registry import registry


class FeatureBuilder:
    """
    Reconstructs a single inference row
    using historical dataset + structural inputs
    """

    def __init__(self):
        self.base_df = registry.base_df
        self.feature_order = registry.feature_order

    # ============================================================
    # MAIN BUILD METHOD (FOR MODEL)
    # ============================================================

    def build_features(self, request: Dict[str, Any]) -> pd.DataFrame:

        crop = request["crop"]
        district = request["district_uid"]
        year = request["year"]
        season = request["season"]

        # --------------------------------------------------------
        # FILTER HISTORICAL DATA FOR THAT DISTRICT + CROP
        # --------------------------------------------------------

        hist = self.base_df[
            (self.base_df["district_uid"] == district) &
            (self.base_df["crop"] == crop)
        ].copy()

        if hist.empty:
            raise ValueError(
                f"No historical data available for crop '{crop}' in selected district."
            )

        hist = hist.sort_values("year")

        # --------------------------------------------------------
        # GET LAST AVAILABLE ROW BEFORE TARGET YEAR
        # --------------------------------------------------------

        prev_rows = hist[hist["year"] < year]

        if prev_rows.empty:
            # First year case
            last_row = hist.iloc[0]
            crop_historical_mean = np.nan
            crop_yield_drift = np.nan
            first_year_flag = 1
        else:
            last_row = prev_rows.iloc[-1]
            crop_historical_mean = last_row.get("crop_historical_mean", np.nan)
            crop_yield_drift = last_row.get("crop_yield_drift", np.nan)
            first_year_flag = 0

        # --------------------------------------------------------
        # START BUILDING FEATURE DICT
        # --------------------------------------------------------

        feature_dict = {}

        # Copy static numeric features from last known year
        for col in hist.columns:
            if col not in ["yield_log", "year"]:
                feature_dict[col] = last_row.get(col)

        # Override structural inputs
        feature_dict["crop"] = crop
        feature_dict["district_uid"] = district
        feature_dict["season"] = season
        feature_dict["year"] = year

        # Override historical computed features
        feature_dict["crop_historical_mean"] = crop_historical_mean
        feature_dict["crop_yield_drift"] = crop_yield_drift
        feature_dict["first_year_flag"] = first_year_flag

        # --------------------------------------------------------
        # OPTIONAL OVERRIDES (Future Safe)
        # --------------------------------------------------------

        if request.get("rainfall_override") is not None:
            feature_dict["hybrid_total_rain"] = request["rainfall_override"]

        if request.get("temperature_override") is not None:
            feature_dict["climate_avg_temp"] = request["temperature_override"]

        # --------------------------------------------------------
        # INTERACTIONS (MUST MATCH TRAINING v4)
        # --------------------------------------------------------

        if "hybrid_total_rain" in feature_dict and \
           "irrigation_coverage_ratio" in feature_dict:

            feature_dict["rain_irrigation_interaction"] = (
                feature_dict.get("hybrid_total_rain", 0) *
                feature_dict.get("irrigation_coverage_ratio", 0)
            )

        if "climate_heat_stress_days" in feature_dict and \
           "gw_dependence_ratio" in feature_dict:

            feature_dict["heat_gw_interaction"] = (
                feature_dict.get("climate_heat_stress_days", 0) *
                feature_dict.get("gw_dependence_ratio", 0)
            )

        if "climate_avg_temp" in feature_dict and \
           "irrigation_coverage_ratio" in feature_dict:

            feature_dict["temp_irrigation_interaction"] = (
                feature_dict.get("climate_avg_temp", 0) *
                feature_dict.get("irrigation_coverage_ratio", 0)
            )

        # --------------------------------------------------------
        # CONVERT TO DATAFRAME
        # --------------------------------------------------------

        df = pd.DataFrame([feature_dict])

        # --------------------------------------------------------
        # ALIGN TO TRAINED FEATURE ORDER
        # --------------------------------------------------------

        missing_cols = [
            f for f in self.feature_order if f not in df.columns
        ]

        for col in missing_cols:
            df[col] = 0  # safe default

        df = df[self.feature_order]
        return df

    # ============================================================
    # RAW FEATURES BUILD METHOD (FOR RESILIENCE)
    # ============================================================

    def build_raw_features(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Build raw features with preserved historical baseline for resilience calculation"""

        crop = request["crop"]
        district = request["district_uid"]
        year = request["year"]

        # Filter historical data for that district + crop
        hist = self.base_df[
            (self.base_df["district_uid"] == district) &
            (self.base_df["crop"] == crop)
        ].copy()

        if hist.empty:
            raise ValueError(
                f"No historical data available for crop '{crop}' in selected district."
            )

        hist = hist.sort_values("year")

        # Get last available row before target year
        prev_rows = hist[hist["year"] < year]

        if prev_rows.empty:
            # First year case
            last_row = hist.iloc[0]
        else:
            last_row = prev_rows.iloc[-1]

        feature_dict = {}

        # Copy everything from last known year
        for col in hist.columns:
            if col not in ["yield_log", "year"]:
                feature_dict[col] = last_row.get(col)

        # Preserve baseline BEFORE override
        feature_dict["historical_total_rain"] = last_row.get("hybrid_total_rain")
        feature_dict["historical_avg_temp"] = last_row.get("climate_avg_temp")

        # Add structural inputs
        feature_dict["crop"] = crop
        feature_dict["district_uid"] = district
        feature_dict["season"] = request["season"]
        feature_dict["year"] = year

        # Apply overrides (for model prediction)
        if request.get("rainfall_override") is not None:
            feature_dict["hybrid_total_rain"] = request["rainfall_override"]

        if request.get("temperature_override") is not None:
            feature_dict["climate_avg_temp"] = request["temperature_override"]

        return feature_dict