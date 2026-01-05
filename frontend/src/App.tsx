import { useEffect } from 'react';
import Input from './components/Input';
import StageIndicator from './components/StageIndicator';
import HookSelector from './components/Stage1/HookSelector';
import ContentEditor from './components/Stage2/ContentEditor';
import ScriptGenerator from './components/Stage3/ScriptGenerator';
import { useSessionStore } from './stores/useSessionStore';
import * as sessionService from './services/session.js';
import type { Hook } from './types/session.js';
import type { ContentPoint, ScriptOutline } from './types/session.js';

function App() {
  const {
    sessionId,
    session,
    isLoading,
    error,
    createSession,
    loadSession,
    updateSelectedHook,
    updateContentOutline,
    updateGeneratedScripts,
    goBack,
    clearSession,
    setError,
  } = useSessionStore();

  // Load session from persisted sessionId on mount
  useEffect(() => {
    // Zustand persist automatically restores sessionId from localStorage
    // We just need to load the full session if sessionId exists
    if (sessionId && !session && !isLoading) {
      loadSession(sessionId).catch((err: any) => {
        // Handle 404: Session not found
        if (err.response?.status === 404 || err.message?.includes('not found')) {
          setError('会话未找到，请创建新会话');
          clearSession();
        } else {
          setError(err.message || '加载会话失败');
        }
      });
    }
  }, [sessionId, session, isLoading, loadSession, clearSession, setError]); // Only run when sessionId changes and session is not loaded

  const handleSubmit = async (userInput: string) => {
    try {
      await createSession(userInput);
    } catch (err: any) {
      setError(err.message || '创建会话失败');
    }
  };

  const handleHookSelected = (hook: Hook) => {
    if (sessionId) {
      updateSelectedHook(hook);
    }
  };

  const handleContinueFromStage1 = async () => {
    // If we have a selectedHook, we need to call select-hook API again
    // to ensure currentStage is updated to 2 (especially when returning from Stage 2)
    if (sessionId && session?.selectedHook) {
      try {
        // Re-select the hook to advance to Stage 2
        await sessionService.selectHook(sessionId, session.selectedHook);
        // Update store with the new session state
        await loadSession(sessionId);
      } catch (err: any) {
        setError(err.message || '进入内容创作阶段失败');
      }
    } else if (sessionId) {
      // Fallback: just load session
      try {
        await loadSession(sessionId);
      } catch (err: any) {
        setError(err.message || '加载会话失败');
      }
    }
  };

  const handleContentUpdated = (contentOutline: ContentPoint[]) => {
    updateContentOutline(contentOutline);
  };

  const handleScriptsUpdated = (scripts: ScriptOutline[]) => {
    updateGeneratedScripts(scripts);
  };

  const handleContinueFromStage2 = async () => {
    // Content confirmation is already saved via confirm-content API
    // Load updated session to get stage 3 state
    if (sessionId) {
      try {
        await loadSession(sessionId);
      } catch (err: any) {
        setError(err.message || '加载会话失败');
      }
    }
  };

  const handleGoBack = async () => {
    if (sessionId) {
      try {
        await goBack();
      } catch (err: any) {
        setError(err.message || '回退失败');
      }
    }
  };

  const handleNewCreation = () => {
    clearSession();
  };

  // Show input if no session
  if (!session && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* 上半部分：黄金比例 38.2% - 浅蓝色背景 */}
        <div className="h-[38.2vh] bg-blue-300 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-5xl font-bold text-blue-900 mb-2">
              TikTok Creator Insight Assistant
            </h1>
            <p className="text-primary-dark/80 mb-2">
              制定您的专属视频脚本
            </p>
          </div>
        </div>
        
        {/* 下半部分：黄金比例 61.8% - 白色背景 */}
        <div className="flex-1 bg-white flex items-center justify-center">
          <div className="w-full max-w-2xl px-4">
            <Input onSubmit={handleSubmit} isLoading={isLoading} />
            
            {error && (
              <div className="mt-4">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                  <button
                    onClick={() => setError(null)}
                    className="ml-4 text-red-500 hover:text-red-700 underline"
                  >
                    关闭
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show loading if creating/loading session
  if (isLoading && !session) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* 上半部分：黄金比例 38.2% - 浅蓝色背景 */}
        <div className="h-[38.2vh] min-h-[200px] sm:min-h-[250px] bg-primary-pale"></div>
        
        {/* 下半部分：黄金比例 61.8% - 白色背景 */}
        <div className="flex-1 bg-white flex items-center justify-center">
          <div className="text-center px-4">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600">正在初始化...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show three-stage flow if session exists
  if (session) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* 上半部分：黄金比例 38.2% - 浅蓝色背景 */}
        <div className="h-[38.2vh] min-h-[200px] sm:min-h-[250px] bg-primary-pale">
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 h-full flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-dark mb-1 sm:mb-2">
                  TikTok Creator Insight Assistant
                </h1>
                <p className="text-xs sm:text-sm text-primary-dark/80">三阶段协作式创作流程</p>
              </div>
              <button
                onClick={handleNewCreation}
                className="px-3 sm:px-4 py-2 bg-white text-primary-dark rounded-md hover:bg-primary-light hover:text-white transition-colors shadow-md text-sm sm:text-base self-start sm:self-auto"
              >
                新建创作
              </button>
            </div>
            
            <div className="mt-4 sm:mt-auto">
              <StageIndicator currentStage={session.currentStage} />
            </div>
          </div>
        </div>
        
        {/* 下半部分：黄金比例 61.8% - 白色背景 */}
        <div className="flex-1 bg-white overflow-y-auto">
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">

          {error && (
            <div className="mb-4 max-w-4xl mx-auto">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
                <button
                  onClick={() => setError(null)}
                  className="ml-4 text-red-500 hover:text-red-700 underline"
                >
                  关闭
                </button>
              </div>
            </div>
          )}

          {/* Stage 1: Hook Selection */}
          {session.currentStage === 1 && (
            <HookSelector
              sessionId={session.id}
              userInput={session.userInput}
              hooks={session.hooks}
              selectedHook={session.selectedHook || null}
              onHookSelected={handleHookSelected}
              onContinue={handleContinueFromStage1}
            />
          )}

          {/* Stage 2: Content Development */}
          {session.currentStage === 2 && (
            <ContentEditor
              sessionId={session.id}
              userInput={session.userInput}
              selectedHook={session.selectedHook || null}
              contentOutline={session.contentOutline}
              onContentUpdated={handleContentUpdated}
              onContinue={handleContinueFromStage2}
              onGoBack={handleGoBack}
            />
          )}

          {/* Stage 3: Script Conversion */}
          {session.currentStage === 3 && (
            <ScriptGenerator
              sessionId={session.id}
              userInput={session.userInput}
              selectedHook={session.selectedHook || null}
              contentOutline={session.contentOutline}
              generatedScripts={session.generatedScripts}
              onScriptsUpdated={handleScriptsUpdated}
              onGoBack={handleGoBack}
            />
          )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
