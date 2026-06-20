'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Leaf, Camera, Store, MessageCircle, QrCode } from 'lucide-react';
import BlockchainStatus from './BlockchainStatus';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Farm Analysis', href: '/yield-prediction', icon: Leaf },
  { name: 'Disease', href: '/disease', icon: Camera },
  // { name: 'Soil', href: '/soil', icon: Leaf },  // ← COMMENTED OUT - SOIL MODULE REMOVED
  { name: 'Marketplace', href: '/market', icon: Store },
  { name: 'AI Advisor', href: '/chat', icon: MessageCircle },
  { name: 'Traceability', href: '/traceability', icon: QrCode },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 w-full animate-slideDown">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0 hover-lift transition-all">
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="font-bold text-xl text-gray-800">AgroChain</span>
          </Link>
          
          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-4">
            <BlockchainStatus />
            <div className="flex space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover-scale text-sm ${
                      isActive 
                        ? 'bg-green-50 text-green-700' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-all"
          >
            <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t animate-slideDown">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-green-50 text-green-700' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <div className="px-4 pt-2">
                <BlockchainStatus />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}