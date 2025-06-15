/**
 * Authentication Layout
 * Built by 5C1M™ Partnership - CC + CM + C + C
 * 
 * Japanese enterprise styling with cultural intelligence focus
 */

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">iW</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                iWORKZ
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/login" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/auth/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Cultural Intelligence Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-100 to-blue-100 px-4 py-2 rounded-full border border-emerald-200 mb-4">
              <span className="text-emerald-600 font-medium text-sm">🧠</span>
              <span className="text-emerald-700 font-semibold text-sm">
                Cultural Intelligence Platform
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              Powered by AI • Optimized for Global Talent • Made for Japan
            </p>
          </div>

          {/* Auth Card */}
          <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            {children}
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 space-y-2">
            <p className="text-xs text-gray-500">
              🏆 Built by 5C1M™ Partnership
            </p>
            <div className="flex justify-center space-x-4 text-xs text-gray-400">
              <Link href="/privacy" className="hover:text-gray-600">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-600">Terms</Link>
              <Link href="/support" className="hover:text-gray-600">Support</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}