import joblib
import pandas as pd

# Load models & encoders
rf_model = joblib.load('models/rf_yield_model.pkl')
xgb_model = joblib.load('models/xgb_yield_model.pkl')
encoders = joblib.load('models/label_encoders.pkl')
scaler = joblib.load('models/scaler_X.pkl')

# Numeric columns for scaling (as per scaler)
numeric_cols = list(scaler.feature_names_in_)

# Sample input
sample_input = {
    'Crop': 'wheat',
    'Crop_Year': 2025,
    'Season': 'Rabi',
    'State': 'Punjab',
    'Area': 2.5,
    'Production': 80,
    'Annual_Rainfall': 120,
    'Fertilizer': 50,
    'Pesticide': 10
}

# Convert to DataFrame
df = pd.DataFrame([sample_input])

# Encode categorical columns
for col, le in encoders.items():
    df[col] = df[col].apply(lambda x: x if x in le.classes_ else le.classes_[0])
    df[col] = le.transform(df[col])

# Scale numeric columns only
df[numeric_cols] = scaler.transform(df[numeric_cols])

# Reorder all columns as model expects
df = df[rf_model.feature_names_in_]

# Predict
rf_pred = rf_model.predict(df)[0]
xgb_pred = xgb_model.predict(df)[0]

print("Processed Input:\n", df)
print("RF Prediction:", rf_pred)
print("XGB Prediction:", xgb_pred)

