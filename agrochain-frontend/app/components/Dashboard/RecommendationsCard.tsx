'use client';

interface CropRecommendation {
  crop: string;
  yield: number;
  resilience: number;
  score: number;
}

interface RecommendationsCardProps {
  recommended_crops: CropRecommendation[];
}

export default function RecommendationsCard({ recommended_crops }: RecommendationsCardProps) {
  
  if (!recommended_crops || recommended_crops.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-3">Alternative Crop Recommendations</h3>
      <div className="space-y-3">
        {recommended_crops.slice(0, 3).map((crop, idx) => (
          <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold">{crop.crop}</p>
              <p className="text-xs text-gray-500">Resilience Score: {crop.resilience?.toFixed(0) || 'N/A'}%</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">{crop.yield?.toLocaleString()} kg/ha</p>
              <p className="text-xs text-gray-500">Match: {(crop.score * 100).toFixed(0)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}