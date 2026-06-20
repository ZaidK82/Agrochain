'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface ResilienceContextType {
  prediction: any;
  setPrediction: (prediction: any) => void;
  clearPrediction: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ResilienceContext = createContext<ResilienceContextType | undefined>(undefined);

const STORAGE_KEY = 'agrochain_last_analysis';

export function ResilienceProvider({ children }: { children: ReactNode }) {
  const [prediction, setPredictionState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setPredictionState(parsed);
        console.log('[Context] Loaded saved analysis from storage');
      } catch (e) {
        console.error('[Context] Failed to load saved data', e);
      }
    }
  }, []);

  // Save data whenever it changes
  const setPrediction = (data: any) => {
    setPredictionState(data);
    if (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('[Context] Saved analysis to storage');
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const clearPrediction = () => {
    setPredictionState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ResilienceContext.Provider value={{ 
      prediction, 
      setPrediction, 
      clearPrediction,
      isLoading,
      setIsLoading
    }}>
      {children}
    </ResilienceContext.Provider>
  );
}

export const useResilience = () => {
  const context = useContext(ResilienceContext);
  if (context === undefined) {
    throw new Error('useResilience must be used within a ResilienceProvider');
  }
  return context;
};