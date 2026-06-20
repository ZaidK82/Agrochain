'use client';

import { useState } from 'react';
import { Shield, Search, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

interface VerificationResult {
  verified: boolean;
  exists?: boolean;
  version?: number;
  status?: string;
  issued_at?: number;
  expires_at?: number;
  source?: string;
  expert?: string;
  message?: string;
}

export default function TraceabilityPage() {
  const [advisoryId, setAdvisoryId] = useState('');
  const [contentHash, setContentHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisoryId.trim() || !contentHash.trim()) return;

    setVerifying(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blockchain/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          advisory_id: advisoryId.trim(), 
          content_hash: contentHash.trim() 
        }),
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Shield className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Advisory Verification</h1>
            <p className="text-gray-600">
              Verify the authenticity of any AgroChain advisory using its unique ID and content hash
            </p>
          </div>

          {/* Verification Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Advisory ID</label>
                <input
                  type="text"
                  value={advisoryId}
                  onChange={(e) => setAdvisoryId(e.target.value)}
                  placeholder="64-character hexadecimal advisory ID"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Found in your farm analysis response</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content Hash</label>
                <input
                  type="text"
                  value={contentHash}
                  onChange={(e) => setContentHash(e.target.value)}
                  placeholder="64-character hexadecimal content hash"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 font-mono text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={verifying || !advisoryId || !contentHash}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {verifying ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    <span>Verify Advisory</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <div className="flex items-center space-x-2 text-red-700">
                <XCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Verification Result */}
          {result && (
            <div className={`rounded-xl shadow-lg p-6 ${
              result.verified ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                {result.verified ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
                <div>
                  <h2 className="text-xl font-semibold">
                    {result.verified ? 'Verified ✓' : 'Verification Failed ✗'}
                  </h2>
                  <p className="text-sm text-gray-600">{result.message || 
                    (result.verified ? 'Advisory exists on blockchain' : 'Advisory not found or tampered')}
                  </p>
                </div>
              </div>

              {result.exists !== false && (
                <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
                  {result.version !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Version</span>
                      <span className="font-mono text-sm">v{result.version}</span>
                    </div>
                  )}
                  
                  {result.status && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className={`text-sm font-medium ${
                        result.status === 'Active' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.status}
                      </span>
                    </div>
                  )}
                  
                  {result.issued_at && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Issued At</span>
                      <span className="text-sm">{new Date(result.issued_at * 1000).toLocaleString()}</span>
                    </div>
                  )}
                  
                  {result.expires_at && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Expires At</span>
                      <span className="text-sm">{new Date(result.expires_at * 1000).toLocaleString()}</span>
                    </div>
                  )}
                  
                  {result.source && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Source Address</span>
                      <span className="font-mono text-xs">{result.source}</span>
                    </div>
                  )}
                </div>
              )}

              {!result.verified && result.exists === false && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    This advisory ID was not found on the blockchain. It may have been stored in offline mode or the ID is incorrect.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">How to find your advisory ID?</h3>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Run a farm analysis on the Predict page</li>
              <li>Scroll to the "Blockchain Verification" section</li>
              <li>Copy the Advisory ID and Content Hash</li>
              <li>Paste them here to verify</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}