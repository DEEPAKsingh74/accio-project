'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useSessionStore } from '@/lib/stores/sessionStore';
import { LogOut, Plus, User, Settings } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuthStore();
  const { sessions, currentSession, createSession, selectSession, deleteSession } = useSessionStore();
  const [showSessionMenu, setShowSessionMenu] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');

  const handleCreateSession = async () => {
    if (newSessionName.trim()) {
      await createSession(newSessionName.trim());
      setNewSessionName('');
      setShowSessionMenu(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Accio</h1>
          <span className="text-sm text-gray-500">AI-Powered Micro-Frontend Playground</span>
        </div>

        {/* Session Management */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowSessionMenu(!showSessionMenu)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <span className="text-sm font-medium">
                {currentSession?.name || 'Select Session'}
              </span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showSessionMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      placeholder="New session name..."
                      className="flex-1 px-3 py-2 border text-black border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateSession()}
                    />
                    <button
                      onClick={handleCreateSession}
                      className="p-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {(sessions || []).map((session) => (
                    <div
                      key={session.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        currentSession?.id === session.id ? 'bg-primary-50' : ''
                      }`}
                      onClick={async () => {
                        await selectSession(session.id);
                        setShowSessionMenu(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{session.name}</h3>
                          <p className="text-xs text-gray-500">
                            {new Date(session.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 