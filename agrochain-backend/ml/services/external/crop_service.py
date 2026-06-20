import json
import os

DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/agri_knowledge.json")

def load_crop_data():
    with open(DATA_PATH, "r", encoding="utf-8") as file:
        return json.load(file)

def get_all_crops():
    data = load_crop_data()
    return [crop["crop_name"] for crop in data]

def get_crop_details(crop_name):
    data = load_crop_data()

    for crop in data:
        if crop["crop_name"].lower() == crop_name.lower():
            return crop

    return {"message": "Crop not found"}