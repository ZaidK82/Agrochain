'use client';

import { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

interface BlockchainStatusType {
  status: string;
  available: boolean;
  message?: string;
}

export default function BlockchainStatus() {
  const [status, setStatus] = useState<BlockchainStatusType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // ✅ CORRECT: Call backend API, not frontend route
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blockchain/status`);
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        console.error('Failed to fetch blockchain status:', error);
        setStatus({ status: 'ERROR', available: false, message: 'Connection failed' });
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100">
        <div className="animate-pulse w-2 h-2 rounded-full bg-gray-400"></div>
        <span className="text-xs text-gray-500">Checking...</span>
      </div>
    );
  }

  const isOnline = status?.status === 'ONLINE';
  const isOffline = status?.status === 'OFFLINE';
  
  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
      isOnline ? 'bg-green-100 text-green-700' :
      isOffline ? 'bg-yellow-100 text-yellow-700' :
      'bg-red-100 text-red-700'
    }`}>
      {isOnline ? (
        <>
          <ShieldCheck className="h-3 w-3" />
          <span>Blockchain Online</span>
        </>
      ) : isOffline ? (
        <>
          <ShieldAlert className="h-3 w-3" />
          <span>Offline Mode</span>
        </>
      ) : (
        <>
          <Shield className="h-3 w-3" />
          <span>Connection Error</span>
        </>
      )}
    </div>
  );
}