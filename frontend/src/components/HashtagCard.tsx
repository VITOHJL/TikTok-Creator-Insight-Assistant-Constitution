import { useState } from 'react';
import { HashtagSuggestion } from '../services/api';

interface HashtagCardProps {
  hashtags: HashtagSuggestion[];
}

export default function HashtagCard({ hashtags }: HashtagCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const content = hashtags.map(h => {
      const text = typeof h.text === 'string' ? h.text : String(h.text || '');
      return `#${text}`;
    }).join(' ');
    
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Hashtag 建议</h3>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          {copied ? '已复制！' : '一键复制'}
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {hashtags.map((hashtag, index) => {
          const hashtagText = typeof hashtag.text === 'string' ? hashtag.text : String(hashtag.text || '');
          return (
            <span
              key={index}
              className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(`#${hashtagText}`);
              }}
            >
              #{hashtagText}
            </span>
          );
        })}
      </div>
      
      <p className="mt-4 text-sm text-gray-500">
        共 {hashtags.length} 个Hashtag标签
      </p>
    </div>
  );
}

