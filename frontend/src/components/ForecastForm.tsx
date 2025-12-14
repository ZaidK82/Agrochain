import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";
import "../styles/forecast-chart.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ForecastFormData {
  Crop: string;
  State: string;
  Years: number;
}

interface ForecastItem {
  ds: number;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
}

interface ForecastResponse {
  Crop: string;
  State: string;
  Forecast: ForecastItem[];
}

const ForecastForm: React.FC = () => {
  const [formData, setFormData] = useState<ForecastFormData>({
    Crop: "",
    State: "",
    Years: 5,
  });

  const [forecast, setForecast] = useState<ForecastItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "Years" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post<ForecastResponse>(
        "http://127.0.0.1:5000/forecast_yield",
        formData
      );
      setForecast(res.data.Forecast);
    } catch (err) {
      console.error(err);
      alert("Error fetching forecast. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
  <h2>📈 Yield Forecasting</h2>
  <p>Analyze historical yield data to forecast future crop productivity trends.</p>
</div>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Crop:</label>
          <input type="text" name="Crop" value={formData.Crop} onChange={handleChange} required />
        </div>
        <div>
          <label>State:</label>
          <input type="text" name="State" value={formData.State} onChange={handleChange} required />
        </div>
        <div>
          <label>Forecast Years:</label>
          <input type="number" name="Years" value={formData.Years} onChange={handleChange} min={1} max={20} required />
        </div>
        <button type="submit" disabled={loading}>{loading ? "Forecasting..." : "Forecast"}</button>
      </form>

      {forecast && (
        <>
          <div className="forecast-results">
            <h3>Forecast Table:</h3>
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Predicted Yield</th>
                  <th>Lower Bound</th>
                  <th>Upper Bound</th>
                </tr>
              </thead>
              <tbody>
                {forecast.map(item => (
                  <tr key={item.ds}>
                    <td>{item.ds}</td>
                    <td>{item.yhat.toFixed(2)}</td>
                    <td>{item.yhat_lower.toFixed(2)}</td>
                    <td>{item.yhat_upper.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="recharts-wrapper">
            <h3>Forecast Chart:</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ds" label={{ value: "Year", position: "insideBottomRight", offset: 0 }} />
                <YAxis label={{ value: "Yield (quintals/ha)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Line type="monotone" dataKey="yhat" stroke="#001f4d" strokeWidth={2} name="Predicted Yield" />
                <Line type="monotone" dataKey="yhat_lower" stroke="#00aaff" strokeWidth={1} strokeDasharray="5 5" name="Lower Bound" />
                <Line type="monotone" dataKey="yhat_upper" stroke="#00aaff" strokeWidth={1} strokeDasharray="5 5" name="Upper Bound" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default ForecastForm;

