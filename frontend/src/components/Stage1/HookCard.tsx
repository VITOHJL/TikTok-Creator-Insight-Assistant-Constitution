import React from 'react';
import type { Hook } from '../../types/session.js';

interface HookCardProps {
  hook: Hook;
  isSelected: boolean;
  onSelect: () => void;
  onRefine: () => void;
  onEdit: (text: string) => void;
  onOptimizeAfterEdit?: (text: string) => void;
}

const HookCard: React.FC<HookCardProps> = ({
  hook,
  isSelected,
  onSelect,
  onRefine,
  onEdit,
  onOptimizeAfterEdit,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedText, setEditedText] = React.useState(hook.text);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedText(hook.text);
  };

  const handleSave = () => {
    onEdit(editedText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedText(hook.text);
    setIsEditing(false);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 sm:p-6 border-2 transition-all ${
        isSelected
          ? 'border-primary-dark bg-primary-pale'
          : 'border-gray-200 hover:border-primary-light hover:shadow-lg'
      }`}
    >
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm sm:text-base"
            rows={3}
            placeholder="编辑金句..."
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleSave}
              className="px-3 sm:px-4 py-2 bg-primary-dark text-white rounded-md hover:bg-primary transition-colors text-sm sm:text-base"
            >
              保存
            </button>
            {onOptimizeAfterEdit && editedText !== hook.text && (
              <button
                onClick={() => {
                  handleSave();
                  onOptimizeAfterEdit(editedText);
                }}
                className="px-3 sm:px-4 py-2 bg-primary-light bg-opacity-20 text-primary-light rounded-md hover:bg-primary-light hover:bg-opacity-30 transition-colors text-sm sm:text-base"
              >
                保存并优化
              </button>
            )}
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
          <div className="mb-3 sm:mb-4">
            <p className="text-base sm:text-lg font-medium text-gray-800 leading-relaxed">
              {hook.text}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            <button
              onClick={onSelect}
              className={`px-3 sm:px-4 py-2 rounded-md transition-colors text-sm sm:text-base ${
                isSelected
                  ? 'bg-primary-dark text-white hover:bg-primary'
                  : 'bg-primary-pale text-primary-dark hover:bg-primary-light hover:text-white'
              }`}
            >
              {isSelected ? '✓ 已选择' : '选择此金句'}
            </button>
            <button
              onClick={onRefine}
              className="px-3 sm:px-4 py-2 bg-primary-light bg-opacity-20 text-primary-light rounded-md hover:bg-primary-light hover:bg-opacity-30 transition-colors text-sm sm:text-base"
            >
              微调
            </button>
            <button
              onClick={handleEdit}
              className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm sm:text-base"
            >
              编辑
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default HookCard;

