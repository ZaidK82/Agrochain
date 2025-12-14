import React, { useState } from "react";

// Define the response structure from the backend
interface ResilienceResult {
  predicted_treatment: string;
  treatment_description: string;
}

const ResilienceForm: React.FC = () => {
  const [formData, setFormData] = useState({
    crop: "",
    tissue: "",
    pathway: "",
    superclass: "",
    class: "",
    mean: "",
    p_value: ""
  });

  const [result, setResult] = useState<ResilienceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict_resilience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data); // directly store the full JSON (treatment + description)
      } else {
        setError(data.error || "Prediction failed");
      }
    } catch (err) {
      setError("Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>🌱 Crop Resilience Scoring</h2>
        <p>Evaluate how resilient your crop is to changing climate and management factors.</p>
        <p>Enter biochemical and crop parameters to predict optimal treatment or resilience score.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <input name="crop" placeholder="Crop (e.g. corn)" onChange={handleChange} required />
        <input name="tissue" placeholder="Tissue (e.g. leaf)" onChange={handleChange} required />
        <input name="pathway" placeholder="Pathway (e.g. organic acids...)" onChange={handleChange} required />
        <input name="superclass" placeholder="Superclass (e.g. carboxylic acids...)" onChange={handleChange} required />
        <input name="class" placeholder="Class (e.g. amino acids)" onChange={handleChange} required />
        <input name="mean" type="number" step="any" placeholder="Mean value" onChange={handleChange} required />
        <input name="p_value" type="number" step="any" placeholder="p-value" onChange={handleChange} required />

        <button type="submit" disabled={loading}>
          {loading ? "Predicting..." : "Predict Resilience"}
        </button>
      </form>

      {result && (
        <div className="result-box success">
          🌿 <strong>Recommended Treatment:</strong> {result.predicted_treatment}
          <br />
          <span style={{ fontSize: "0.95em", color: "#2e7d32" }}>
            {result.treatment_description}
          </span>
        </div>
      )}

      {error && <div className="result-box error">⚠️ {error}</div>}
    </div>
  );
};

export default ResilienceForm;
