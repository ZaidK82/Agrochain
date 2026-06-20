'use client';

import { Lightbulb, CheckCircle } from 'lucide-react';

interface AdvisoryActionsCardProps {
  recommended_actions: string[];
  monitoring_advice: string[];
}

export default function AdvisoryActionsCard({ 
  recommended_actions, 
  monitoring_advice 
}: AdvisoryActionsCardProps) {
  
  return (
    <div className="space-y-6">
      {recommended_actions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
            Recommended Actions
          </h3>
          <ul className="space-y-2">
            {recommended_actions.map((action, idx) => (
              <li key={idx} className="text-sm flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {monitoring_advice.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-md font-semibold text-blue-800 mb-2">Monitoring Advice</h3>
          <ul className="space-y-1">
            {monitoring_advice.map((advice, idx) => (
              <li key={idx} className="text-sm text-blue-700 flex items-start">
                <span className="mr-2">📊</span>
                {advice}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}