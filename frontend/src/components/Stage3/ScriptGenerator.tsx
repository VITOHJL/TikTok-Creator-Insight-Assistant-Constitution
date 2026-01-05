import React, { useEffect, useState } from 'react';
import type { ScriptOutline, Hook, ContentPoint } from '../../types/session.js';
import ScriptCard from '../ScriptCard.js';
import Loading from '../Loading.js';
import ErrorMessage from '../ErrorMessage.js';
import HashtagCard from '../HashtagCard.js';
import MusicCard from '../MusicCard.js';
import * as sessionService from '../../services/session.js';
import type { HashtagSuggestion, MusicStyleSuggestion } from '../../services/api.js';

interface ScriptGeneratorProps {
  sessionId: string;
  userInput: string;
  selectedHook: Hook | null;
  contentOutline: ContentPoint[] | undefined;
  generatedScripts: ScriptOutline[] | undefined;
  onScriptsUpdated: (scripts: ScriptOutline[]) => void;
  onGoBack?: () => void;
}

const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({
  sessionId,
  userInput,
  selectedHook,
  contentOutline,
  generatedScripts,
  onScriptsUpdated,
  onGoBack,
}) => {
  const [scripts, setScripts] = useState<ScriptOutline[]>(generatedScripts || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refiningStyle, setRefiningStyle] = useState<string | null>(null);
  const [hashtags, setHashtags] = useState<HashtagSuggestion[] | null>(null);
  const [musicStyle, setMusicStyle] = useState<MusicStyleSuggestion | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);

  // Generate scripts on mount if not exists
  // Also regenerate if generatedScripts is cleared (when advancing from Stage 2 to Stage 3)
  useEffect(() => {
    if (!generatedScripts || generatedScripts.length === 0) {
      generateScripts();
    } else {
      setScripts(generatedScripts);
    }
  }, [sessionId, generatedScripts]); // Add generatedScripts as dependency to detect when it's cleared

  // Generate suggestions when scripts are generated
  useEffect(() => {
    if (scripts.length > 0 && !hashtags && !musicStyle && !isLoadingSuggestions) {
      generateSuggestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scripts.length]); // Only depend on scripts.length to avoid infinite loop

  const generateScripts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const generated = await sessionService.generateScripts(sessionId);
      setScripts(generated);
      onScriptsUpdated(generated);
    } catch (err: any) {
      setError(err.message || '生成脚本时发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefineScript = async (scriptStyle: 'story' | 'tutorial' | 'comparison') => {
    setRefiningStyle(scriptStyle);
    setError(null);
    try {
      const refinedScript = await sessionService.refineScript(sessionId, scriptStyle);
      const updatedScripts = scripts.map(s => s.style === scriptStyle ? refinedScript : s);
      setScripts(updatedScripts);
      onScriptsUpdated(updatedScripts);
    } catch (err: any) {
      setError(err.message || '优化脚本时发生错误');
    } finally {
      setRefiningStyle(null);
    }
  };

  const generateSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setSuggestionsError(null);
    try {
      const result = await sessionService.generateSuggestions(sessionId);
      setHashtags(result.hashtags);
      setMusicStyle(result.musicStyle);
      
      // Show warnings if there were partial failures (errors are already handled by backend with fallbacks)
      if (result.errors && (result.errors.hashtags || result.errors.music)) {
        console.warn('Some suggestions had errors, but fallback values were used', result.errors);
      }
    } catch (err: any) {
      setSuggestionsError(err.message || '生成建议时发生错误');
      // Use fallback values even on error
      setHashtags([
        { text: userInput.substring(0, 20) || '短视频' },
        { text: '创作' },
        { text: '内容' },
        { text: '分享' },
        { text: '推荐' },
      ]);
      setMusicStyle({
        style: '轻快节奏',
        mood: '适合内容展示',
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  if (isLoading && scripts.length === 0) {
    return <Loading message="正在生成脚本..." />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">阶段3：脚本转换</h2>
        <p className="text-sm sm:text-base text-gray-600">将内容转换为专业的短视频脚本</p>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">主题：{userInput}</p>
        {selectedHook && (
          <div className="mt-2 sm:mt-3 p-3 sm:p-4 bg-primary-pale border border-primary-light rounded-lg">
            <p className="text-xs sm:text-sm text-primary-dark">
              <strong>已选择的金句：</strong> {selectedHook.text}
            </p>
          </div>
        )}
        {contentOutline && contentOutline.length > 0 && (
          <div className="mt-2 sm:mt-3 p-3 sm:p-4 bg-primary-light bg-opacity-10 border border-primary-light rounded-lg">
            <p className="text-xs sm:text-sm text-primary-dark mb-1 sm:mb-2">
              <strong>内容大纲：</strong>
            </p>
            <ul className="text-xs sm:text-sm text-primary-dark space-y-1">
              {contentOutline.map((point, index) => (
                <li key={point.id}>
                  {index + 1}. {point.title || `要点 ${index + 1}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {error && (
        <ErrorMessage
          message={error}
          onRetry={generateScripts}
          onDismiss={() => setError(null)}
        />
      )}

      {scripts.length > 0 && (
        <>
          <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
            {onGoBack && (
              <button
                onClick={onGoBack}
                disabled={isLoading}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                ← 返回上一阶段
              </button>
            )}
            <button
              onClick={generateScripts}
              disabled={isLoading}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed sm:ml-auto text-sm sm:text-base"
              title="重新生成所有脚本"
            >
              {isLoading ? '生成中...' : '重新生成'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {scripts.map((script, index) => (
              <ScriptCard
                key={script.style}
                script={script}
                index={index}
                onRefine={() => handleRefineScript(script.style as 'story' | 'tutorial' | 'comparison')}
              />
            ))}
          </div>

          {/* Hashtags and Music Suggestions */}
          {isLoadingSuggestions && (
            <div className="mb-6">
              <Loading message="正在生成Hashtag和音乐建议..." />
            </div>
          )}

          {suggestionsError && (
            <div className="mb-6">
              <ErrorMessage
                message={suggestionsError}
                onRetry={generateSuggestions}
                onDismiss={() => setSuggestionsError(null)}
              />
            </div>
          )}

          {(hashtags || musicStyle) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {hashtags && hashtags.length > 0 && (
                <HashtagCard hashtags={hashtags} />
              )}
              {musicStyle && (
                <MusicCard musicStyle={musicStyle} />
              )}
            </div>
          )}

          {refiningStyle && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-4 sm:p-6 rounded-lg max-w-md w-full">
                <Loading message={`正在优化${refiningStyle === 'story' ? '故事叙述型' : refiningStyle === 'tutorial' ? '教程教学型' : '对比评测型'}脚本...`} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ScriptGenerator;

