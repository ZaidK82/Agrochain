'use client';

import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DollarSign, Shield, TrendingUp, ArrowRight } from 'lucide-react';

export default function MarketplacePage() {
  const { getLastAnalysisRoot, lastAnalysis } = useApp();
  const [loanEligible, setLoanEligible] = useState(false);
  const [insuranceEligible, setInsuranceEligible] = useState(false);
  const [recommendedCrops, setRecommendedCrops] = useState<any[]>([]);

  useEffect(() => {
    const rootData = getLastAnalysisRoot();
    if (rootData) {
      // Loan eligibility based on resilience score
      setLoanEligible(rootData.resilience_score < 50);
      setInsuranceEligible(rootData.risk_level === 'High');
      
      if (lastAnalysis?.recommended_crops) {
        setRecommendedCrops(lastAnalysis.recommended_crops.slice(0, 3));
      }
    }
  }, [lastAnalysis, getLastAnalysisRoot]);

  const handleApplyLoan = async () => {
    // In real implementation, call /loan/apply endpoint
    alert('Loan application submitted. A representative will contact you.');
  };

  const handleApplyInsurance = async () => {
    alert('Insurance inquiry submitted. A representative will contact you.');
  };

  if (!lastAnalysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Farm Analysis Found</h2>
          <p className="text-gray-600 mb-4">Please run a farm analysis first to see marketplace options.</p>
          <a href="/yield-prediction" className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg">
            Go to Farm Analysis
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Marketplace</h1>
        <p className="text-gray-600 mb-8">Financial products and services for your farm</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Loan Card */}
          <div className={`bg-white rounded-xl shadow-lg p-6 ${loanEligible ? 'border-l-4 border-green-500' : 'opacity-75'}`}>
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-green-600" />
              {loanEligible && (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                  Recommended
                </span>
              )}
            </div>
            <h2 className="text-xl font-semibold mb-2">Agricultural Loans</h2>
            <p className="text-gray-600 text-sm mb-4">
              Low-interest loans for farm equipment, seeds, and fertilizers.
            </p>
            {loanEligible ? (
              <>
                <p className="text-sm text-green-600 mb-4">
                  ✓ Your resilience score qualifies you for special loan programs.
                </p>
                <button
                  onClick={handleApplyLoan}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  Apply Now
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                Your farm shows good resilience. Keep up the good work!
              </p>
            )}
          </div>
          
          {/* Insurance Card */}
          <div className={`bg-white rounded-xl shadow-lg p-6 ${insuranceEligible ? 'border-l-4 border-yellow-500' : 'opacity-75'}`}>
            <div className="flex items-center justify-between mb-4">
              <Shield className="h-8 w-8 text-yellow-600" />
              {insuranceEligible && (
                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                  Recommended
                </span>
              )}
            </div>
            <h2 className="text-xl font-semibold mb-2">Crop Insurance</h2>
            <p className="text-gray-600 text-sm mb-4">
              Protect your yield against weather risks and crop failure.
            </p>
            {insuranceEligible ? (
              <>
                <p className="text-sm text-yellow-600 mb-4">
                  ⚠️ Your risk level suggests insurance is recommended.
                </p>
                <button
                  onClick={handleApplyInsurance}
                  className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700"
                >
                  Get Quote
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                Your risk level is low. Insurance optional.
              </p>
            )}
          </div>
        </div>
        
        {/* Recommended Crops */}
        {recommendedCrops.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              Recommended Crops
            </h2>
            <div className="space-y-3">
              {recommendedCrops.map((crop, idx) => (
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
            <div className="mt-4 pt-4 border-t">
              <a href="/yield-prediction" className="text-sm text-green-600 hover:text-green-700 flex items-center">
                Run new analysis for more recommendations
                <ArrowRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}