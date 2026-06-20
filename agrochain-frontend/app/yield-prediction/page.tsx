'use client';

import { useState, useEffect } from 'react';
import { fetchMetadata, fetchFarmAnalysis, FarmAnalysisResponse } from '../../lib/api';
import { MetadataResponse } from '../../lib/types/metadata';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import ResilienceScore from '../components/Resilience/ResilienceScore';
import VerificationBadge from '../components/Predictions/VerificationBadge';
import PredictionCard from '../components/Predictions/PredictionCard';
import { useResilience } from '../context/ResilienceContext';
import { useApp } from '../context/AppContext';
import { Leaf, TrendingUp, AlertTriangle, Lightbulb, CheckCircle, RefreshCw, Database, Shield, Droplets } from 'lucide-react';

interface FormData {
  crop: string;
  district_uid: string;
  year: number;
  season: string;
}

export default function YieldPredictionPage() {
  const { metadata, metadataLoading, metadataError, lastAnalysis, setLastAnalysis, refreshMetadata } = useApp();
  const { setPrediction } = useResilience();
  
  const [selectedState, setSelectedState] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    crop: '',
    district_uid: '',
    year: new Date().getFullYear(),
    season: '',
  });
  const [useLiveWeather, setUseLiveWeather] = useState(false);
  const [rainfallOverride, setRainfallOverride] = useState<number | null>(null);
  const [temperatureOverride, setTemperatureOverride] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<FarmAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  // Load saved analysis from AppContext on mount
  useEffect(() => {
    if (lastAnalysis) {
      setAnalysis(lastAnalysis);
      setPrediction(lastAnalysis);
    }
  }, [lastAnalysis, setPrediction]);

  // Initialize form when metadata loads
  useEffect(() => {
    if (metadata && metadata.states.length > 0 && !selectedState) {
      const firstState = metadata.states[0];
      setSelectedState(firstState);
      
      const firstDistrict = metadata.districts_by_state[firstState]?.[0];
      if (firstDistrict) {
        const availableCrops = metadata.crops_by_district?.[firstDistrict.value] || [];
        const firstCrop = availableCrops[0] || metadata.crops[0];
        const firstSeason = metadata.seasons[0];
        
        setFormData(prev => ({
          ...prev,
          district_uid: firstDistrict.value,
          crop: firstCrop,
          season: firstSeason,
        }));
      }
    }
  }, [metadata, selectedState]);

  // Fetch coordinates when district changes
  useEffect(() => {
    if (selectedState && formData.district_uid && metadata) {
      const district = metadata.districts_by_state[selectedState]?.find(d => d.value === formData.district_uid);
      if (district) fetchCoordinates(selectedState, district.label);
    }
  }, [formData.district_uid, selectedState, metadata]);

  // Fetch live weather when coordinates change
  useEffect(() => {
    if (useLiveWeather && coordinates) fetchLiveWeather();
  }, [coordinates, useLiveWeather]);

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        rainfall_override: rainfallOverride !== null && rainfallOverride !== '' ? rainfallOverride : null,
        temperature_override: temperatureOverride !== null && temperatureOverride !== '' ? temperatureOverride : null,
      };
      
      const result = await fetchFarmAnalysis(payload);
      setAnalysis(result);
      setPrediction(result);
      setLastAnalysis(result);
    } catch (err: any) {
      setAnalysis(null);
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  async function fetchCoordinates(state: string, districtLabel: string) {
    try {
      const query = encodeURIComponent(`${districtLabel}, ${state}, India`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
        { headers: { 'User-Agent': 'AgroChain-App' } }
      );
      const data = await res.json();
      if (data.length > 0) {
        setCoordinates({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    }
  }

  async function fetchLiveWeather() {
    if (!coordinates) return;
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.lat}&longitude=${coordinates.lon}&daily=temperature_2m_max,precipitation_sum&timezone=auto`
      );
      const data = await res.json();
      if (data.daily) {
        setTemperatureOverride(data.daily.temperature_2m_max[0]);
        setRainfallOverride(data.daily.precipitation_sum[0]);
      }
    } catch (err) {
      console.error("Weather fetch failed:", err);
    }
  }

  const availableCrops = formData.district_uid && metadata
    ? metadata.crops_by_district?.[formData.district_uid] || []
    : metadata?.crops || [];

  const availableSeasons = formData.district_uid && formData.crop && metadata
    ? metadata.seasons_by_crop_district?.[formData.district_uid]?.[formData.crop] || []
    : metadata?.seasons || [];

  // Prepare dynamic cards based on available data
  // Prepare dynamic cards based on available data
const getDynamicCards = () => {
  const cards = [];
  
  // Card 1: Risk Analysis
  if (analysis) {
    cards.push({
      id: 'risk',
      title: 'Risk Analysis',
      icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
      content: (
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Primary Risk Factor</p>
            <p className="font-semibold capitalize">{analysis.risk_summary.risk_factor}</p>
            <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${analysis.risk_summary.severity_score * 100}%` }}
              />
            </div>
          </div>
          {analysis.advisory.key_risks.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Key Risks</p>
              <ul className="space-y-1">
                {analysis.advisory.key_risks.slice(0, 2).map((risk, idx) => (
                  <li key={idx} className="text-sm flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    });
  }
  
  // Card 2: Recommended Actions
  if (analysis?.advisory.recommended_actions.length > 0) {
    cards.push({
      id: 'actions',
      title: 'Recommended Actions',
      icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
      content: (
        <ul className="space-y-2">
          {analysis.advisory.recommended_actions.slice(0, 3).map((action, idx) => (
            <li key={idx} className="text-sm flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              {action}
            </li>
          ))}
        </ul>
      )
    });
  }
  
  // Card 3: Yield Drivers
  if (analysis?.advisory.yield_driver_explanations.length > 0) {
    cards.push({
      id: 'drivers',
      title: 'Yield Drivers',
      icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
      content: (
        <ul className="space-y-2">
          {analysis.advisory.yield_driver_explanations.slice(0, 3).map((driver, idx) => (
            <li key={idx} className="text-sm text-gray-600 flex items-start">
              <TrendingUp className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              {driver}
            </li>
          ))}
        </ul>
      )
    });
  }
  
  // Card 4: Recommended Crops
  if (analysis?.recommended_crops && analysis.recommended_crops.length > 0) {
    cards.push({
      id: 'crops',
      title: 'Recommended Crops',
      icon: <Leaf className="h-5 w-5 text-green-500" />,
      content: (
        <div className="space-y-2">
          {analysis.recommended_crops.slice(0, 3).map((crop, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg hover-scale">
              <div>
                <p className="font-semibold text-sm">{crop.crop}</p>
                <p className="text-xs text-gray-500">Resilience: {crop.resilience?.toFixed(0) || 'N/A'}%</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600 text-sm">{crop.yield?.toLocaleString()} kg/ha</p>
                <p className="text-xs text-gray-500">Match: {(crop.score * 100).toFixed(0)}%</p>
              </div>
            </div>
          ))}
        </div>
      )
    });
  }
  
  // Card 5: Monitoring Advice
  if (analysis?.advisory.monitoring_advice.length > 0) {
    cards.push({
      id: 'monitoring',
      title: 'Monitoring Advice',
      icon: <Droplets className="h-5 w-5 text-blue-500" />,
      content: (
        <ul className="space-y-1">
          {analysis.advisory.monitoring_advice.slice(0, 3).map((advice, idx) => (
            <li key={idx} className="text-sm text-blue-700 flex items-start">
              <span className="mr-2">📊</span>
              {advice}
            </li>
          ))}
        </ul>
      )
    });
  }
  
  // Card 6: Blockchain Verification - FIXED VERSION
  if (analysis?.trust_metadata) {
    cards.push({
      id: 'blockchain',
      title: 'Blockchain Verification',
      icon: <Shield className="h-5 w-5 text-purple-500" />,
      content: (
        <VerificationBadge
          advisoryId={analysis.trust_metadata.advisory_id}
          contentHash={analysis.trust_metadata.content_hash}
          blockchainStatus={analysis.trust_metadata.blockchain?.status}
          mock={analysis.trust_metadata.blockchain?.mock}
          verificationStatus={analysis.trust_metadata.verification_status}
          tx_hash={analysis.trust_metadata.blockchain?.tx_hash}
          block={analysis.trust_metadata.blockchain?.block}
          version={analysis.trust_metadata.blockchain?.version}
          // REMOVED compact={true} - so full details show!
        />
      )
    });
  }
  
  return cards;
};
  const dynamicCards = getDynamicCards();

  return (
    <div className="min-h-screen w-full page-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header with animation */}
        <div className="mb-6 flex justify-between items-center animate-slideDown">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Farm Analysis</h1>
            <p className="text-gray-600 animate-fadeIn">AI-powered yield prediction, risk assessment, and advisory</p>
          </div>
          <button
            onClick={refreshMetadata}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 bg-white rounded-lg shadow-sm hover-scale transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Cache Info Banner with animation */}
        {lastAnalysis && (
          <div className="mb-4 p-2 bg-blue-50 rounded-lg text-xs text-blue-700 flex items-center justify-between animate-slideInRight">
            <div className="flex items-center space-x-2">
              <Database className="h-3 w-3" />
              <span>Last analysis saved. Data persists across page refreshes.</span>
            </div>
            <button
              onClick={() => {
                setAnalysis(null);
                setLastAnalysis(null);
              }}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Clear
            </button>
          </div>
        )}

        {/* FULL WIDTH FORM with animation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 card-hover animate-fadeIn">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Leaf className="h-5 w-5 text-green-600 mr-2" />
            Farm Input
          </h2>

          {metadataError && (
            <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm animate-fadeIn">
              ⚠️ {metadataError}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm animate-fadeIn">
              Error: {error}
            </div>
          )}

          {metadataLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="medium" />
              <span className="ml-2 text-gray-500">Loading crop data...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      const newState = e.target.value;
                      setSelectedState(newState);
                      const firstDistrict = metadata?.districts_by_state[newState]?.[0];
                      if (firstDistrict) {
                        handleChange('district_uid', firstDistrict.value);
                        const districtCrops = metadata?.crops_by_district?.[firstDistrict.value] || [];
                        if (districtCrops.length > 0) {
                          handleChange('crop', districtCrops[0]);
                        }
                      }
                    }}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                    disabled={loading}
                  >
                    {metadata?.states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">District</label>
                  <select
                    value={formData.district_uid}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleChange('district_uid', value);
                      const districtCrops = metadata?.crops_by_district?.[value] || [];
                      if (districtCrops.length > 0) {
                        handleChange('crop', districtCrops[0]);
                      }
                    }}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                    disabled={loading}
                  >
                    <option value="">Select district</option>
                    {metadata?.districts_by_state[selectedState]?.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Crop</label>
                  <select
                    value={formData.crop}
                    onChange={(e) => handleChange('crop', e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                    disabled={loading}
                  >
                    {availableCrops.length === 0 ? (
                      <option value="">No crops available</option>
                    ) : (
                      availableCrops.map((crop: string) => (
                        <option key={crop} value={crop}>{crop}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleChange('year', Number(e.target.value))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                    disabled={loading}
                    min="2000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Season</label>
                  <select
                    value={formData.season}
                    onChange={(e) => handleChange('season', e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                    disabled={loading}
                  >
                    {availableSeasons.map((season: string) => (
                      <option key={season} value={season}>{season.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Climate Controls */}
              <div className="border-t pt-4 mt-2">
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    id="liveWeather"
                    checked={useLiveWeather}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setUseLiveWeather(checked);
                      if (checked && coordinates) fetchLiveWeather();
                    }}
                    className="h-4 w-4"
                  />
                  <label htmlFor="liveWeather" className="text-sm text-gray-600">Use Live Weather Data</label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Rainfall (mm)</label>
                    <input
                      type="number"
                      value={rainfallOverride ?? ''}
                      disabled={useLiveWeather}
                      onChange={(e) => setRainfallOverride(e.target.value === '' ? null : Number(e.target.value))}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 transition-all"
                      placeholder="Auto from dataset"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Temperature (°C)</label>
                    <input
                      type="number"
                      value={temperatureOverride ?? ''}
                      disabled={useLiveWeather}
                      onChange={(e) => setTemperatureOverride(e.target.value === '' ? null : Number(e.target.value))}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 transition-all"
                      placeholder="Auto from dataset"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.district_uid || !formData.crop}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed flex items-center justify-center font-medium transition-all btn-animate"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Analyzing Farm...
                  </>
                ) : (
                  'Run Farm Analysis'
                )}
              </button>
            </form>
          )}
        </div>

        {/* RESULTS SECTION */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 flex flex-col items-center justify-center animate-fadeIn">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-gray-600 animate-pulse">Analyzing your farm data...</p>
          </div>
        ) : analysis ? (
          <>
            {/* FULL WIDTH PREDICTION CARD */}
            <div className="mb-8 animate-slideUp">
              <PredictionCard
                predicted_yield={analysis.prediction.predicted_yield}
                yield_range={analysis.prediction.yield_range}
                confidence={analysis.prediction.confidence}
                model_route={analysis.prediction.model_route}
              />
            </div>

            {/* Resilience Score - Full Width */}
            <div className="mb-8 animate-fadeIn">
              <ResilienceScore data={analysis.resilience} variant="detailed" />
            </div>

            {/* DYNAMIC CARDS - with staggered animation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {dynamicCards.slice(0, 6).map((card, index) => (
                <div 
                  key={card.id} 
                  className="bg-white rounded-xl shadow-lg p-6 card-hover transition-all"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    {card.icon}
                    <span className="ml-2">{card.title}</span>
                  </h3>
                  {card.content}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 flex flex-col items-center justify-center text-center animate-fadeIn">
            <Leaf className="h-16 w-16 text-gray-300 mb-4 animate-bounce" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Analysis Yet</h3>
            <p className="text-gray-500 text-sm">Enter farm details and click "Run Farm Analysis"</p>
          </div>
        )}
      </div>
    </div>
  );
}