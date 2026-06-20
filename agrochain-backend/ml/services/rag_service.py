from ml.services.vector_store import vector_store
from ml.services.llm_service import llm_service
from ml.services.knowledge_service import knowledge_service

class RAGService:

    def answer_question(self, question, crop=None, farm_context=None, is_followup=False):
        # ----------------------------------------
        # 🚨 EDGE CASE HANDLING (GENERIC QUESTIONS)
        # ----------------------------------------

        q_lower = question.lower()

        if len(q_lower.split()) <= 3 or any(x in q_lower for x in ["farming", "agriculture", "tell me"]):
            return "Please ask a farm-specific question related to your crop, yield, or conditions."
        
        # 1️⃣ Retrieve knowledge
        results = vector_store.search(question, crop=crop)

        # 🔥 FIX: fallback if empty
        if not results:
            print("[DEBUG] No crop match → fallback global search")
            results = vector_store.search(question, crop=None)

        # ----------------------------------------
        # 🔥 STRUCTURED KNOWLEDGE (NEW)
        # ----------------------------------------

        structured_results = knowledge_service.search(crop=crop)

        structured_knowledge = []

        for item in structured_results[:3]:
            structured_knowledge.append(
                f"""
                Crop: {item.get('crop')}
                Topic: {item.get('topic')}
                Info: {item.get('content')}
                """
            )

        structured_text = "\n\n".join(structured_knowledge)

        def build_vector_knowledge(results):

            blocks = []

            for item in results[:3]:

                if not isinstance(item, dict):
                    continue

                block = f"""
        Crop: {item.get('crop')}

        Disease: {item.get('disease', 'N/A')}

        Symptoms:
        {item.get('symptom')}

        Cause:
        {item.get('cause')}

        Impact:
        {item.get('impact')}

        Treatment:
        {item.get('treatment', item.get('solution', ''))}

        Prevention:
        {item.get('prevention')}

        Conditions:
        {item.get('trigger_conditions')}
        """
                blocks.append(block)

            return "\n\n".join(blocks)


        knowledge_text = build_vector_knowledge(results)

        # =========================================================
        # 🔥 IMPROVED INSTRUCTIONS
        # =========================================================

        # 🔥 DEBUG (optional but useful)
        print(f"[DEBUG] Crop-aware retrieval: {crop}")

        if is_followup:
            instruction = """
            You are continuing a conversation with a farmer.

            STRICT RULES:
            - DO NOT repeat previous actions
            - MUST use monitoring advice
            - MUST give NEXT STEP only
            - MAX 3 bullet points
            - NO explanation repetition

            FOCUS:
            Progressive guidance, not repetition.
            OUTPUT:
            Short bullet points only
            Max 3 points
        """
        else:
            instruction = """
            You are an expert agricultural advisor helping Indian farmers.

            STRICT RULES:
            - FARM DATA is the PRIMARY source (highest priority)
            - MUST include EXACT yield driver explanation
            - MUST use key risks as the cause
            - DO NOT generate generic suggestions
            - If weather data is present, explain how it affects the crop.
            - Use temperature, humidity, and conditions in reasoning.
            - Give 1 weather-based action if applicable.

            RESPONSE FORMAT:
            1. Cause (risk + yield driver explanation)
            2. Impact (include predicted yield + risk level)
            3. Actions (ONLY from recommended actions)

            Keep under 60 words.
            """

        # 🔥 RICE INTELLIGENCE BOOST
        if crop and crop.lower() == "rice":
            instruction += """

            ADDITIONAL RULES FOR RICE:
            - Include growth stage reasoning
            - Include severity if applicable
            - Explain yield impact clearly
            - Use cause → effect → action chain
            """
        if crop:
            instruction += f"""

            ADDITIONAL AGRONOMY RULES:
            - Explain crop-specific conditions (soil, water, temperature)
            - If disease or deficiency is detected, include cause → effect → action
            - If risk exists, connect it to yield impact
            - Prefer practical field-level reasoning
            """
                
        # 🔥 NEW — external knowledge
        weather_info = ""
        news_info = ""

        try:
            from ml.services.external.weather_service import get_weather_for_state

            if crop and "district_uid" in farm_context:
                state = farm_context.split("::")[0].replace("Farm Summary:", "").strip()
                weather_info = get_weather_for_state(state)

        except:
            pass

        try:
            from ml.services.external.news_service import get_agri_news
            news_info = get_agri_news()
        except:
            pass

        is_rag_query = any(word in question.lower() for word in [
            "disease", "infection", "treatment",
            "water", "irrigation",
            "soil", "fertility"
        ])

        if is_rag_query:
            priority_note = "USE VECTOR KNOWLEDGE FIRST"
        else:
            priority_note = "USE FARM DATA FIRST"
        # =========================================================
        # 🔥 FINAL PROMPT (STRONG CONTROL)
        # =========================================================
        
        prompt = f"""
        IMPORTANT:
        PRIORITY RULES:

        1. FARM DATA (STRICT — ALWAYS USE FIRST)
        2. STRUCTURED KNOWLEDGE
        3. VECTOR KNOWLEDGE
        4. WEATHER DATA
        5. NEWS DATA

        DO NOT override FARM DATA with any other source.
        You are an expert agricultural advisor.

        STRICT RULES:
        - You MUST use {priority_note} KNOWLEDGE when answering disease, irrigation, or crop condition questions
        - DO NOT give generic advice
        - If treatment exists → include exact chemical names
        - If conditions exist → explain cause-effect
        - DO NOT invent solutions

        {instruction}

        =================================================
        FARM DATA (USE THIS FIRST — DO NOT IGNORE)
        =================================================
        {farm_context}

        =================================================
        STRUCTURED KNOWLEDGE (HIGH PRIORITY)
        =================================================
        {structured_text}

        =================================================
        VECTOR KNOWLEDGE (SECONDARY)
        =================================================
        {knowledge_text}

        EXTERNAL DATA (REAL-TIME)
        -------------------------
        Weather:
        {weather_info}

        Market / News:
        {news_info}

        =================================================
        QUESTION:
        {question}
        =================================================

        RULE:
        - NEVER contradict farm data
        - DO NOT repeat previous answers

        Answer now:
        """

        print("\n[DEBUG] Prompt ready. Calling LLM...\n")
        print("\n========= RAG DEBUG =========")
        print("Vector Results:", results)
        print("Structured Results:", structured_results[:2])
        print("=============================\n")
        response = llm_service.generate(prompt)
        print("\n[DEBUG] LLM responded\n")

        return response
rag_service = RAGService()