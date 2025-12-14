import requests

url = "http://127.0.0.1:5000/predict_yield"
data = {
    "Crop": "wheat",
    "Crop_Year": 2025,
    "Season": "Rabi",
    "State": "Punjab",
    "Area": 2.5,
    "Production": 80,
    "Annual_Rainfall": 120,
    "Fertilizer": 50,
    "Pesticide": 10
}

response = requests.post(url, json=data)
print(response.json())
