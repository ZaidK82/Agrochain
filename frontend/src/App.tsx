import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Dashboard from "./components/Dashboard";
import YieldForm from "./components/yieldform";
import ForecastForm from "./components/ForecastForm";
import CropRecommendationForm from "./components/CropRecommendationForm";
import ResilienceForm from "./components/ResilienceForm";

// Import all CSS modules
import "./styles/global.css";
import "./styles/navbar.css";
import "./styles/dashboard.css";
import "./styles/form.css";
import "./styles/predictions.css";
import "./styles/spinner.css";
import "./styles/resilience.css"

const App: React.FC = () => {
  return (
    <Router>
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" className="nav-logo">AgroChain</Link>
        </div>
        <div className="nav-right">
          <Link to="/predict">Yield Prediction</Link>
          <Link to="/forecast">Yield Forecast</Link>
          <Link to="/recommend">Crop Recommendation</Link>
          <Link to="/resilience">Resilience</Link>
        </div>
      </nav>

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/predict" element={<YieldForm />} />
          <Route path="/forecast" element={<ForecastForm />} />
          <Route path="/recommend" element={<CropRecommendationForm />} />
          <Route path="/resilience" element={<ResilienceForm />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
