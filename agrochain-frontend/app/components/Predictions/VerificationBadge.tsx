'use client';

import { useState } from 'react';
import { CheckCircle, AlertCircle, Loader2, ExternalLink, Shield, ShieldCheck, ShieldAlert, Copy, Check } from 'lucide-react';
import { verifyAdvisory } from '@/lib/api';

interface VerificationBadgeProps {
  advisoryId?: string;
  contentHash?: string;
  blockchainStatus?: string;
  mock?: boolean;
  verificationStatus?: string;
  compact?: boolean;
  tx_hash?: string;
  block?: number;
  version?: number;
}

export default function VerificationBadge({ 
  advisoryId, 
  contentHash, 
  blockchainStatus,
  mock,
  verificationStatus,
  compact = false,
  tx_hash,
  block,
  version
}: VerificationBadgeProps) {
  const [verifying, setVerifying] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showFullAdvisoryId, setShowFullAdvisoryId] = useState(false);
  const [showFullContentHash, setShowFullContentHash] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    version?: number;
    status?: string;
    message?: string;
  } | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleVerify = async () => {
    if (!advisoryId || !contentHash) return;
    
    setVerifying(true);
    try {
      const result = await verifyAdvisory(advisoryId, contentHash);
      setVerificationResult(result);
    } catch (error) {
      console.error("Verification failed:", error);
      setVerificationResult({ verified: false, message: "Verification failed" });
    } finally {
      setVerifying(false);
    }
  };

  // Determine badge color and icon
  const isOnline = blockchainStatus === "stored_onchain";
  const isOffline = blockchainStatus === "stored_offline" || mock === true;
  
  let badgeColor = "bg-gray-100 text-gray-600";
  let Icon = Shield;
  let statusText = "Unknown";
  
  if (isOnline) {
    badgeColor = "bg-green-100 text-green-700";
    Icon = ShieldCheck;
    statusText = "Blockchain Verified";
  } else if (isOffline) {
    badgeColor = "bg-yellow-100 text-yellow-700";
    Icon = ShieldAlert;
    statusText = "Offline Storage";
  }
  
  if (compact) {
    return (
      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
        <Icon className="h-3 w-3" />
        <span>{statusText}</span>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 animate-slideInRight">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Shield className="h-5 w-5 text-purple-600 mr-2" />
          Blockchain Verification
        </h3>
        <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${badgeColor}`}>
          <Icon className="h-4 w-4" />
          <span>{statusText}</span>
        </div>
      </div>
      
      {/* Advisory ID - FULL VERSION */}
      {advisoryId && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500 font-medium">Advisory ID (Unique Fingerprint)</p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFullAdvisoryId(!showFullAdvisoryId)}
                className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
              >
                {showFullAdvisoryId ? 'Show Less' : 'Show Full'}
              </button>
              <button
                onClick={() => copyToClipboard(advisoryId, 'advisory')}
                className="text-gray-400 hover:text-gray-600 transition-all hover:scale-110"
                title="Copy Advisory ID"
              >
                {copiedField === 'advisory' ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs font-mono break-all text-gray-800">
            {showFullAdvisoryId ? advisoryId : `${advisoryId.substring(0, 50)}...`}
          </p>
        </div>
      )}
      
      {/* Content Hash - FULL VERSION */}
      {contentHash && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500 font-medium">Content Hash (Integrity Proof)</p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFullContentHash(!showFullContentHash)}
                className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
              >
                {showFullContentHash ? 'Show Less' : 'Show Full'}
              </button>
              <button
                onClick={() => copyToClipboard(contentHash, 'hash')}
                className="text-gray-400 hover:text-gray-600 transition-all hover:scale-110"
                title="Copy Content Hash"
              >
                {copiedField === 'hash' ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs font-mono break-all text-gray-600">
            {showFullContentHash ? contentHash : `${contentHash.substring(0, 50)}...`}
          </p>
        </div>
      )}
      
      {/* Blockchain Transaction Info */}
      {(tx_hash || block || version) && (
        <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-100">
          <p className="text-xs font-semibold text-green-700 mb-2">Blockchain Record</p>
          {tx_hash && (
            <div className="mb-2">
              <p className="text-xs text-gray-500">Transaction Hash</p>
              <p className="text-xs font-mono break-all text-gray-700">{tx_hash}</p>
            </div>
          )}
          <div className="flex gap-4">
            {block && (
              <div>
                <p className="text-xs text-gray-500">Block Number</p>
                <p className="text-sm font-semibold text-gray-800">{block}</p>
              </div>
            )}
            {version && (
              <div>
                <p className="text-xs text-gray-500">Version</p>
                <p className="text-sm font-semibold text-gray-800">v{version}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Verification Status Badge */}
      {verificationStatus && (
        <div className="mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
            verificationStatus === 'verified_onchain' 
              ? 'bg-green-100 text-green-700' 
              : verificationStatus === 'offline_storage'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {verificationStatus === 'verified_onchain' ? '✓ Verified on Blockchain' : 
             verificationStatus === 'offline_storage' ? '📝 Stored Locally (Offline Mode)' : 
             '⚠️ Verification Pending'}
          </span>
        </div>
      )}
      
      {/* Info Box */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-700 font-medium mb-1">🔐 What is this?</p>
        <p className="text-xs text-blue-600">
          The <strong>Advisory ID</strong> is your advisory's unique fingerprint. 
          The <strong>Content Hash</strong> proves the advisory hasn't been altered. 
          Use these on the <strong>Traceability</strong> page to verify on blockchain.
        </p>
      </div>
      
      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={verifying || !advisoryId || !contentHash}
        className="w-full mt-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all btn-animate flex items-center justify-center space-x-2"
      >
        {verifying ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verifying on Blockchain...</span>
          </>
        ) : (
          <>
            <ExternalLink className="h-4 w-4" />
            <span>Verify on Blockchain</span>
          </>
        )}
      </button>
      
      {/* Verification Result */}
      {verificationResult && (
        <div className={`mt-3 p-3 rounded-lg text-sm ${
          verificationResult.verified ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {verificationResult.verified ? (
            <>
              <CheckCircle className="h-4 w-4 inline mr-1" />
              ✓ Verified on blockchain
              {verificationResult.version && <span> (Version {verificationResult.version})</span>}
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 inline mr-1" />
              {verificationResult.message || 'Advisory not found on blockchain'}
            </>
          )}
        </div>
      )}
      
      {/* Offline Mode Message */}
      {isOffline && (
        <p className="mt-3 text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
          ⚠️ Running in offline mode. Advisory is stored locally. 
          When blockchain is connected, advisories will be automatically verified on-chain.
        </p>
      )}
    </div>
  );
}