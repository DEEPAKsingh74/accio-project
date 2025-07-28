'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { useSessionStore } from '@/lib/stores/sessionStore';
import ChatInterface from '@/components/ChatInterface';
import CodePreview from '@/components/CodePreview';
import CodeTabs from '@/components/CodeTabs';
import Header from '@/components/Header';
import LoginModal from '@/components/LoginModal';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const { currentSession, loadSessions } = useSessionStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSessions().catch(error => {
        console.error('Failed to load sessions:', error);
      });
    }
  }, [isAuthenticated, loadSessions]);



  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <LoginModal />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        {/* Left Panel - Chat Interface */}
        <div className="w-1/3 border-r border-gray-200 bg-white">
          <ChatInterface />
        </div>
        
        {/* Center - Preview */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
            <CodePreview />
          </div>
          
          {/* Bottom Panel - Code Tabs */}
          <div className="h-1/3 border-t border-gray-200 bg-gray-50">
            <CodeTabs />
          </div>
        </div>
      </div>
    </div>
  );
} 