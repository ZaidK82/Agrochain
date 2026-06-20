'use client';

import { useState, useRef, useEffect } from 'react';
import { useResilience } from '../context/ResilienceContext';
import { useApp } from '../context/AppContext';
import { Send, Bot, User, Loader2, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  verificationStatus?: string;
}

export default function ChatPage() {
  const { prediction } = useResilience();
  const { getLastAnalysisRoot, lastAnalysis } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get complete analysis data for chat
  const getCompleteAnalysisData = () => {
    // First priority: current prediction from ResilienceContext
    if (prediction) {
      console.log("[DEBUG] Using prediction from ResilienceContext");
      return {
        crop: prediction.crop || prediction.best_crop || (prediction.recommended_crops?.[0]?.crop) || "N/A",
        predicted_yield: prediction.predicted_yield || prediction.prediction?.predicted_yield || 0,
        resilience_score: prediction.resilience?.resilience_score || 0,
        risk_level: prediction.resilience?.risk_level || "N/A",
        resilience: prediction.resilience,
        advisory: prediction.advisory,
        risk_summary: prediction.risk_summary,
        farm_summary: prediction.farm_summary,
        trust_metadata: prediction.trust_metadata,
        recommended_crops: prediction.recommended_crops
      };
    }
    
    // Second priority: persisted data from AppContext
    const persistedRoot = getLastAnalysisRoot();
    if (persistedRoot && lastAnalysis) {
      console.log("[DEBUG] Using persisted data from AppContext");
      return {
        crop: persistedRoot.crop,
        predicted_yield: persistedRoot.predicted_yield,
        resilience_score: persistedRoot.resilience_score,
        risk_level: persistedRoot.risk_level,
        resilience: persistedRoot.resilience || lastAnalysis.resilience,
        advisory: persistedRoot.advisory || lastAnalysis.advisory,
        risk_summary: persistedRoot.risk_summary || lastAnalysis.risk_summary,
        farm_summary: persistedRoot.farm_summary || lastAnalysis.farm_summary,
        trust_metadata: persistedRoot.trust_metadata || lastAnalysis.trust_metadata,
        recommended_crops: persistedRoot.recommended_crops || lastAnalysis.recommended_crops
      };
    }
    
    return null;
  };

  const analysisData = getCompleteAnalysisData();

  // Initialize chat with farm context
  useEffect(() => {
    if (analysisData && messages.length === 0) {
      const verificationStatus = analysisData.trust_metadata?.verification_status || 'offline_storage';
      const statusText = verificationStatus === 'verified_onchain' 
        ? '✓ This advisory is blockchain verified' 
        : '⚠️ This advisory is locally stored (blockchain offline)';
      
      const welcomeMessage = `Hello! I'm your AI farming advisor. I've analyzed your farm data:

**Crop:** ${analysisData.crop}
**Predicted Yield:** ${analysisData.predicted_yield?.toLocaleString() || 'N/A'} kg/ha
**Resilience Score:** ${analysisData.resilience_score || 'N/A'}%
**Risk Level:** ${analysisData.risk_level || 'N/A'}

${statusText}

What would you like to know about your farm?`;
      
      setMessages([{
        id: '1',
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date(),
        verificationStatus: verificationStatus
      }]);
    }
  }, [analysisData, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build complete farm context for backend
      const farmContext = analysisData ? {
        crop: analysisData.crop,
        predicted_yield: analysisData.predicted_yield,
        resilience: analysisData.resilience,
        advisory: analysisData.advisory,
        risk_summary: analysisData.risk_summary,
        farm_summary: analysisData.farm_summary,
        recommended_crops: analysisData.recommended_crops,
        trust_metadata: analysisData.trust_metadata
      } : null;

      console.log("[DEBUG] Sending farm context:", JSON.stringify(farmContext, null, 2));

      const requestBody = {
        question: input,
        session_id: sessionId,
        farm_analysis: farmContext
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      console.log("[DEBUG] Chat response:", data);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
        verificationStatus: analysisData?.trust_metadata?.verification_status || 'offline_storage'
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to the AI service. Please check your connection and try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getVerificationIcon = (status?: string) => {
    if (status === 'verified_onchain') return <ShieldCheck className="h-3 w-3 text-green-500" />;
    if (status === 'offline_storage') return <ShieldAlert className="h-3 w-3 text-yellow-500" />;
    return <Shield className="h-3 w-3 text-gray-400" />;
  };

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Farm Data Available</h2>
          <p className="text-gray-600 mb-4">
            Please run a farm analysis first so I can provide personalized advice.
          </p>
          <a href="/yield-prediction" className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            Go to Farm Analysis
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-t-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bot className="h-8 w-8" />
                <div>
                  <h1 className="text-xl font-semibold">AI Farming Advisor</h1>
                  <p className="text-green-100 text-sm">Context-aware agricultural intelligence</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm bg-green-500/30 px-3 py-1 rounded-full">
                {getVerificationIcon(analysisData?.trust_metadata?.verification_status)}
                <span>
                  {analysisData?.trust_metadata?.verification_status === 'verified_onchain' 
                    ? 'Blockchain Verified' 
                    : 'Offline Mode'}
                </span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white h-[500px] overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-green-600" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  {message.verificationStatus && message.role === 'assistant' && (
                    <div className="flex items-center space-x-1 mt-2 text-xs opacity-70">
                      {getVerificationIcon(message.verificationStatus)}
                      <span>
                        {message.verificationStatus === 'verified_onchain' 
                          ? 'Blockchain verified' 
                          : 'Local advisory'}
                      </span>
                    </div>
                  )}
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-green-600" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="bg-white rounded-b-xl border-t p-4">
            <div className="flex space-x-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
                placeholder="Ask about your farm... (e.g., 'Why is my yield low?', 'How can I improve soil health?')"
                className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={2}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Try: "What are the main risks for my farm?" or "How can I improve my resilience score?"
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}