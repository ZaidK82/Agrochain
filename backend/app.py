from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from prophet import Prophet
import numpy as np


app = Flask(__name__)
CORS(app)

# ===== Load Models & Preprocessing Objects =====
rf_model = joblib.load('models/rf_yield_model_no_prod.pkl')
xgb_model = joblib.load('models/xgb_yield_model_no_prod.pkl')
encoders = joblib.load('models/label_encoders_no_prod.pkl')
scaler_X = joblib.load('models/scaler_X_no_prod.pkl')

crop_model_data = joblib.load("models/crop_model.pkl")
crop_model = crop_model_data["model"]
crop_le = crop_model_data["label_encoder"]

# ===== Load Resilience Model and Encoders =====
res_model = joblib.load("models/Resilience/crop_resilience_model.pkl")
res_scaler = joblib.load("models/Resilience/scaler.pkl")
le_crop = joblib.load("models/Resilience/le_crop.pkl")
le_tissue = joblib.load("models/Resilience/le_tissue.pkl")
le_path = joblib.load("models/Resilience/le_path.pkl")
le_super = joblib.load("models/Resilience/le_super.pkl")
le_class = joblib.load("models/Resilience/le_class.pkl")
le_treat = joblib.load("models/Resilience/le_treat.pkl")

# ===== Load Dataset for Prophet =====
df_hist = pd.read_csv("models/crop_yield.csv")
df_hist['Crop'] = df_hist['Crop'].astype(str).str.strip().str.lower()
df_hist['State'] = df_hist['State'].astype(str).str.strip().str.lower()


# ===== Helper: preprocess input for yield models =====
def preprocess_input(data_dict, encoders, scaler):
    df = pd.DataFrame([data_dict])
    for col, le in encoders.items():
        if col in df.columns:
            df[col] = df[col].apply(lambda x: x if x in le.classes_ else le.classes_[0])
            df[col] = le.transform(df[col])
    numeric_cols = list(scaler.feature_names_in_)
    df[numeric_cols] = scaler.transform(df[numeric_cols])
    df = df[rf_model.feature_names_in_]
    return df


# ===== Routes =====
@app.route('/')
def home():
    return "🌾 AgroChain Backend Running Successfully!"


@app.route('/test_forecast', methods=['GET'])
def test_forecast():
    return jsonify({"message": "Forecast route is reachable!"})


# ===== Crop Recommendation =====
@app.route('/recommend_crop', methods=['POST'])
def recommend_crop():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        data = {k.lower(): v for k, v in data.items()}
        required_fields = ["n", "p", "k", "temperature", "humidity", "ph", "rainfall"]
        missing_fields = [f for f in required_fields if f not in data]
        if missing_fields:
            return jsonify({"error": f"Missing fields: {missing_fields}"}), 400

        features = [[
            float(data["n"]),
            float(data["p"]),
            float(data["k"]),
            float(data["temperature"]),
            float(data["humidity"]),
            float(data["ph"]),
            float(data["rainfall"])
        ]]

        pred_encoded = crop_model.predict(features)
        predicted_crop = crop_le.inverse_transform(pred_encoded)[0]

        return jsonify({"recommended_crop": predicted_crop})

    except Exception as e:
        print("Error in /recommend_crop:", str(e))
        return jsonify({"error": str(e)}), 500


# ===== Yield Forecasting =====
@app.route('/forecast_yield', methods=['POST'], strict_slashes=False)
def forecast_yield():
    try:
        data = request.get_json()
        crop_name = data.get("Crop", "").strip().lower()
        state_name = data.get("State", "").strip().lower()
        periods = int(data.get("Years", 5))

        df_prophet = df_hist[(df_hist["Crop"] == crop_name) & (df_hist["State"] == state_name)]
        if df_prophet.empty:
            return jsonify({
                "error": "No data available for this Crop/State",
                "available_crops": df_hist['Crop'].unique().tolist(),
                "available_states": df_hist['State'].unique().tolist()
            }), 404

        df_ts = df_prophet[['Crop_Year', 'Yield']].rename(columns={'Crop_Year': 'ds', 'Yield': 'y'})
        df_ts['ds'] = pd.to_datetime(df_ts['ds'], format='%Y')

        m = Prophet(yearly_seasonality=True)
        m.fit(df_ts)

        future = m.make_future_dataframe(periods=periods, freq='Y')
        forecast = m.predict(future)

        forecast_data = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(periods)
        forecast_data['ds'] = forecast_data['ds'].dt.year

        result = forecast_data.to_dict(orient="records")

        return jsonify({
            "Crop": crop_name,
            "State": state_name,
            "Forecast": result
        })

    except Exception as e:
        print("Error in /forecast_yield:", str(e))
        return jsonify({"error": str(e)}), 500


# ===== Yield Prediction =====
@app.route('/predict_yield', methods=['POST'])
def predict_yield():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No input data provided'}), 400

        df_preprocessed = preprocess_input(data, encoders, scaler_X)
        rf_pred = rf_model.predict(df_preprocessed)[0]
        xgb_pred = xgb_model.predict(df_preprocessed)[0]

        return jsonify({
            'rf_yield_prediction': f"{float(rf_pred):.2f} quintals/ha",
            'xgb_yield_prediction': f"{float(xgb_pred):.2f} quintals/ha"
        })

    except Exception as e:
        print("Error in /predict_yield:", str(e))
        return jsonify({'error': str(e)}), 500


# ==== Crop Resilience Prediction =====
@app.route('/predict_resilience', methods=['POST'])
def predict_resilience():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Normalize keys
        data = {k.lower(): v for k, v in data.items()}
        required_fields = ["crop", "tissue", "pathway", "superclass", "class", "mean", "p_value"]
        missing_fields = [f for f in required_fields if f not in data]
        if missing_fields:
            return jsonify({"error": f"Missing fields: {missing_fields}"}), 400

        # --- Safe label encoding helper ---
        def safe_encode(label_encoder, value, field_name):
            value = value.strip().lower()
            if value not in label_encoder.classes_:
                print(f"⚠️ Warning: Unseen label '{value}' in {field_name}. Adding temporarily.")
                label_encoder.classes_ = np.append(label_encoder.classes_, value)
            return label_encoder.transform([value])[0]

        # Encode categorical variables safely
        crop_enc = safe_encode(le_crop, data["crop"], "crop")
        tissue_enc = safe_encode(le_tissue, data["tissue"], "tissue")
        path_enc = safe_encode(le_path, data["pathway"], "pathway")
        super_enc = safe_encode(le_super, data["superclass"], "superclass")
        class_enc = safe_encode(le_class, data["class"], "class")

        mean_val = float(data["mean"])
        p_val = float(data["p_value"])

        X_sample = [[crop_enc, tissue_enc, path_enc, super_enc, class_enc, mean_val, p_val]]
        X_scaled = res_scaler.transform(X_sample)

        # Predict
        pred = res_model.predict(X_scaled)[0]
        treatment = le_treat.inverse_transform([pred])[0]

        # Human-readable explanation
        treatment_map = {
            "AP": "Adaptive Pathway – crop can recover with minimal stress management",
            "PP": "Protective Pathway – crop requires preventive care and optimized irrigation"
        }
        readable_treatment = treatment_map.get(treatment, f"Unknown Treatment ({treatment})")

        return jsonify({
            "predicted_treatment": treatment,
            "treatment_description": readable_treatment
        })

    except Exception as e:
        print("Error in /predict_resilience:", str(e))
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)
