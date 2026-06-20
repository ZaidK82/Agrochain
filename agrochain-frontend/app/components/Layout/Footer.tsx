'use client';

import Link from 'next/link';
import { Leaf, Linkedin, Mail, Shield, Heart, ExternalLink, FileText } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto animate-fadeIn">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Leaf className="h-6 w-6 text-green-600" />
              <span className="font-bold text-lg text-gray-800">AgroChain</span>
            </div>
            <p className="text-sm text-gray-500">
              AI-Powered Agricultural Intelligence with Blockchain Verification
            </p>
            <div className="flex space-x-3 pt-2">
              <a 
                href="https://linkedin.com/in/zaid-khan-854458318" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-600 transition-all duration-200 hover:scale-110"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="mailto:zaidkhan226@nhitm.ac.in" 
                className="text-gray-400 hover:text-green-600 transition-all duration-200 hover:scale-110"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/yield-prediction" className="text-sm text-gray-500 hover:text-green-600 transition-all duration-200 hover-lift">
                  Farm Analysis
                </Link>
              </li>
              <li>
                <Link href="/disease" className="text-sm text-gray-500 hover:text-green-600 transition-all duration-200 hover-lift">
                  Disease Detection
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-sm text-gray-500 hover:text-green-600 transition-all duration-200 hover-lift">
                  AI Advisor
                </Link>
              </li>
              <li>
                <Link href="/traceability" className="text-sm text-gray-500 hover:text-green-600 transition-all duration-200 hover-lift">
                  Blockchain Traceability
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources - Only Research Paper */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/documents/lnsc(matri crc).pdf" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-green-600 transition-all duration-200 hover-lift flex items-center"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Research Paper
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>

          {/* System Status & Trust */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm text-gray-600">Blockchain Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">Cryptographically Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-600">Powered by AI & Blockchain</span>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  All advisories are hashed and stored on blockchain for immutable verification.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <p className="text-xs text-gray-400">
              © {currentYear} AgroChain. All rights reserved.
            </p>
            <div className="flex space-x-6 text-xs text-gray-400">
              <a href="#" className="hover:text-green-600 transition-all duration-200 hover-lift">Privacy Policy</a>
              <a href="#" className="hover:text-green-600 transition-all duration-200 hover-lift">Terms of Service</a>
              <a href="#" className="hover:text-green-600 transition-all duration-200 hover-lift">Contact Us</a>
            </div>
            <p className="text-xs text-gray-400 flex items-center">
              <Shield className="h-3 w-3 mr-1" />
              Blockchain Verified Advisories
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}