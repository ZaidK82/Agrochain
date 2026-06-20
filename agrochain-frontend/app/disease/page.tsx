'use client';

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Upload, Loader2, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

export default function DiseaseDetectionPage() {
  const { setDiseaseResult, diseaseResult } = useApp();
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

  const handleDetect = async () => {
    if (!image) return;
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', image);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/disease-detect`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Detection failed');
      
      const data = await response.json();
      setDiseaseResult(data); // Save to AppContext for chat to use
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'mild') return 'bg-green-100 text-green-700';
    if (severity === 'moderate') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Disease Detection</h1>
          <p className="text-gray-600 mb-8">Upload a photo of affected leaves for AI-powered diagnosis</p>
          
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {preview ? (
                <div className="space-y-4">
                  <img src={preview} alt="Leaf preview" className="max-h-64 mx-auto rounded-lg" />
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
                  <Camera className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <span className="text-gray-500">Click to upload leaf image</span>
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
                onClick={handleDetect}
                disabled={loading}
                className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Analyzing...
                  </span>
                ) : (
                  'Detect Disease'
                )}
              </button>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </div>
          
          {diseaseResult && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Detection Results</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Disease</span>
                  <span className="capitalize font-semibold">{diseaseResult.disease}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Confidence</span>
                  <span>{(diseaseResult.confidence * 100).toFixed(1)}%</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Severity</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(diseaseResult.severity)}`}>
                    {diseaseResult.severity.toUpperCase()}
                  </span>
                </div>
                
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
                    Recommended Action
                  </h3>
                  <p className="text-sm text-gray-700">{diseaseResult.action}</p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                    Treatment
                  </h3>
                  <p className="text-sm text-gray-700">{diseaseResult.treatment}</p>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Spread Risk</span>
                  <span className={`font-medium ${diseaseResult.spread_risk === 'high' ? 'text-red-600' : diseaseResult.spread_risk === 'moderate' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {diseaseResult.spread_risk.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  💡 Tip: Go to <a href="/chat" className="text-green-600">AI Advisor</a> to ask about treatment plans.
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