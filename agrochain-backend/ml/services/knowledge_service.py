import json
from pathlib import Path


class KnowledgeService:

    def __init__(self):

        base_path = Path(__file__).resolve().parent.parent / "knowledge"

        self.knowledge = []

        for file_name in ["agri_knowledge_final.json", "rice_advanced.json"]:
            path = base_path / file_name

            if path.exists():
                with open(path, encoding="utf-8") as f:
                    self.knowledge.extend(json.load(f))

    def search(self, crop=None):

        results = []

        for entry in self.knowledge:

            entry_crop = entry.get("crop")

            if not entry_crop:
                continue

            if crop and entry_crop.lower() != crop.lower():
                continue

            results.append(entry)

        return results


knowledge_service = KnowledgeService()