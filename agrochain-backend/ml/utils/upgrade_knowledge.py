import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

INPUT_FILE = os.path.join(BASE_DIR, "knowledge", "agri_knowledge_v2.json")
OUTPUT_FILE = os.path.join(BASE_DIR, "knowledge", "agri_knowledge_final.json")


def clean_text(text):
    if not text:
        return ""
    return str(text).strip()


def generate_entries(crop):
    crop_name = clean_text(crop.get("crop_name"))
    soil = clean_text(crop.get("soil_type"))
    fert = clean_text(crop.get("fertilizer_recommendation"))
    irrigation = clean_text(crop.get("irrigation"))
    temp = clean_text(crop.get("temperature_range"))
    diseases = crop.get("major_diseases", [])

    entries = []

    # ----------------------------------------
    # 1. SOIL-RELATED ENTRY
    # ----------------------------------------
    if soil:
        entries.append({
            "crop": crop_name,
            "symptom": "low yield poor soil drainage fertility issue",
            "cause": soil,
            "impact": "poor root development and reduced nutrient absorption",
            "solution": "improve soil structure, drainage, and organic matter",
            "content": f"{crop_name} grows best in {soil}. Poor soil conditions can lead to weak root development, reduced nutrient uptake, and ultimately lower yields. Improving soil structure and fertility is essential."
        })

    # ----------------------------------------
    # 2. IRRIGATION ENTRY
    # ----------------------------------------
    if irrigation:
        entries.append({
            "crop": crop_name,
            "symptom": "water stress drought over irrigation",
            "cause": irrigation,
            "impact": "reduced growth, yield loss, and plant stress",
            "solution": "optimize irrigation scheduling based on crop needs",
            "content": f"{crop_name} requires {irrigation}. Improper irrigation can cause water stress or waterlogging, both of which negatively impact plant growth and yield."
        })

    # ----------------------------------------
    # 3. TEMPERATURE / CLIMATE ENTRY
    # ----------------------------------------
    if temp:
        entries.append({
            "crop": crop_name,
            "symptom": "heat stress temperature impact",
            "cause": temp,
            "impact": "affects growth cycle and yield",
            "solution": "adjust planting time and use climate-resilient practices",
            "content": f"{crop_name} grows best in temperature range {temp}. Extreme temperatures can stress the crop, affecting flowering, grain filling, and overall productivity."
        })

    # ----------------------------------------
    # 4. FERTILIZER ENTRY
    # ----------------------------------------
    if fert:
        entries.append({
            "crop": crop_name,
            "symptom": "nutrient deficiency low yield yellow leaves",
            "cause": "improper fertilization",
            "impact": "stunted growth and reduced productivity",
            "solution": fert,
            "content": f"Proper fertilization is essential for {crop_name}. Recommended approach: {fert}. Lack of nutrients leads to poor growth, yellowing leaves, and reduced yield."
        })

    # ----------------------------------------
    # 5. DISEASE ENTRIES (IMPORTANT)
    # ----------------------------------------
    for disease in diseases:
        disease = clean_text(disease)

        entries.append({
            "crop": crop_name,
            "symptom": f"{disease} infection leaf damage disease",
            "cause": disease,
            "impact": "reduces photosynthesis and yield",
            "solution": "use resistant varieties and apply proper treatment",
            "content": f"{crop_name} is commonly affected by {disease}. This disease damages plant tissues, reduces photosynthesis, and lowers yield. Management includes resistant varieties and timely treatment."
        })

    return entries


def deduplicate(entries):
    seen = set()
    unique = []

    for e in entries:
        key = e["content"]
        if key not in seen:
            seen.add(key)
            unique.append(e)

    return unique


def main():
    with open(INPUT_FILE, "r") as f:
        data = json.load(f)

    all_entries = []

    for crop in data:
        all_entries.extend(generate_entries(crop))

    all_entries = deduplicate(all_entries)

    with open(OUTPUT_FILE, "w") as f:
        json.dump(all_entries, f, indent=2)

    print(f"✅ Generated {len(all_entries)} high-quality RAG entries")


if __name__ == "__main__":
    main()