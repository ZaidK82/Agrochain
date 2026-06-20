'use client';

interface YieldPredictionCardProps {
  predicted_yield: number;
  yield_range: [number, number];
  confidence: string;
  model_route: string;
  risk_level: string;
}

export default function YieldPredictionCard({ 
  predicted_yield, 
  yield_range, 
  confidence, 
  model_route,
  risk_level 
}: YieldPredictionCardProps) {
  
  const getRiskColor = (level: string) => {
    if (level === 'High') return 'text-green-600 bg-green-50';
    if (level === 'Moderate') return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold">Yield Prediction</h2>
          <p className="text-gray-500 text-sm">{model_route} Model</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(risk_level)}`}>
          {risk_level} Risk
        </div>
      </div>
      
      <div className="text-5xl font-bold text-gray-800 mb-2">
        {predicted_yield.toLocaleString()} <span className="text-xl text-gray-500">kg/ha</span>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg mt-4">
        <h4 className="font-semibold mb-2 text-sm">Expected Yield Range</h4>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-700">{yield_range[0].toFixed(0)}</div>
            <div className="text-xs text-gray-600">Min</div>
          </div>
          <div className="flex-1 mx-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-green-500 w-full" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">{yield_range[1].toFixed(0)}</div>
            <div className="text-xs text-gray-600">Max</div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-gray-600">Confidence</span>
        <span className="font-semibold">{confidence}</span>
      </div>
    </div>
  );
}