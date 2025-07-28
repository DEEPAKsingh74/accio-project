import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface GeneratedCode {
  jsx: string;
  css: string;
  timestamp: string;
}

export interface Session {
  id: string;
  name: string;
  messages: ChatMessage[];
  generatedCode: GeneratedCode | null;
  createdAt: string;
  updatedAt: string;
}

interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadSessions: () => Promise<void>;
  createSession: (name: string) => Promise<void>;
  selectSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => Promise<void>;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>;
  updateGeneratedCode: (code: Omit<GeneratedCode, 'timestamp'>) => Promise<void>;
  clearError: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSession: null,
      isLoading: false,
      error: null,

      loadSessions: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get('/api/sessions');
          const sessions = response.data.sessions || [];
          
          // Ensure all sessions have proper message arrays
          const sessionsWithMessages = sessions.map((session: any) => ({
            ...session,
            messages: session.messages || [],
            generatedCode: session.generatedCode || null
          }));
          
          set({
            sessions: sessionsWithMessages,
            currentSession: sessionsWithMessages.length > 0 ? sessionsWithMessages[0] : null,
            isLoading: false,
          });
        } catch (error: any) {
          console.error('Load sessions error:', error);
          set({
            error: error.response?.data?.message || 'Failed to load sessions',
            isLoading: false,
            sessions: [], // Ensure sessions is always an array
          });
        }
      },

      createSession: async (name: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post('/api/sessions', { name });
          const newSession = response.data.session;
          
          // Ensure the new session has proper message arrays
          const sessionWithMessages = {
            ...newSession,
            messages: newSession.messages || [],
            generatedCode: newSession.generatedCode || null
          };
          
          set((state) => ({
            sessions: [sessionWithMessages, ...(state.sessions || [])],
            currentSession: sessionWithMessages,
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('Create session error:', error);
          set({
            error: error.response?.data?.message || 'Failed to create session',
            isLoading: false,
          });
        }
      },

      selectSession: async (sessionId: string) => {
        const { sessions } = get();
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
          // Load the full session data from the backend
          try {
            const response = await axios.get(`/api/sessions/${sessionId}`);
            const fullSession = response.data.session;
            set({ currentSession: fullSession });
          } catch (error: any) {
            console.error('Error loading session:', error);
            // Fallback to the session from the list
            set({ currentSession: session });
          }
        }
      },

      deleteSession: async (sessionId: string) => {
        set({ isLoading: true, error: null });
        try {
          await axios.delete(`/api/sessions/${sessionId}`);
          
          set((state) => {
            const updatedSessions = state.sessions.filter(s => s.id !== sessionId);
            const newCurrentSession = state.currentSession?.id === sessionId 
              ? (updatedSessions[0] || null)
              : state.currentSession;
            
            return {
              sessions: updatedSessions,
              currentSession: newCurrentSession,
              isLoading: false,
            };
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to delete session',
            isLoading: false,
          });
        }
      },

      addMessage: async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const newMessage: ChatMessage = {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        };

        try {
          const response = await axios.post(`/api/sessions/${currentSession.id}/messages`, {
            content: message.content,
            role: message.role,
          });

          set((state) => ({
            sessions: (state.sessions || []).map(s =>
              s.id === currentSession.id
                ? { ...s, messages: [...(s.messages || []), newMessage] }
                : s
            ),
            currentSession: {
              ...currentSession,
              messages: [...(currentSession.messages || []), newMessage],
            },
          }));
        } catch (error: any) {
          console.error('Add message error:', error);
          set({
            error: error.response?.data?.message || 'Failed to add message',
          });
        }
      },

      updateGeneratedCode: async (code: Omit<GeneratedCode, 'timestamp'>) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const newCode: GeneratedCode = {
          ...code,
          timestamp: new Date().toISOString(),
        };

        try {
          await axios.put(`/api/sessions/${currentSession.id}/code`, {
            jsx: code.jsx,
            css: code.css,
          });

          set((state) => ({
            sessions: (state.sessions || []).map(s =>
              s.id === currentSession.id
                ? { ...s, generatedCode: newCode }
                : s
            ),
            currentSession: {
              ...currentSession,
              generatedCode: newCode,
            },
          }));
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to update code',
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      // Refresh current session data
      refreshCurrentSession: async () => {
        const { currentSession } = get();
        if (!currentSession?.id) return;

        try {
          const response = await axios.get(`/api/sessions/${currentSession.id}`);
          const updatedSession = response.data.session;
          set({ currentSession: updatedSession });
        } catch (error: any) {
          console.error('Error refreshing session:', error);
        }
      },
    }),
    {
      name: 'session-storage',
      partialize: (state) => ({
        sessions: state.sessions,
        currentSession: state.currentSession,
      }),
      onRehydrateStorage: () => (state) => {
        // Rehydrate auth headers when store is loaded
        // Note: Token is handled in authStore
      },
    }
  )
); 