import { useState } from 'react';
import type { ScriptOutline } from '../types/session.js';

interface ScriptCardProps {
  script: ScriptOutline;
  index: number;
  onRefine?: () => void;
}

export default function ScriptCard({ script, index, onRefine }: ScriptCardProps) {
  const [copied, setCopied] = useState(false);
  
  // Check if this is a fallback script (generation failed)
  const isFallback = script.description === '脚本生成遇到问题，请重试';
  
  // Get style display name
  const getStyleName = (style: string) => {
    const styleMap: Record<string, string> = {
      story: '故事叙述型',
      tutorial: '教程教学型',
      comparison: '对比评测型',
    };
    return styleMap[style] || style;
  };

  const handleCopy = async () => {
    const content = [
      script.title || `脚本方案 ${index + 1}`,
      '',
      `风格：${getStyleName(script.style)}`,
      '',
      '要点：',
      ...script.points.map((point, i) => {
        const pointText = typeof point === 'string' ? point : String(point);
        return `${i + 1}. ${pointText}`;
      }),
      '',
      script.description && `说明：${typeof script.description === 'string' ? script.description : String(script.description)}`,
      '',
      script.emotionalAnchors && script.emotionalAnchors.length > 0 && '情绪锚点：',
      script.emotionalAnchors && script.emotionalAnchors.map((anchor, i) => `  ${i + 1}. ${anchor}`).join('\n'),
      '',
      script.memoryPoints && script.memoryPoints.length > 0 && '记忆点：',
      script.memoryPoints && script.memoryPoints.map((point, i) => `  ${i + 1}. ${point}`).join('\n'),
      '',
      script.conflictDesign && `冲突设计：${script.conflictDesign}`,
      '',
      script.informationDensity && `信息密度：${script.informationDensity}`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow ${isFallback ? 'border-2 border-yellow-300' : ''}`}>
      {isFallback && (
        <div className="mb-3 p-2 bg-primary-light bg-opacity-10 border border-primary-light rounded text-primary-light text-xs sm:text-sm">
          ⚠️ 此脚本生成失败，显示为默认模板
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-1">
            {script.title || `脚本方案 ${index + 1}`}
          </h3>
          <span className={`inline-block px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full ${
            isFallback 
              ? 'bg-primary-light bg-opacity-20 text-primary-light' 
              : 'bg-primary-pale text-primary-dark'
          }`}>
            {getStyleName(script.style)}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {onRefine && (
            <button
              onClick={onRefine}
              className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-xs sm:text-sm font-medium"
            >
              优化此脚本
            </button>
          )}
          <button
            onClick={handleCopy}
            className="px-3 sm:px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-primary transition-colors text-xs sm:text-sm font-medium"
          >
            {copied ? '已复制！' : '一键复制'}
          </button>
        </div>
      </div>
      
      {script.description && (
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          {typeof script.description === 'string' 
            ? script.description 
            : (typeof script.description === 'object' && script.description !== null
              ? JSON.stringify(script.description)
              : String(script.description || ''))}
        </p>
      )}
      
      <div className="space-y-2 mb-4">
        <h4 className="font-medium text-gray-700 text-sm sm:text-base">脚本要点：</h4>
        <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-gray-600">
          {script.points.map((point, i) => (
            <li key={i}>{typeof point === 'string' ? point : String(point)}</li>
          ))}
        </ul>
      </div>

      {/* Professional Elements */}
      {(script.emotionalAnchors?.length > 0 || 
        script.memoryPoints?.length > 0 || 
        script.conflictDesign || 
        script.informationDensity) && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
          <h4 className="font-medium text-gray-700 text-xs sm:text-sm">专业元素：</h4>
          
          {script.emotionalAnchors && script.emotionalAnchors.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-purple-600">情绪锚点：</span>
              <ul className="mt-1 space-y-1">
                {script.emotionalAnchors.map((anchor, i) => (
                  <li key={i} className="text-xs sm:text-sm text-gray-600">• {anchor}</li>
                ))}
              </ul>
            </div>
          )}

          {script.memoryPoints && script.memoryPoints.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-green-600">记忆点：</span>
              <ul className="mt-1 space-y-1">
                {script.memoryPoints.map((point, i) => (
                  <li key={i} className="text-xs sm:text-sm text-gray-600">• {point}</li>
                ))}
              </ul>
            </div>
          )}

          {script.conflictDesign && (
            <div>
              <span className="text-xs font-semibold text-orange-600">冲突设计：</span>
              <p className="mt-1 text-xs sm:text-sm text-gray-600">{script.conflictDesign}</p>
            </div>
          )}

          {script.informationDensity && (
            <div>
              <span className="text-xs font-semibold text-blue-600">信息密度：</span>
              <p className="mt-1 text-xs sm:text-sm text-gray-600">{script.informationDensity}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

