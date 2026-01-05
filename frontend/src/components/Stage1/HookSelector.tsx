import React, { useEffect, useState } from 'react';
import type { Hook } from '../../types/session.js';
import HookCard from './HookCard.js';
import Loading from '../Loading.js';
import ErrorMessage from '../ErrorMessage.js';
import * as sessionService from '../../services/session.js';

interface HookSelectorProps {
  sessionId: string;
  userInput: string;
  hooks?: Hook[];  // Cached hooks from session
  selectedHook: Hook | null;
  onHookSelected: (hook: Hook) => void;
  onContinue: () => void;
}

const HookSelector: React.FC<HookSelectorProps> = ({
  sessionId,
  userInput,
  hooks: cachedHooks,
  selectedHook,
  onHookSelected,
  onContinue,
}) => {
  const [hooks, setHooks] = useState<Hook[]>(cachedHooks || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refiningHookId, setRefiningHookId] = useState<string | null>(null);

  // Use cached hooks if available, otherwise generate new ones
  useEffect(() => {
    if (cachedHooks && cachedHooks.length > 0) {
      setHooks(cachedHooks);
    } else {
      generateHooks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]); // Only depend on sessionId, cachedHooks is initial value

  const generateHooks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const hooks = await sessionService.generateHooks(sessionId);
      setHooks(hooks);
    } catch (err: any) {
      setError(err.message || '生成金句时发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  const replaceHooks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const hooks = await sessionService.replaceHooks(sessionId);
      setHooks(hooks);
      // Hooks are automatically saved to session by backend API
    } catch (err: any) {
      setError(err.message || '替换金句时发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  const refineHook = async (hook: Hook) => {
    setRefiningHookId(hook.id);
    setError(null);
    try {
      const refinedHook = await sessionService.refineHook(sessionId, hook.id, hook.text);
      setHooks((prevHooks) =>
        prevHooks.map((h) => (h.id === hook.id ? refinedHook : h))
      );
    } catch (err: any) {
      setError(err.message || '优化金句时发生错误');
    } finally {
      setRefiningHookId(null);
    }
  };

  const editHook = async (hookId: string, newText: string) => {
    setHooks((prevHooks) =>
      prevHooks.map((h) => (h.id === hookId ? { ...h, text: newText } : h))
    );
  };

  const optimizeEditedHook = async (hook: Hook) => {
    setRefiningHookId(hook.id);
    setError(null);
    try {
      const refinedHook = await sessionService.refineHook(sessionId, hook.id, hook.text);
      setHooks((prevHooks) =>
        prevHooks.map((h) => (h.id === hook.id ? refinedHook : h))
      );
    } catch (err: any) {
      setError(err.message || '优化金句时发生错误');
    } finally {
      setRefiningHookId(null);
    }
  };

  const handleSelectHook = async (hook: Hook) => {
    try {
      // Always allow selecting a hook, even if it's already selected
      // This ensures that returning from Stage 2 to Stage 1 and clicking the same hook will work
      const updatedSession = await sessionService.selectHook(sessionId, hook);
      // Update local hooks list to reflect the selected state
      setHooks((prevHooks) =>
        prevHooks.map((h) => ({
          ...h,
          isSelected: h.id === hook.id,
        }))
      );
      onHookSelected(hook);
    } catch (err: any) {
      setError(err.message || '选择金句时发生错误');
    }
  };

  if (isLoading && hooks.length === 0) {
    return <Loading message="正在生成金句..." />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">阶段1：选择金句</h2>
        <p className="text-sm sm:text-base text-gray-600">为你的创作主题选择一个吸引人的金句</p>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">主题：{userInput}</p>
      </div>

      {error && (
        <ErrorMessage
          message={error}
          onRetry={generateHooks}
          onDismiss={() => setError(null)}
        />
      )}

      {hooks.length > 0 && (
        <>
          <div className="mb-4 flex justify-end">
            <button
              onClick={replaceHooks}
              disabled={isLoading}
              className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isLoading ? '生成中...' : '替换'}
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            {hooks.map((hook) => (
              <HookCard
                key={hook.id}
                hook={hook}
                isSelected={selectedHook?.id === hook.id}
                onSelect={() => handleSelectHook(hook)}
                onRefine={() => refineHook(hook)}
                onEdit={(newText) => editHook(hook.id, newText)}
                onOptimizeAfterEdit={(newText) => {
                  const updatedHook = { ...hook, text: newText };
                  optimizeEditedHook(updatedHook);
                }}
              />
            ))}
          </div>

          {selectedHook && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary-pale border border-primary-light rounded-lg">
              <p className="text-xs sm:text-sm text-primary-dark mb-2 sm:mb-3">
                <strong>已选择的金句：</strong> {selectedHook.text}
              </p>
              <button
                onClick={onContinue}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-primary-dark text-white rounded-md hover:bg-primary transition-colors font-medium text-sm sm:text-base"
              >
                这个金句不错，继续创作内容 →
              </button>
            </div>
          )}
        </>
      )}

      {refiningHookId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg max-w-md w-full">
            <Loading message="正在优化金句..." />
          </div>
        </div>
      )}
    </div>
  );
};

export default HookSelector;

