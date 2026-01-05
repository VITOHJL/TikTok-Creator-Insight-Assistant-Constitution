import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CreationSession, Hook, ContentPoint, ScriptOutline } from '../types/session.js';
import * as sessionService from '../services/session.js';

interface SessionStore {
  // State
  sessionId: string | null;
  session: CreationSession | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  createSession: (userInput: string) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  goToStage: (stage: 1 | 2 | 3) => void;
  goBack: () => Promise<void>;
  updateSelectedHook: (hook: Hook | null) => void;
  updateContentOutline: (contentOutline: ContentPoint[]) => void;
  updateGeneratedScripts: (scripts: ScriptOutline[]) => void;
  clearSession: () => void;
  setError: (error: string | null) => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sessionId: null,
      session: null,
      isLoading: false,
      error: null,

      // Create a new session
      createSession: async (userInput: string) => {
        set({ isLoading: true, error: null });
        try {
          const session = await sessionService.createSession({ userInput });
          set({
            sessionId: session.id,
            session,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to create session',
          });
          throw error;
        }
      },

      // Load session by ID
      loadSession: async (sessionId: string) => {
        set({ isLoading: true, error: null });
        try {
          const session = await sessionService.getSession(sessionId);
          set({
            sessionId: session.id,
            session,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          // Handle 404: Session not found
          if (error.response?.status === 404 || error.message?.includes('not found')) {
            set({
              isLoading: false,
              error: '会话未找到，请创建新会话',
            });
            // Clear invalid sessionId
            set({ sessionId: null, session: null });
          } else {
            set({
              isLoading: false,
              error: error.message || 'Failed to load session',
            });
          }
          throw error;
        }
      },

      // Go to a specific stage
      goToStage: (stage: 1 | 2 | 3) => {
        const { session } = get();
        if (session) {
          set({
            session: {
              ...session,
              currentStage: stage,
              updatedAt: new Date().toISOString(),
            },
          });
        }
      },

      // Go back to previous stage
      goBack: async () => {
        const { sessionId } = get();
        if (!sessionId) {
          throw new Error('No active session');
        }

        set({ isLoading: true, error: null });
        try {
          const session = await sessionService.goBackStage(sessionId);
          set({
            session,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          // Handle 400: Invalid stage operation
          if (error.response?.status === 400 || error.message?.includes('无法返回')) {
            set({
              isLoading: false,
              error: error.message || '无法返回上一阶段：当前已在第一阶段',
            });
          } else {
            set({
              isLoading: false,
              error: error.message || 'Failed to go back stage',
            });
          }
          throw error;
        }
      },

      // Update selected hook
      updateSelectedHook: (hook: Hook | null) => {
        const { session } = get();
        if (session) {
          set({
            session: {
              ...session,
              selectedHook: hook,
              updatedAt: new Date().toISOString(),
            },
          });
        }
      },

      // Update content outline
      updateContentOutline: (contentOutline: ContentPoint[]) => {
        const { session } = get();
        if (session) {
          set({
            session: {
              ...session,
              contentOutline,
              updatedAt: new Date().toISOString(),
            },
          });
        }
      },

      // Update generated scripts
      updateGeneratedScripts: (scripts: ScriptOutline[]) => {
        const { session } = get();
        if (session) {
          set({
            session: {
              ...session,
              generatedScripts: scripts,
              updatedAt: new Date().toISOString(),
            },
          });
        }
      },

      // Clear session
      clearSession: () => {
        set({
          sessionId: null,
          session: null,
          isLoading: false,
          error: null,
        });
      },

      // Set error
      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'tiktok-creator-session', // localStorage key
      partialize: (state) => ({
        sessionId: state.sessionId,
        // Don't persist full session, we'll reload it on mount
      }),
    }
  )
);

