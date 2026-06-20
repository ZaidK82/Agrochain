'use client';

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Droplets, Upload, Loader2, Activity, ArrowRight, Thermometer, Beaker } from 'lucide-react';

export default function SoilAnalysisPage() {
  const { setSoilResult, soilResult } = useApp();
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', image);
    
    try {
      // Call soil CV endpoint (you need to create this)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/soil-analyze`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Analysis failed');
      
      const data = await response.json();
      setSoilResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (value: number, good: number, bad: number) => {
    if (value >= good) return 'text-green-600';
    if (value >= bad) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Soil Health Analysis</h1>
          <p className="text-gray-600 mb-8">Upload a soil image for AI-powered fertility and structure analysis</p>
          
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {preview ? (
                <div className="space-y-4">
                  <img src={preview} alt="Soil preview" className="max-h-64 mx-auto rounded-lg" />
                  <button
                    onClick={() => {
                      setPreview(null);
                      setImage(null);
                    }}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Remove image
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Droplets className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <span className="text-gray-500">Click to upload soil image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            
            {preview && (
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Analyzing Soil...
                  </span>
                ) : (
                  'Analyze Soil Health'
                )}
              </button>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </div>
          
          {soilResult && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Soil Analysis Results</h2>
              
              <div className="space-y-4">
                {/* pH Level */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium flex items-center">
                      <Beaker className="h-4 w-4 mr-1 text-blue-500" />
                      pH Level
                    </span>
                    <span className={`font-semibold ${getHealthColor(soilResult.ph, 6.5, 5.5)}`}>
                      {soilResult.ph?.toFixed(1)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 rounded-full h-2" 
                      style={{ width: `${(soilResult.ph / 14) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {soilResult.ph > 7.5 ? 'Alkaline soil' : soilResult.ph < 6 ? 'Acidic soil' : 'Optimal range'}
                  </p>
                </div>
                
                {/* Organic Carbon */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium flex items-center">
                      <Activity className="h-4 w-4 mr-1 text-green-500" />
                      Organic Carbon
                    </span>
                    <span className={`font-semibold ${getHealthColor(soilResult.organic_carbon, 0.75, 0.5)}`}>
                      {soilResult.organic_carbon?.toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 rounded-full h-2" 
                      style={{ width: `${(soilResult.organic_carbon / 2) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {soilResult.organic_carbon > 0.75 ? 'Good fertility' : soilResult.organic_carbon > 0.5 ? 'Moderate fertility' : 'Low fertility'}
                  </p>
                </div>
                
                {/* Clay Content */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium flex items-center">
                      <Droplets className="h-4 w-4 mr-1 text-brown-500" />
                      Clay Content
                    </span>
                    <span className={`font-semibold ${getHealthColor(soilResult.clay_pct, 30, 20)}`}>
                      {soilResult.clay_pct?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 rounded-full h-2" 
                      style={{ width: `${soilResult.clay_pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {soilResult.clay_pct > 40 ? 'High clay - poor drainage' : soilResult.clay_pct > 20 ? 'Ideal' : 'Sandy - low water retention'}
                  </p>
                </div>
                
                {/* Soil Structure Index */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Soil Structure Index</span>
                    <span className={`font-semibold ${getHealthColor(soilResult.structure_index, 3, 2)}`}>
                      {soilResult.structure_index?.toFixed(1)}/5
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 rounded-full h-2" 
                      style={{ width: `${(soilResult.structure_index / 5) * 100}%` }}
                    />
                  </div>
                </div>
                
                {/* Overall Health Score */}
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Soil Health Score</h3>
                  <div className="text-3xl font-bold text-green-600">
                    {soilResult.health_score?.toFixed(0) || '—'}/100
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {soilResult.health_score > 70 ? 'Good soil health. Maintain current practices.' :
                     soilResult.health_score > 50 ? 'Moderate soil health. Consider organic amendments.' :
                     'Poor soil health. Immediate intervention recommended.'}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  💡 Tip: Go to <a href="/chat" className="text-green-600">AI Advisor</a> to ask about soil improvement strategies.
                </p>
                <a href="/chat" className="text-green-600 text-sm flex items-center">
                  Ask AI <ArrowRight className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}