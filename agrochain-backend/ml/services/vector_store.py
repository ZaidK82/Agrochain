import json
import faiss
import numpy as np
from pathlib import Path
from sentence_transformers import SentenceTransformer


class VectorStore:

    def __init__(self):
        

        self.model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

        # -------------------------------
        # LOAD KNOWLEDGE FILE
        # -------------------------------

        base_path = Path(__file__).resolve().parent.parent
        file_path = base_path / "knowledge" / "agri_knowledge_rag.json"

        with open(file_path, "r") as f:
            self.data = json.load(f)

        # -------------------------------
        # CLEAN + EXTRACT TEXT
        # -------------------------------
        self.texts = []
        self.metadata = []

        for item in self.data:

            normalized = self._normalize_entry(item)
            full_text = self._build_text(normalized).strip()

            if not full_text:
                continue

            self.texts.append(full_text)
            self.metadata.append(normalized)
        
        if not self.texts:
            raise ValueError("❌ No valid content found in knowledge JSON")
        # -------------------------------
        # BUILD EMBEDDINGS
        # -------------------------------
        # AFTER CLEANING
        if not self.texts:
            raise ValueError("❌ No valid content found in knowledge JSON")

        # EMBEDDINGS
        embeddings = self.model.encode(self.texts)

        if len(embeddings) == 0:
            raise ValueError("❌ Embeddings empty")


        # FAISS
        self.index = faiss.IndexFlatL2(len(embeddings[0]))
        self.index.add(np.array(embeddings))

    # -------------------------
    # NORMALIZATION
    # -------------------------
    def _normalize_entry(self, entry):

        for key in ["symptom", "cause", "impact", "solution", "content"]:
            if key in entry and isinstance(entry[key], str):
                entry[key] = entry[key].replace("Â°C", "°C")

        if isinstance(entry.get("symptom"), str):
            entry["symptom"] = entry["symptom"].split()

        return entry

    # -------------------------
    # TEXT BUILDER
    # -------------------------
    def _build_text(self, item):

        symptom = " ".join(item.get("symptom", [])) if isinstance(item.get("symptom"), list) else item.get("symptom", "")

        # Detect type
        is_disease_entry = "disease" in item or "issue" in item
        has_triggers = "trigger_conditions" in item

        # Build trigger text safely
        trigger_text = ""
        if has_triggers:
            triggers = item.get("trigger_conditions", {})
            trigger_text = " ".join([f"{k}:{v}" for k, v in triggers.items()])

        # -------------------------
        # 🧠 RICH (Rice / Disease Data)
        # -------------------------
        if is_disease_entry:

            return f"""
            Crop: {item.get('crop', '')}
            Disease: {item.get('disease', item.get('issue', ''))}
            Symptom: {symptom}
            Cause: {item.get('cause', '')}
            Impact: {item.get('impact', '')}
            Severity: {item.get('severity', '')}
            Yield Loss: {item.get('yield_loss_estimate', '')}
            Triggers: {trigger_text}
            Prevention: {' '.join(item.get('prevention', []))}
            Treatment: {' '.join(item.get('treatment', []))}
            Content: {item.get('content', '')}
            """

        # -------------------------
        # 🌾 GENERIC (Other Crops)
        # -------------------------
        else:

            return f"""
            Crop: {item.get('crop', '')}
            Symptom: {symptom}
            Cause: {item.get('cause', '')}
            Impact: {item.get('impact', '')}
            Solution: {item.get('solution', '')}
            Content: {item.get('content', '')}
            """

    # -------------------------
    # SEARCH (FIXED)
    # -------------------------
    def search(self, query, crop=None, k=3):

        query_embedding = self.model.encode([query])

        # 🔥 Step 1 — retrieve more candidates
        distances, indices = self.index.search(query_embedding, k * 5)

        results = []

        # 🔥 Step 2 — STRICT crop filtering
        for idx in indices[0]:
            item = self.metadata[idx]

            if crop:
                item_crop = item.get("crop", "").strip().lower()
                if item_crop != crop.strip().lower():
                    continue

            results.append(item)

            # 🔥 stop early when enough results
            if len(results) >= k:
                break

        # 🔥 Step 3 — fallback (only if NOTHING found)
        if not results:
            print("[DEBUG] No crop match → fallback global search")

            for idx in indices[0][:k]:
                results.append(self.metadata[idx])

        return results



vector_store = VectorStore()