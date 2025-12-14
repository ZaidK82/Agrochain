import React from "react";
import { Link } from "react-router-dom";
import "../styles/dashboard.css";

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🌾 Welcome to AgroChain</h1>
        <p>
          AgroChain empowers farmers with AI-driven insights for sustainable agriculture. 
          Predict yields, forecast future trends, identify optimal crops, and assess crop resilience.
        </p>
      </div>

      <div className="cards-container">
        {/* Yield Prediction */}
        <div className="card">
          <h3>Yield Prediction</h3>
          <p>
            Enter crop, area, fertilizer, rainfall, and pesticide details to predict expected yield using ML models.
          </p>
          <Link to="/predict" className="card-link">
            Go to Prediction →
          </Link>
        </div>

        {/* Yield Forecasting */}
        <div className="card">
          <h3>Yield Forecasting</h3>
          <p>
            Forecast crop yield for the next 5–20 years using Prophet-based time series forecasting.
          </p>
          <Link to="/forecast" className="card-link">
            Go to Forecast →
          </Link>
        </div>

        {/* Crop Recommendation */}
        <div className="card">
          <h3>Crop Recommendation</h3>
          <p>
            Provide soil nutrients (NPK), pH, humidity, and temperature to get the best crop recommendation.
          </p>
          <Link to="/recommend" className="card-link">
            Go to Recommendation →
          </Link>
        </div>

        {/* 🌱 Crop Resilience Scoring */}
        <div className="card">
          <h3>Resilience Scoring</h3>
          <p>
            Assess crop health and resilience based on tissue, pathway, and metabolite information. 
            Predict optimal treatments or stress response levels.
          </p>
          <Link to="/resilience" className="card-link">
            Go to Resilience →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
