from typing import Dict, Any, List



FEATURE_EXPLANATIONS = {

    "clay_pct": "High clay content can reduce soil drainage",

    "cec": "Soil cation exchange capacity influences nutrient availability",

    "organic_carbon_pct": "Organic carbon improves soil fertility and water retention",

    "sand_pct": "Sandy soils reduce water holding capacity",

    "bdod": "Biological oxygen demand may indicate soil microbial activity"
}


class AdvisoryService:

    def __init__(self):

        self.thresholds = {
            "climate_high": 0.6,
            "water_high": 0.5,
            "soil_high": 0.5,
            "volatility_high": 0.3
        }

    # ==========================================================
    # RISK ANALYSIS
    # ==========================================================

    def analyze_risks(self, resilience: Dict[str, Any]) -> List[str]:

        risks = []

        if resilience["climate_risk"] > self.thresholds["climate_high"]:
            risks.append("High climate variability")

        if resilience["water_risk"] > self.thresholds["water_high"]:
            risks.append("Irrigation shortage risk")

        if resilience["soil_risk"] > self.thresholds["soil_high"]:
            risks.append("Soil fertility stress")

        if resilience["yield_volatility"] > self.thresholds["volatility_high"]:
            risks.append("Unstable yield conditions")

        return risks

    # ==========================================================
    # ACTION GENERATION
    # ==========================================================

    def generate_actions(self, resilience):

        actions = []

        if resilience["climate_risk"] > 0.6:
            actions.append(
                "Use drought tolerant crop varieties and monitor rainfall patterns"
            )

        if resilience["water_risk"] > 0.5:
            actions.append(
                "Increase irrigation scheduling and improve water management"
            )

        if resilience["soil_risk"] > 0.5:
            actions.append(
                "Apply organic compost or balanced fertilizers"
            )

        if resilience["yield_volatility"] > 0.3:
            actions.append(
                "Consider crop diversification to reduce risk"
            )

        return actions

    # ==========================================================
    # MONITORING ADVICE
    # ==========================================================

    def generate_monitoring(self, resilience):

        monitoring = []

        if resilience["climate_risk"] > 0.4:
            monitoring.append(
                "Monitor rainfall forecasts and heat stress conditions"
            )

        if resilience["water_risk"] > 0.4:
            monitoring.append(
                "Track soil moisture and groundwater usage"
            )

        if resilience["soil_risk"] > 0.4:
            monitoring.append(
                "Perform soil health tests periodically"
            )

        return monitoring

    # ==========================================================
    # SHAP EXPLANATIONS
    # ==========================================================

    def explain_shap(self, shap_factors):

        explanations = []

        for factor in shap_factors:

            try:

                name = factor.split(" impact")[0]

                readable = FEATURE_EXPLANATIONS.get(
                    name,
                    name.replace("_", " ")
                )

                explanations.append(readable)

            except:
                continue

        return explanations[:3]

    # ==========================================================
    # FARM HEALTH SCORE
    # ==========================================================

    def compute_farm_health(self, prediction):

        resilience_score = prediction["resilience"]["resilience_score"]

        confidence = prediction["confidence_score"] * 100

        score = 0.6 * resilience_score + 0.4 * confidence

        return round(score, 2)

    

    # ==========================================================
    # BUILD FINAL ADVISORY
    # ==========================================================

    def build_advisory(self, prediction: Dict[str, Any]):

        resilience = prediction["resilience"]
        shap = prediction.get("top_contributing_factors", [])

        risks = self.analyze_risks(resilience)
        actions = self.generate_actions(resilience)
        monitoring = self.generate_monitoring(resilience)
        shap_explanations = self.explain_shap(shap)
        farm_health = self.compute_farm_health(prediction)

        return {

            "farm_health_score": farm_health,
            "risk_summary": resilience["risk_level"],
            "key_risks": risks,
            "recommended_actions": actions,
            "monitoring_advice": monitoring,
            "yield_driver_explanations": shap_explanations
        }


advisory_service = AdvisoryService()