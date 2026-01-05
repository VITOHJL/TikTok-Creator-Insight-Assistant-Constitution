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
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Hashtag 建议</h3>
        <button
          onClick={handleCopy}
          className="px-3 sm:px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-primary transition-colors text-xs sm:text-sm font-medium self-start sm:self-auto"
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
              className="inline-block px-2 sm:px-3 py-1 bg-primary-pale text-primary-dark rounded-full text-xs sm:text-sm font-medium hover:bg-primary-light hover:text-white transition-colors cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(`#${hashtagText}`);
              }}
            >
              #{hashtagText}
            </span>
          );
        })}
      </div>
      
      <p className="mt-4 text-xs sm:text-sm text-gray-500">
        共 {hashtags.length} 个Hashtag标签
      </p>
    </div>
  );
}

