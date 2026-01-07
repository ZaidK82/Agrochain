// src/app/recommendation/page.tsx
'use client'

import { useState } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import StepIndicator from '@/components/forms/StepIndicator'
import LocationStep from '@/components/forms/LocationStep'
import SoilStep from '@/components/forms/SoilStep'
import SeasonStep from '@/components/forms/SeasonStep'
import ResultsStep from '@/components/forms/ResultsStep'

const steps = [
  { id: 1, name: 'Location' },
  { id: 2, name: 'Soil' },
  { id: 3, name: 'Season' },
  { id: 4, name: 'Results' },
]

export default function RecommendationPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    location: { district: '', village: '' },
    soil: { type: '', ph: 0, organicCarbon: 0, irrigation: 'rainfed' },
    season: '',
  })
  
  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }
  
  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }
  
  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <StepIndicator steps={steps} currentStep={currentStep} />
      
      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {currentStep === 1 && (
          <LocationStep
            data={formData.location}
            onChange={(data) => setFormData({...formData, location: data})}
          />
        )}
        
        {currentStep === 2 && (
          <SoilStep
            data={formData.soil}
            onChange={(data) => setFormData({...formData, soil: data})}
          />
        )}
        
        {currentStep === 3 && (
          <SeasonStep
            selected={formData.season}
            onSelect={(season) => setFormData({...formData, season})}
          />
        )}
        
        {currentStep === 4 && (
          <ResultsStep formData={formData} />
        )}
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          className={`px-6 py-3 rounded-lg flex items-center gap-2 ${
            currentStep === 1 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        
        {currentStep < 4 ? (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Continue
          </button>
        ) : (
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            Select Crop
          </button>
        )}
      </div>
    </div>
  )
}