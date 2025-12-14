import React, { useState } from "react";
import axios from "axios";

interface YieldFormData {
  Crop: string;
  Crop_Year: number;
  Season: string;
  State: string;
  Area: number;
  Annual_Rainfall: number;
  Fertilizer: number;
  Pesticide: number;
}

interface YieldPrediction {
  rf_yield_prediction: string;
  xgb_yield_prediction: string;
}

const YieldForm: React.FC = () => {
  const [formData, setFormData] = useState<YieldFormData>({
    Crop: "",
    Crop_Year: new Date().getFullYear(),
    Season: "",
    State: "",
    Area: "",
    Annual_Rainfall: "",
    Fertilizer: "",
    Pesticide: "",
  });


  const [predictions, setPredictions] = useState<YieldPrediction | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["Area", "Annual_Rainfall", "Fertilizer", "Pesticide", "Crop_Year"].includes(name)
        ? Number(value)
        : value,
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    // ✅ Convert numeric fields to numbers before sending
    const payload = {
      ...formData,
      Area: Number(formData.Area),
      Annual_Rainfall: Number(formData.Annual_Rainfall),
      Fertilizer: Number(formData.Fertilizer),
      Pesticide: Number(formData.Pesticide),
    };

    // ✅ Send the converted payload instead of raw formData
    const res = await axios.post<YieldPrediction>(
      "http://127.0.0.1:5000/predict_yield",
      payload
    );

    setPredictions(res.data);
  } catch (err) {
    console.error(err);
    alert("Error predicting yield. Check backend connection.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>🌾 Crop Yield Prediction</h2>
        <p>Enter your crop details below to get estimated yield results.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Crop:</label>
          <input
            type="text"
            name="Crop"
            value={formData.Crop}
            onChange={handleChange}
            placeholder="e.g., Wheat, Rice"
            required
          />
        </div>

        <div>
          <label>Crop Year:</label>
          <input
            type="number"
            name="Crop_Year"
            value={formData.Crop_Year}
            onChange={handleChange}
            min="1990"
            max={new Date().getFullYear()}
          />
        </div>

        <div>
          <label>Season:</label>
          <select name="Season" value={formData.Season} onChange={handleChange} required>
            <option value="">Select Season</option>
            <option value="Kharif">Kharif</option>
            <option value="Rabi">Rabi</option>
            <option value="Summer">Summer</option>
          </select>
        </div>

        <div>
          <label>State:</label>
          <input
            type="text"
            name="State"
            value={formData.State}
            onChange={handleChange}
            placeholder="Enter State name"
            required
          />
        </div>

        <div>
          <label>Area (hectares):</label>
          <input
            type="number"
            name="Area"
            value={formData.Area}
            onChange={handleChange}
            placeholder="Enter cultivated area"
            required
          />
        </div>

        <div>
          <label>Annual Rainfall (mm):</label>
          <input
            type="number"
            name="Annual_Rainfall"
            value={formData.Annual_Rainfall}
            onChange={handleChange}
            placeholder="e.g., 800"
          />
        </div>

        <div>
          <label>Fertilizer (kg):</label>
          <input
            type="number"
            name="Fertilizer"
            value={formData.Fertilizer}
            onChange={handleChange}
            placeholder="Total fertilizer used"
          />
        </div>

        <div>
          <label>Pesticide (kg):</label>
          <input
            type="number"
            name="Pesticide"
            value={formData.Pesticide}
            onChange={handleChange}
            placeholder="Total pesticide used"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Predicting..." : "Predict Yield"}
        </button>
      </form>

      {predictions && (
        <div className="predictions">
          <h3>Predicted Yield Results</h3>
          <p><strong>Random Forest:</strong> {predictions.rf_yield_prediction}</p>
          <p><strong>XGBoost:</strong> {predictions.xgb_yield_prediction}</p>
        </div>
      )}
    </div>
  );
};

export default YieldForm;
