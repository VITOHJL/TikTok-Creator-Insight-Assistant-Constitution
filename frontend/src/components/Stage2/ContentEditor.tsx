import React, { useEffect, useState } from 'react';
import type { ContentPoint, Hook } from '../../types/session.js';
import ContentPointCard from './ContentPointCard.js';
import Loading from '../Loading.js';
import ErrorMessage from '../ErrorMessage.js';
import * as sessionService from '../../services/session.js';

interface ContentEditorProps {
  sessionId: string;
  userInput: string;
  selectedHook: Hook | null;
  contentOutline: ContentPoint[] | undefined;
  onContentUpdated: (contentOutline: ContentPoint[]) => void;
  onContinue: () => void;
  onGoBack?: () => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  sessionId,
  userInput,
  selectedHook,
  contentOutline,
  onContentUpdated,
  onContinue,
  onGoBack,
}) => {
  const [contentPoints, setContentPoints] = useState<ContentPoint[]>(contentOutline || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandingPointId, setExpandingPointId] = useState<string | null>(null);

  // Generate content on mount if not exists
  // Also regenerate if contentOutline is cleared (when advancing from Stage 1 to Stage 2)
  useEffect(() => {
    if (!contentOutline || contentOutline.length === 0) {
      generateContent();
    } else {
      setContentPoints(contentOutline);
    }
  }, [sessionId, contentOutline]); // Add contentOutline as dependency to detect when it's cleared

  const generateContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const points = await sessionService.generateContent(sessionId);
      setContentPoints(points);
      onContentUpdated(points);
    } catch (err: any) {
      setError(err.message || '生成内容时发生错误');
    } finally {
      setIsLoading(false);
    }
  };


  const handleUpdatePoint = async (pointId: string, title: string | undefined, content: string) => {
    try {
      const updatedPoint = await sessionService.updateContentPoint(sessionId, pointId, title, content);
      const updatedPoints = contentPoints.map(p => p.id === pointId ? updatedPoint : p);
      setContentPoints(updatedPoints);
      onContentUpdated(updatedPoints);
    } catch (err: any) {
      setError(err.message || '更新内容要点时发生错误');
    }
  };

  const handleExpandPoint = async (pointId: string, userInstruction?: string) => {
    setExpandingPointId(pointId);
    setError(null);
    try {
      const expandedPoint = await sessionService.expandPoint(sessionId, pointId, undefined, userInstruction);
      const updatedPoints = contentPoints.map(p => p.id === pointId ? expandedPoint : p);
      setContentPoints(updatedPoints);
      onContentUpdated(updatedPoints);
    } catch (err: any) {
      setError(err.message || '优化内容要点时发生错误');
    } finally {
      setExpandingPointId(null);
    }
  };

  const handleConfirmContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await sessionService.confirmContent(sessionId);
      onContinue();
    } catch (err: any) {
      setError(err.message || '确认内容时发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && contentPoints.length === 0) {
    return <Loading message="正在生成内容要点..." />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-0">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">阶段2：内容创作</h2>
        <p className="text-sm sm:text-base text-gray-600">围绕选择的金句，创作详细的内容要点</p>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">主题：{userInput}</p>
        {selectedHook && (
          <div className="mt-2 sm:mt-3 p-3 sm:p-4 bg-primary-pale border border-primary-light rounded-lg">
            <p className="text-xs sm:text-sm text-primary-dark">
              <strong>已选择的金句：</strong> {selectedHook.text}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage
            message={error}
            onRetry={generateContent}
          />
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 underline"
          >
            关闭
          </button>
        </div>
      )}

      {contentPoints.length > 0 && (
        <>
          <div className="mb-4 flex justify-end">
            <button
              onClick={generateContent}
              disabled={isLoading}
              className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              title="完全重新生成所有内容要点"
            >
              {isLoading ? '生成中...' : '重新生成'}
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            {contentPoints.map((point) => (
              <ContentPointCard
                key={point.id}
                point={point}
                onUpdate={(title, content) => handleUpdatePoint(point.id, title, content)}
                onExpand={(userInstruction) => handleExpandPoint(point.id, userInstruction)}
              />
            ))}
          </div>

          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary-light bg-opacity-10 border border-primary-light rounded-lg">
            <p className="text-xs sm:text-sm text-primary-dark mb-2 sm:mb-3">
              <strong>内容创作完成！</strong> 确认后将继续到脚本转换阶段。
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {onGoBack && (
                <button
                  onClick={onGoBack}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  ← 返回上一阶段
                </button>
              )}
              <button
                onClick={handleConfirmContent}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-primary-light text-white rounded-md hover:bg-primary transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? '确认中...' : '确认内容，继续到脚本转换 →'}
              </button>
            </div>
          </div>
        </>
      )}

      {expandingPointId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg max-w-md w-full">
            <Loading message="正在展开内容要点..." />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentEditor;

