'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchMetadata, FarmAnalysisResponse } from '@/lib/api';
import { MetadataResponse } from '@/lib/types/metadata';

interface AppContextType {
  // Metadata
  metadata: MetadataResponse | null;
  metadataLoading: boolean;
  metadataError: string | null;
  
  // Analysis Data
  lastAnalysis: FarmAnalysisResponse | null;
  setLastAnalysis: (data: FarmAnalysisResponse | null) => void;
  
  // Disease Detection
  diseaseResult: any | null;
  setDiseaseResult: (data: any | null) => void;
  
  // Soil Analysis
  soilResult: any | null;
  setSoilResult: (data: any | null) => void;
  
  // Helper Functions
  refreshMetadata: () => Promise<void>;
  clearCache: () => void;
  getLastAnalysisRoot: () => {
    crop: string;
    predicted_yield: number;
    resilience_score: number;
    risk_level: string;
    resilience?: any;
    advisory?: any;
    risk_summary?: any;
    farm_summary?: string;
    trust_metadata?: any;
    recommended_crops?: any[];
  } | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// localStorage keys
const STORAGE_KEYS = {
  METADATA: 'agrochain_metadata',
  METADATA_TIMESTAMP: 'agrochain_metadata_timestamp',
  LAST_ANALYSIS: 'agrochain_last_analysis',
  DISEASE_RESULT: 'agrochain_disease_result',
  SOIL_RESULT: 'agrochain_soil_result',
};

// Cache duration: 1 hour
const CACHE_DURATION = 60 * 60 * 1000;

export function AppProvider({ children }: { children: ReactNode }) {
  // State
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysisState] = useState<FarmAnalysisResponse | null>(null);
  const [diseaseResult, setDiseaseResultState] = useState<any | null>(null);
  const [soilResult, setSoilResultState] = useState<any | null>(null);

  // ============================================
  // LOAD METADATA (with cache)
  // ============================================
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const cached = localStorage.getItem(STORAGE_KEYS.METADATA);
        const cachedTimestamp = localStorage.getItem(STORAGE_KEYS.METADATA_TIMESTAMP);
        
        if (cached && cachedTimestamp) {
          const age = Date.now() - parseInt(cachedTimestamp);
          if (age < CACHE_DURATION) {
            setMetadata(JSON.parse(cached));
            setMetadataLoading(false);
            return;
          }
        }
        
