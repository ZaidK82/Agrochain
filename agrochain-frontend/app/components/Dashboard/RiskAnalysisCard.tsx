'use client';

import { AlertTriangle, TrendingUp } from 'lucide-react';

interface RiskAnalysisCardProps {
  risk_summary: {
    risk_factor: string;
    severity_score: number;
  };
  key_risks: string[];
  yield_drivers: string[];
}

export default function RiskAnalysisCard({ 
  risk_summary, 
  key_risks, 
  yield_drivers 
}: RiskAnalysisCardProps) {
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
        Risk Analysis
      </h3>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Primary Risk Factor</p>
          <p className="font-semibold capitalize">{risk_summary.risk_factor}</p>
          <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 rounded-full"
              style={{ width: `${risk_summary.severity_score * 100}%` }}
            />
          </div>
        </div>
        
        {key_risks.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Key Risks</p>
            <ul className="space-y-1">
              {key_risks.map((risk, idx) => (
                <li key={idx} className="text-sm flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {yield_drivers.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <p className="text-sm text-gray-600 mb-2 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Yield Drivers
            </p>
            <ul className="space-y-1">
              {yield_drivers.slice(0, 3).map((driver, idx) => (
                <li key={idx} className="text-xs text-gray-600">
                  • {driver}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}