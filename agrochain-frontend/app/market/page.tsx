'use client';

import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DollarSign, Shield, TrendingUp, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

export default function MarketplacePage() {
  const { getLastAnalysisRoot, lastAnalysis } = useApp();
  const [loanStatus, setLoanStatus] = useState<any>(null);
  const [insuranceStatus, setInsuranceStatus] = useState<any>(null);
  const [loading, setLoading] = useState({ loan: false, insurance: false });
  const [applied, setApplied] = useState({ loan: false, insurance: false });
  
  const rootData = getLastAnalysisRoot();
  
  // Calculate loan eligibility from resilience score
  const isLoanEligible = rootData?.resilience_score ? rootData.resilience_score < 50 : false;
  const loanAmount = rootData?.predicted_yield ? Math.round(rootData.predicted_yield * 10) : 50000;
  
  // Calculate insurance need from risk level
  const needInsurance = rootData?.risk_level === 'High' || rootData?.risk_level === 'Moderate';
  const premiumRate = rootData?.risk_level === 'High' ? 0.08 : rootData?.risk_level === 'Moderate' ? 0.05 : 0.03;
  const estimatedPremium = rootData?.predicted_yield ? Math.round(rootData.predicted_yield * premiumRate) : 1000;
  
  // Handle loan application
  const handleApplyLoan = async () => {
    if (!lastAnalysis) return;
    
    setLoading(prev => ({ ...prev, loan: true }));
    
    try {
      // Call your existing loan endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/loan/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmer_id: 'demo_farmer_001', // You'll get this from auth later
          batch_id: lastAnalysis.trust_metadata?.advisory_id || 'unknown',
          requested_amount: loanAmount,
          crop_name: rootData?.crop,
          predicted_yield: rootData?.predicted_yield,
          resilience_score: rootData?.resilience_score
        })
      });
      
      const data = await response.json();
      setLoanStatus(data);
      setApplied(prev => ({ ...prev, loan: true }));
      
    } catch (error) {
      console.error('Loan application failed:', error);
      setLoanStatus({ status: 'ERROR', message: 'Application failed. Please try again.' });
    } finally {
      setLoading(prev => ({ ...prev, loan: false }));
    }
  };
  
  // Handle insurance application
  const handleApplyInsurance = async () => {
    if (!lastAnalysis) return;
    
    setLoading(prev => ({ ...prev, insurance: true }));
    
    try {
      // Call your existing insurance endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/insurance/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmer_id: 'demo_farmer_001',
          batch_id: lastAnalysis.trust_metadata?.advisory_id || 'unknown',
          crop_name: rootData?.crop,
          insured_amount: loanAmount * 2,
          risk_level: rootData?.risk_level,
          premium: estimatedPremium
        })
      });
      
      const data = await response.json();
      setInsuranceStatus(data);
      setApplied(prev => ({ ...prev, insurance: true }));
      
    } catch (error) {
      console.error('Insurance application failed:', error);
      setInsuranceStatus({ status: 'ERROR', message: 'Application failed. Please try again.' });
    } finally {
      setLoading(prev => ({ ...prev, insurance: false }));
    }
  };
  
  if (!lastAnalysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Farm Analysis Found</h2>
          <p className="text-gray-600 mb-4">Run a farm analysis first to see personalized recommendations.</p>
          <a href="/yield-prediction" className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg">
            Analyze Farm
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
          
          {/* LOAN CARD */}
          <div className={`bg-white rounded-xl shadow-lg p-6 ${isLoanEligible ? 'border-l-4 border-green-500' : 'opacity-75'}`}>
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-green-600" />
              {isLoanEligible && (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                  Recommended
                </span>
              )}
            </div>
            <h2 className="text-xl font-semibold mb-2">Agricultural Loans</h2>
            <p className="text-gray-600 text-sm mb-4">Low-interest loans for farm equipment, seeds, and fertilizers.</p>
            
            {isLoanEligible ? (
              <>
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Estimated Eligibility</span>
                    <span className="font-semibold text-green-600">₹{loanAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Interest Rate</span>
                    <span className="font-semibold">8.5% p.a.</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Tenure</span>
                    <span className="font-semibold">12-36 months</span>
                  </div>
                </div>
                
                {applied.loan ? (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-green-700">
                        {loanStatus?.status === 'PENDING' 
                          ? 'Application submitted! We\'ll contact you within 24 hours.'
                          : 'Application received. Check status in your dashboard.'}
                      </span>
                    </div>
                    {loanStatus?.loan_id && (
                      <p className="text-xs text-gray-500 mt-2">Loan ID: {loanStatus.loan_id}</p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleApplyLoan}
                    disabled={loading.loan}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {loading.loan ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Apply Now</span>
                    )}
                  </button>
                )}
              </>
            ) : (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  Your resilience score is {rootData?.resilience_score}%. 
                  Keep up the good work! You're not eligible yet, but maintain good practices to qualify.
                </p>
              </div>
            )}
          </div>
          
          {/* INSURANCE CARD */}
          <div className={`bg-white rounded-xl shadow-lg p-6 ${needInsurance ? 'border-l-4 border-yellow-500' : 'opacity-75'}`}>
            <div className="flex items-center justify-between mb-4">
              <Shield className="h-8 w-8 text-yellow-600" />
              {needInsurance && (
                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                  Recommended
                </span>
              )}
            </div>
            <h2 className="text-xl font-semibold mb-2">Crop Insurance</h2>
            <p className="text-gray-600 text-sm mb-4">Protect your yield against weather risks and crop failure.</p>
            
            {needInsurance ? (
              <>
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Coverage Amount</span>
                    <span className="font-semibold text-green-600">₹{(loanAmount * 2).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estimated Premium</span>
                    <span className="font-semibold">₹{estimatedPremium.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Risk Level</span>
                    <span className={`font-semibold ${rootData?.risk_level === 'High' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {rootData?.risk_level}
                    </span>
                  </div>
                </div>
                
                {applied.insurance ? (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-green-700">
                        {insuranceStatus?.status === 'ACTIVE' 
                          ? 'Policy active! Your crop is now protected.'
                          : 'Insurance inquiry submitted. A representative will contact you.'}
                      </span>
                    </div>
                    {insuranceStatus?.policy_id && (
                      <p className="text-xs text-gray-500 mt-2">Policy ID: {insuranceStatus.policy_id}</p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleApplyInsurance}
                    disabled={loading.insurance}
                    className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {loading.insurance ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Get Quote</span>
                    )}
                  </button>
                )}
              </>
            ) : (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  Your risk level is {rootData?.risk_level}. Insurance is optional but recommended for peace of mind.
                </p>
                <button
                  onClick={handleApplyInsurance}
                  disabled={loading.insurance}
                  className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading.insurance ? 'Processing...' : 'Explore Options'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* RECOMMENDED CROPS - FROM YOUR EXISTING ML MODEL */}
        {lastAnalysis.recommended_crops && lastAnalysis.recommended_crops.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              AI-Recommended Crops
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Based on your farm's soil, climate, and historical data
            </p>
            <div className="space-y-3">
              {lastAnalysis.recommended_crops.slice(0, 3).map((crop, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{crop.crop}</p>
                    <p className="text-xs text-gray-500">
                      Resilience Score: {crop.resilience?.toFixed(0) || 'N/A'}%
                    </p>
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
        
        {/* INFO BOX */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">💡 How it works</h3>
          <p className="text-sm text-blue-700">
            Loan eligibility is calculated from your farm's resilience score. 
            Insurance recommendations are based on your risk level.
            All crop recommendations come from our AI models trained on 20+ years of agricultural data.
          </p>
        </div>
      </div>
    </div>
  );
}