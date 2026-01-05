import React from 'react';
import type { ContentPoint } from '../../types/session.js';

interface ContentPointCardProps {
  point: ContentPoint;
  onUpdate: (title: string | undefined, content: string) => void;
  onExpand: (userInstruction?: string) => void;
}

const ContentPointCard: React.FC<ContentPointCardProps> = ({
  point,
  onUpdate,
  onExpand,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedTitle, setEditedTitle] = React.useState(point.title || '');
  const [editedContent, setEditedContent] = React.useState(point.content);
  const [showOptimizeDialog, setShowOptimizeDialog] = React.useState(false);
  const [userInstruction, setUserInstruction] = React.useState('');

  const handleEdit = () => {
    setIsEditing(true);
    setEditedTitle(point.title || '');
    setEditedContent(point.content);
  };

  const handleSave = () => {
    onUpdate(editedTitle.trim() || undefined, editedContent.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(point.title || '');
    setEditedContent(point.content);
    setIsEditing(false);
  };

  const handleOptimize = () => {
    setShowOptimizeDialog(true);
  };

  const handleOptimizeConfirm = () => {
    const instruction = userInstruction.trim();
    onExpand(instruction.length > 0 ? instruction : undefined);
    setShowOptimizeDialog(false);
    setUserInstruction('');
  };

  const handleOptimizeCancel = () => {
    setShowOptimizeDialog(false);
    setUserInstruction('');
  };

  const handleExpandDefault = () => {
    onExpand(); // No instruction, default expand
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all">
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              标题（可选）
            </label>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
              placeholder="输入标题..."
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              内容
            </label>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm sm:text-base"
              rows={6}
              placeholder="输入详细内容..."
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleSave}
              className="px-3 sm:px-4 py-2 bg-primary-dark text-white rounded-md hover:bg-primary transition-colors text-sm sm:text-base"
            >
              保存
            </button>
            <button
              onClick={handleCancel}
              className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm sm:text-base"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <>
          {point.title && (
            <div className="mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                {point.title}
              </h3>
            </div>
          )}
          <div className="mb-4">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
              {point.content}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            <button
              onClick={handleEdit}
              className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm sm:text-base"
            >
              编辑
            </button>
            <button
              onClick={handleOptimize}
              className="px-3 sm:px-4 py-2 bg-primary bg-opacity-20 text-primary-dark rounded-md hover:bg-primary hover:text-white transition-colors text-sm sm:text-base"
            >
              优化此要点
            </button>
            <button
              onClick={handleExpandDefault}
              className="px-3 sm:px-4 py-2 bg-primary-light bg-opacity-20 text-primary-light rounded-md hover:bg-primary-light hover:text-white transition-colors text-sm sm:text-base"
            >
              进一步拓展
            </button>
          </div>
        </>
      )}

      {/* Optimize Dialog */}
      {showOptimizeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">优化此要点</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              输入您的优化指示（可选）。如果不输入，将默认进一步拓展内容。
            </p>
            <textarea
              value={userInstruction}
              onChange={(e) => setUserInstruction(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-3 sm:mb-4 text-sm sm:text-base"
              rows={4}
              placeholder="例如：增加更多情感描述、添加具体场景细节、让语言更生动..."
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                onClick={handleOptimizeCancel}
                className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm sm:text-base"
              >
                取消
              </button>
              <button
                onClick={handleOptimizeConfirm}
                className="px-3 sm:px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors text-sm sm:text-base"
              >
                {userInstruction.trim().length > 0 ? '按指示优化' : '默认拓展'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentPointCard;

