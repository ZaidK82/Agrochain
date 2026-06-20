from fastapi import APIRouter
from app.schemas import ChatRequest
from ml.services.rag_service import rag_service
from ml.services.inference import inference_service
from ml.services.chat_memory import chat_memory


router = APIRouter()

@router.post("/chat")
async def chatbot(data: ChatRequest):

    # -------------------------
    # 1️⃣ Get history
    # -------------------------
    history = chat_memory.get_history(data.session_id)

    history_text = ""
    for msg in history:
        history_text += f"{msg['role']}: {msg['content']}\n"

    # -------------------------
    # 2️⃣ Handle farm context
    # -------------------------

    if data.farm_analysis:
        chat_memory.set_farm_context(data.session_id, data.farm_analysis)

    farm_data = chat_memory.get_farm_context(data.session_id)

    if not farm_data:
        return {
            "error": "Please run farm-analysis first and provide farm_analysis data."
        }

    # -------------------------
    # 3️⃣ Build farm context
    # -------------------------
    def build_farm_context(fa: dict) -> str:

        prediction = fa.get("prediction", {})
        resilience = fa.get("resilience", {})
        advisory = fa.get("advisory", {})
        recs = fa.get("recommended_crops", [])
        yield_drivers = advisory.get("yield_driver_explanations", [])

        best_crop = recs[0]["crop"] if recs else "N/A"

        farm_summary = fa.get("farm_summary", "No summary available")

        return f"""
    Farm Summary:
    {farm_summary}

    -------------------------

    Crop: {fa.get("crop", "N/A")}
    Predicted Yield: {prediction.get("predicted_yield")}
    Confidence: {prediction.get("confidence", prediction.get("confidence_label"))}

    -------------------------
    RISK METRICS (USE THESE NUMBERS)
    -------------------------
    Risk Level: {resilience.get("risk_level")}
    Soil Risk Score: {resilience.get("soil_risk")}
    Water Risk Score: {resilience.get("water_risk")}
    Climate Risk Score: {resilience.get("climate_risk")}

    -------------------------
    KEY RISKS (PRIMARY CAUSES)
    -------------------------
    {chr(10).join("- " + r for r in advisory.get("key_risks", []))}

    -------------------------
    RECOMMENDED ACTIONS (USE ONLY THESE)
    -------------------------
    {chr(10).join("- " + a for a in advisory.get("recommended_actions", []))}

    -------------------------
    YIELD DRIVERS (WHY YIELD IS LOW)
    -------------------------
    {chr(10).join("- " + y for y in yield_drivers)}

    -------------------------
    MONITORING ADVICE (FOR FOLLOW-UP)
    -------------------------
    {chr(10).join("- " + m for m in advisory.get("monitoring_advice", []))}

    Top Recommended Crop: {best_crop}

    --------------------------------
    IMPORTANT:
    - Use Yield Drivers in reasoning
    - Use Monitoring Advice for follow-ups
    - Do NOT repeat actions already given
    """
    
    farm_context = build_farm_context(farm_data)

    # =====================================================
    # 🔥 EXTRACT LAST ASSISTANT RESPONSE (FIRST!)
    # =====================================================
    last_response = ""

    for msg in reversed(history):
        if msg["role"] == "assistant":
            last_response = msg["content"]
            break

    # add history
    full_context = f"""
Previous Conversation:
{history_text}

Previous Answer (STRICTLY DO NOT REPEAT ANY OF THESE ACTIONS):
{last_response}

ALREADY GIVEN ACTIONS (DO NOT REPEAT):
Extract actions from previous answer and avoid them.

--------------------------------

{farm_context}
"""

    is_followup = len(history) > 0
    

    # -------------------------
    # 4️⃣ RAG + LLM
    # -------------------------
    answer = rag_service.answer_question(
        question=data.question,
        crop=farm_data.get("crop"),
        farm_context=full_context,
        is_followup=is_followup
    )

    # -------------------------
    # 5️⃣ Store memory
    # -------------------------
    chat_memory.add_message(data.session_id, "user", data.question)
    chat_memory.add_message(data.session_id, "assistant", answer)


    verification_status = "unknown"
    if data.farm_analysis and "trust_metadata" in data.farm_analysis:
        verification_status = data.farm_analysis["trust_metadata"].get("verification_status", "unknown")
    # -------------------------
    # 6️⃣ Response
    # -------------------------
    return {
        "question": data.question,
        "answer": answer
    }