        const freshMetadata = await fetchMetadata();
        setMetadata(freshMetadata);
        localStorage.setItem(STORAGE_KEYS.METADATA, JSON.stringify(freshMetadata));
        localStorage.setItem(STORAGE_KEYS.METADATA_TIMESTAMP, Date.now().toString());
        setMetadataError(null);
      } catch (err) {
        console.error('Failed to load metadata:', err);
        setMetadataError('Failed to load crop data. Please refresh the page.');
        
        const cached = localStorage.getItem(STORAGE_KEYS.METADATA);
        if (cached) {
          setMetadata(JSON.parse(cached));
        }
      } finally {
        setMetadataLoading(false);
      }
    };
    
    loadMetadata();
  }, []);

  // ============================================
  // LOAD SAVED DATA FROM LOCALSTORAGE
  // ============================================
  useEffect(() => {
    // Load last analysis
    const savedAnalysis = localStorage.getItem(STORAGE_KEYS.LAST_ANALYSIS);
    if (savedAnalysis) {
      try {
        setLastAnalysisState(JSON.parse(savedAnalysis));
      } catch (e) {
        console.error('Failed to parse saved analysis:', e);
      }
    }
    
    // Load disease result
    const savedDisease = localStorage.getItem(STORAGE_KEYS.DISEASE_RESULT);
    if (savedDisease) {
      try {
        setDiseaseResultState(JSON.parse(savedDisease));
      } catch (e) {
        console.error('Failed to parse saved disease:', e);
      }
    }
    
    // Load soil result
    const savedSoil = localStorage.getItem(STORAGE_KEYS.SOIL_RESULT);
    if (savedSoil) {
      try {
        setSoilResultState(JSON.parse(savedSoil));
      } catch (e) {
        console.error('Failed to parse saved soil:', e);
      }
    }
  }, []);

  // ============================================
  // SETTERS WITH LOCALSTORAGE
  // ============================================
  const setLastAnalysis = (data: FarmAnalysisResponse | null) => {
    setLastAnalysisState(data);
    if (data) {
      localStorage.setItem(STORAGE_KEYS.LAST_ANALYSIS, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_KEYS.LAST_ANALYSIS);
    }
  };

  const setDiseaseResult = (data: any | null) => {
    setDiseaseResultState(data);
    if (data) {
      localStorage.setItem(STORAGE_KEYS.DISEASE_RESULT, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_KEYS.DISEASE_RESULT);
    }
  };

  const setSoilResult = (data: any | null) => {
    setSoilResultState(data);
    if (data) {
      localStorage.setItem(STORAGE_KEYS.SOIL_RESULT, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SOIL_RESULT);
    }
  };

  // ============================================
  // HELPER: EXTRACT ROOT DATA FROM ANALYSIS
  // ============================================
  const getLastAnalysisRoot = () => {
    if (!lastAnalysis) return null;
    
    // Extract crop from multiple possible locations
    let crop = null;
    if (lastAnalysis.crop) {
      crop = lastAnalysis.crop;
    } else if (lastAnalysis.best_crop) {
      crop = lastAnalysis.best_crop;
    } else if (lastAnalysis.recommended_crops && lastAnalysis.recommended_crops.length > 0) {
      crop = lastAnalysis.recommended_crops[0].crop;
    } else if (lastAnalysis.prediction?.crop) {
      crop = lastAnalysis.prediction.crop;
    }
    
    return {
      crop: crop || "N/A",
      predicted_yield: lastAnalysis.prediction?.predicted_yield || 0,
      resilience_score: lastAnalysis.resilience?.resilience_score || 0,
      risk_level: lastAnalysis.resilience?.risk_level || "N/A",
      // Full objects for chat
      resilience: lastAnalysis.resilience,
      advisory: lastAnalysis.advisory,
      risk_summary: lastAnalysis.risk_summary,
      farm_summary: lastAnalysis.farm_summary,
      trust_metadata: lastAnalysis.trust_metadata,
      recommended_crops: lastAnalysis.recommended_crops
    };
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  const refreshMetadata = async () => {
    setMetadataLoading(true);
    try {
      const freshMetadata = await fetchMetadata();
      setMetadata(freshMetadata);
      localStorage.setItem(STORAGE_KEYS.METADATA, JSON.stringify(freshMetadata));
      localStorage.setItem(STORAGE_KEYS.METADATA_TIMESTAMP, Date.now().toString());
      setMetadataError(null);
    } catch (err) {
      setMetadataError('Failed to refresh crop data');
    } finally {
      setMetadataLoading(false);
    }
  };

  const clearCache = () => {
    localStorage.removeItem(STORAGE_KEYS.METADATA);
    localStorage.removeItem(STORAGE_KEYS.METADATA_TIMESTAMP);
    localStorage.removeItem(STORAGE_KEYS.LAST_ANALYSIS);
    localStorage.removeItem(STORAGE_KEYS.DISEASE_RESULT);
    localStorage.removeItem(STORAGE_KEYS.SOIL_RESULT);
    setMetadata(null);
    setLastAnalysisState(null);
    setDiseaseResultState(null);
    setSoilResultState(null);
    window.location.reload();
  };

  // ============================================
  // PROVIDER
  // ============================================
  return (
    <AppContext.Provider value={{
      metadata,
      metadataLoading,
      metadataError,
      lastAnalysis,
      setLastAnalysis,
      diseaseResult,
      setDiseaseResult,
      soilResult,
      setSoilResult,
      refreshMetadata,
      clearCache,
      getLastAnalysisRoot,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}