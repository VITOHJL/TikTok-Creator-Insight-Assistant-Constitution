import { useState } from 'react';
import { ScriptOutline } from '../services/api';

interface ScriptCardProps {
  script: ScriptOutline;
  index: number;
}

export default function ScriptCard({ script, index }: ScriptCardProps) {
  const [copied, setCopied] = useState(false);
  
  // Check if this is a fallback script (generation failed)
  const isFallback = script.description === '脚本生成遇到问题，请重试';

  const handleCopy = async () => {
    const content = [
      script.title || `脚本方案 ${index + 1}`,
      '',
      `风格：${script.style}`,
      '',
      '要点：',
      ...script.points.map((point, i) => {
        const pointText = typeof point === 'string' ? point : String(point);
        return `${i + 1}. ${pointText}`;
      }),
      '',
      script.description && `说明：${typeof script.description === 'string' ? script.description : String(script.description)}`,
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
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow ${isFallback ? 'border-2 border-yellow-300' : ''}`}>
      {isFallback && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
          ⚠️ 此脚本生成失败，显示为默认模板
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-1">
            {script.title || `脚本方案 ${index + 1}`}
          </h3>
          <span className={`inline-block px-3 py-1 text-sm rounded-full ${
            isFallback 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {script.style}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {copied ? '已复制！' : '一键复制'}
        </button>
      </div>
      
      {script.description && (
        <p className="text-gray-600 mb-4">
          {typeof script.description === 'string' 
            ? script.description 
            : (typeof script.description === 'object' && script.description !== null
              ? JSON.stringify(script.description)
              : String(script.description || ''))}
        </p>
      )}
      
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">脚本要点：</h4>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          {script.points.map((point, i) => (
            <li key={i}>{typeof point === 'string' ? point : String(point)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

