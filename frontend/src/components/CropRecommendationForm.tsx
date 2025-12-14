import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";
import "../styles/CropRecommendationForm.css"; // CSS file for styling

interface CropFormData {
  N: number;
  P: number;
  K: number;
  Temperature: number;
  Humidity: number;
  pH: number;
  Rainfall: number;
}

interface CropPrediction {
  recommended_crop: string;
}

const CropRecommendationForm: React.FC = () => {
  const [formData, setFormData] = useState<CropFormData>({
    N: 0,
    P: 0,
    K: 0,
    Temperature: 25,
    Humidity: 50,
    pH: 6.5,
    Rainfall: 100,
  });

  const [prediction, setPrediction] = useState<CropPrediction | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post<CropPrediction>(
        "http://127.0.0.1:5000/recommend_crop",
        formData
      );
      setPrediction(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching crop recommendation. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>🌾 Smart Crop Recommendation</h2>
        <p>Get personalized crop suggestions based on your soil, rainfall, and region data.</p>
      </div>

      <form onSubmit={handleSubmit} className="crop-form">
        {Object.keys(formData).map((key) => (
          <div key={key} className="form-group">
            <label>{key}:</label>
            <input
              type="number"
              name={key}
              value={(formData as any)[key]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <button type="submit" disabled={loading}>
          {loading ? "Predicting..." : "Get Recommendation"}
        </button>
      </form>

      {prediction && (
        <div className="predictions">
          <h3>Recommended Crop:</h3>
          <p>{prediction.recommended_crop}</p>
        </div>
      )}
    </div>
  );
};

export default CropRecommendationForm;
