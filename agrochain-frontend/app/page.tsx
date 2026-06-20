'use client';

import Link from 'next/link';
import { useApp } from './context/AppContext';
import { 
  Leaf, Camera, MessageCircle, Store, QrCode, Shield, 
  TrendingUp, Activity, Droplets, BarChart3, CheckCircle,
  Sparkles, Clock, Database, ArrowRight
} from 'lucide-react';

export default function HomePage() {
  const { getLastAnalysisRoot } = useApp();
  const rootData = getLastAnalysisRoot();

  const modules = [
    { 
      name: 'Farm Analysis', 
      href: '/yield-prediction', 
      icon: Leaf, 
      color: 'bg-gradient-to-br from-green-500 to-green-700',
      description: 'AI-powered yield prediction, risk assessment, and personalized advisory for your farm.',
      features: ['Yield Prediction', 'Resilience Score', 'Risk Analysis', 'Advisory']
    },
    { 
      name: 'Disease Detection', 
      href: '/disease', 
      icon: Camera, 
      color: 'bg-gradient-to-br from-blue-500 to-blue-700',
      description: 'Upload leaf images for instant disease diagnosis with treatment recommendations.',
      features: ['Disease Identification', 'Severity Assessment', 'Treatment Plans', 'Spread Risk']
    },
    // { 
    //   name: 'Soil Analysis', 
    //   href: '/soil', 
    //   icon: Droplets, 
    //   color: 'bg-gradient-to-br from-amber-600 to-amber-800',
    //   description: 'Analyze soil health, fertility, and structure from images or data.',
    //   features: ['Soil Type Classification', 'pH Level', 'Nutrient Analysis', 'Health Score']
    // },  // ← COMMENTED OUT - SOIL MODULE REMOVED
    { 
      name: 'AI Advisor', 
      href: '/chat', 
      icon: MessageCircle, 
      color: 'bg-gradient-to-br from-purple-500 to-purple-700',
      description: 'Ask questions about your farm and get intelligent, context-aware advice.',
      features: ['24/7 Availability', 'Context-Aware', 'RAG Knowledge', 'Follow-up Support']
    },
    { 
      name: 'Marketplace', 
      href: '/market', 
      icon: Store, 
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-700',
      description: 'Access loans, insurance, and financial services tailored to your farm.',
      features: ['Loan Eligibility', 'Crop Insurance', 'Financial Tools', 'Expert Connect']
    },
    { 
      name: 'Blockchain Traceability', 
      href: '/traceability', 
      icon: QrCode, 
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-700',
      description: 'Verify advisory authenticity and track supply chain on blockchain.',
      features: ['Advisory Verification', 'Immutable Records', 'QR Codes', 'Supply Chain']
    }
  ];

  const stats = [
    { label: 'Crops Supported', value: '61', icon: Leaf, color: 'text-green-600' },
    { label: 'Districts Covered', value: '662', icon: BarChart3, color: 'text-blue-600' },
    { label: 'Years of Data', value: '2001-23', icon: Database, color: 'text-purple-600' },
    { label: 'Blockchain Verified', value: '100%', icon: Shield, color: 'text-indigo-600' },
  ];

  return (
    <div className="min-h-screen page-transition">
      {/* HERO SECTION - Full Width */}
      <div className="w-full bg-gradient-to-br from-green-50 via-white to-green-50 border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center animate-slideDown">
            <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-6 animate-bounce">
              <Leaf className="h-12 w-12 text-green-600" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4 animate-fadeIn">
              AgroChain
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-slideUp">
              AI-Powered Agricultural Intelligence with Blockchain Verification
            </p>
            <p className="text-md text-gray-500 max-w-2xl mx-auto mt-4 animate-fadeIn">
              Empowering farmers with accurate predictions, disease detection, 
              and blockchain-verified advisory for sustainable agriculture.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-8 animate-fadeIn">
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm text-gray-700">AI Models Active</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-full">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-700">Blockchain Online</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-full">
                <Sparkles className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-700">24/7 AI Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATS SECTION - Full Width */}
      <div className="w-full bg-white/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center card-hover">
                <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODULES SECTION - Full Width */}
      <div className="w-full py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-slideUp">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive agricultural intelligence tools powered by cutting-edge AI and blockchain technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {modules.map((module, index) => (
              <Link key={module.name} href={module.href} className="group">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden card-hover h-full transition-all duration-300">
                  <div className={`${module.color} p-4`}>
                    <module.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                      {module.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {module.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {module.features.map((feature, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center text-green-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                      <span>Learn More</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* LAST ANALYSIS SECTION - Full Width */}
      {rootData && (
        <div className="w-full bg-gradient-to-r from-green-50 to-blue-50 border-y border-green-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6 animate-slideInLeft">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Your Last Analysis</h2>
                <p className="text-gray-600">View your most recent farm analysis results</p>
              </div>
              <Link 
                href="/yield-prediction" 
                className="flex items-center text-green-600 hover:text-green-700 transition-colors"
              >
                Run New Analysis
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 card-hover animate-slideInRight">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-3">
                  <p className="text-xs text-gray-500 mb-1">Crop</p>
                  <p className="text-xl font-semibold text-gray-800">{rootData.crop}</p>
                </div>
                <div className="text-center p-3">
                  <p className="text-xs text-gray-500 mb-1">Predicted Yield</p>
                  <p className="text-xl font-semibold text-green-600">{rootData.predicted_yield.toLocaleString()} kg/ha</p>
                </div>
                <div className="text-center p-3">
                  <p className="text-xs text-gray-500 mb-1">Resilience Score</p>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${rootData.resilience_score}%` }}
                      />
                    </div>
                    <span className="text-xl font-semibold text-gray-800">{rootData.resilience_score}%</span>
                  </div>
                </div>
                <div className="text-center p-3">
                  <p className="text-xs text-gray-500 mb-1">Risk Level</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    rootData.risk_level === 'High' ? 'bg-green-100 text-green-700' :
                    rootData.risk_level === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {rootData.risk_level}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CALL TO ACTION SECTION - Full Width */}
      <div className="w-full bg-gradient-to-r from-green-600 to-green-700 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4 animate-fadeIn">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-green-100 mb-8 animate-slideUp">
            Start with a comprehensive farm analysis and get AI-powered insights for better yields
          </p>
          <Link 
            href="/yield-prediction" 
            className="inline-flex items-center bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all hover:scale-105 animate-bounce"
          >
            Get Started Now
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}