import requests

OPENWEATHER_API_KEY = ""

# Major cities representing Indian states/UTs
STATE_CITIES = {
    "Maharashtra": "Mumbai",
    "Gujarat": "Ahmedabad",
    "Karnataka": "Bangalore",
    "Tamil Nadu": "Chennai",
    "Kerala": "Thiruvananthapuram",
    "Rajasthan": "Jaipur",
    "Uttar Pradesh": "Lucknow",
    "Madhya Pradesh": "Bhopal",
    "West Bengal": "Kolkata",
    "Punjab": "Chandigarh",
    "Haryana": "Chandigarh",
    "Bihar": "Patna",
    "Odisha": "Bhubaneswar",
    "Assam": "Guwahati",
    "Jharkhand": "Ranchi",
    "Chhattisgarh": "Raipur",
    "Uttarakhand": "Dehradun",
    "Himachal Pradesh": "Shimla",
    "Jammu & Kashmir": "Srinagar",
    "Goa": "Panaji",
    "Tripura": "Agartala",
    "Manipur": "Imphal",
    "Meghalaya": "Shillong",
    "Nagaland": "Kohima",
    "Arunachal Pradesh": "Itanagar",
    "Mizoram": "Aizawl",
    "Sikkim": "Gangtok",
    "Delhi": "Delhi",
    "Puducherry": "Puducherry",
    "Chandigarh": "Chandigarh",
    "Andaman & Nicobar": "Port Blair",
    "Lakshadweep": "Kavaratti",
    "Dadra & Nagar Haveli": "Silvassa",
    "Daman & Diu": "Daman",
    "Ladakh": "Leh"
}


def generate_advisory(temp, humidity, wind):
    season = "Kharif" if temp > 30 else "Rabi"

    irrigation = "Irrigation recommended" if temp > 32 else "No irrigation needed"

    disease_risk = "High" if humidity > 75 else "Low"

    spray = "Not suitable (wind too high)" if wind > 5 else "Suitable"

    overall = "Moderate" if disease_risk == "High" else "Low"

    return {
        "season": season,
        "irrigation_advice": irrigation,
        "disease_risk": disease_risk,
        "spray_condition": spray,
        "overall_risk": overall
    }


def get_all_weather():

    results = []

    for state, city in STATE_CITIES.items():

        url = f"https://api.openweathermap.org/data/2.5/weather?q={city},IN&appid={OPENWEATHER_API_KEY}&units=metric"

        try:
            res = requests.get(url)
            data = res.json()

            temp = data["main"]["temp"]
            humidity = data["main"]["humidity"]
            wind = data["wind"]["speed"]
            weather_desc = data["weather"][0]["description"]

            advisory = generate_advisory(temp, humidity, wind)

            results.append({
                "state": state,
                "current_conditions": {
                    "temperature": temp,
                    "humidity": humidity,
                    "weather": weather_desc,
                    "wind_speed": wind
                },
                "agricultural_advisory": advisory
            })

        except Exception as e:

            results.append({
                "state": state,
                "error": "Weather data unavailable"
            })

    return results

def get_weather_for_state(state_name):

    if state_name not in STATE_CITIES:
        return {"error": "State not supported"}

    city = STATE_CITIES[state_name]

    url = f"https://api.openweathermap.org/data/2.5/weather?q={city},IN&appid={OPENWEATHER_API_KEY}&units=metric"

    try:
        res = requests.get(url)
        data = res.json()

        temp = data["main"]["temp"]
        humidity = data["main"]["humidity"]
        wind = data["wind"]["speed"]
        weather_desc = data["weather"][0]["description"]

        advisory = generate_advisory(temp, humidity, wind)

        return {
            "state": state_name,
            "temperature": temp,
            "humidity": humidity,
            "weather": weather_desc,
            "wind_speed": wind,
            "advisory": advisory
        }

    except Exception as e:
        return {"error": str(e)}