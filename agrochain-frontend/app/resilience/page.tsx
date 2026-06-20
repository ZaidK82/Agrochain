'use client';

import { useResilience } from '../context/ResilienceContext';
import ResilienceScore from '../components/Resilience/ResilienceScore';
import Link from 'next/link';

export default function ResiliencePage() {
  const { prediction } = useResilience();

  if (!prediction || !prediction.resilience) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Resilience Analysis</h1>
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <svg 
              className="w-24 h-24 mx-auto mb-6 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
              />
            </svg>
            <h2 className="text-xl font-semibold mb-2">No Resilience Data Available</h2>
            <p className="text-gray-600 mb-6">
              Run a yield prediction first to see detailed resilience analysis.
            </p>
            <Link 
              href="/yield-prediction" 
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              Go to Yield Prediction
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/yield-prediction" 
          className="text-green-600 hover:text-green-700 font-medium inline-flex items-center"
        >
          ← Back to Yield Prediction
        </Link>
      </div>

      <ResilienceScore data={prediction.resilience} variant="detailed" />

      {/* Additional detailed analytics can go here */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            {prediction.resilience.risk_level === "High" ? (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Maintain current soil management practices
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Consider water harvesting for dry spells
                </li>
              </>
            ) : prediction.resilience.risk_level === "Moderate" ? (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  Improve irrigation efficiency
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500">•</span>
                  Add organic matter to soil
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">!</span>
                  Urgent: Improve soil health
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">!</span>
                  Consider drought-resistant varieties
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Farm Summary</h3>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between">
              <span className="text-gray-600">Crop:</span>
              <span className="font-medium">{prediction.crop}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Predicted Yield:</span>
              <span className="font-medium">{prediction.predicted_yield.toLocaleString()} kg/ha</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-600">Confidence:</span>
              <span className="font-medium">{prediction.confidence_label}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}