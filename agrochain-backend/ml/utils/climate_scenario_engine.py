import copy


class ClimateScenarioEngine:

    def apply_scenario(self, features, scenario):
        """
        Modify climate variables to simulate future conditions
        """

        f = copy.deepcopy(features)

        temp_shift = scenario.get("temp_delta", 0)
        rain_shift = scenario.get("rain_delta_pct", 0)

        # temperature change
        if "climate_avg_temp" in f:
            f["climate_avg_temp"] += temp_shift

        # rainfall change
        if "hybrid_total_rain" in f:
            f["hybrid_total_rain"] *= (1 + rain_shift / 100)

        # update stress features
        if "climate_heat_stress_days" in f:
            f["climate_heat_stress_days"] += temp_shift * 5

        return f

    # --------------------------------------------------
    # NEW: MULTI-SCENARIO GENERATOR
    # --------------------------------------------------

    def generate_scenarios(self):
        """
        Standard climate scenarios used for stability testing
        """

        return {
            "current": {
                "temp_delta": 0,
                "rain_delta_pct": 0
            },
            "+1C": {
                "temp_delta": 1,
                "rain_delta_pct": -2
            },
            "+2C": {
                "temp_delta": 2,
                "rain_delta_pct": -5
            },
            "drought": {
                "temp_delta": 1,
                "rain_delta_pct": -15
            }
        }


climate_engine = ClimateScenarioEngine()