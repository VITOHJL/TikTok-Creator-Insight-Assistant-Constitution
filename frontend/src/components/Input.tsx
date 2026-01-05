import { useState } from 'react';
import ErrorMessage from './ErrorMessage';

interface InputProps {
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
}

export default function Input({ onSubmit, isLoading = false }: InputProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateInput = (input: string): string | null => {
    const trimmed = input.trim();
    
    if (trimmed.length === 0) {
      return '输入不能为空';
    }
    
    if (trimmed.length > 500) {
      return '输入过长，请控制在500字符以内';
    }
    
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validationError = validateInput(text);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    onSubmit(text.trim());
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-0">
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <label 
            htmlFor="prompt" 
            className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
          >
            输入创作主题或目标赛道
          </label>
          <textarea
            id="prompt"
            value={text}
            onChange={handleChange}
            placeholder="例如：美食探店、旅行vlog、美妆教程..."
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm sm:text-base"
            rows={4}
            disabled={isLoading}
            maxLength={500}
          />
          <div className="mt-1 text-xs sm:text-sm text-gray-500 text-right">
            {text.length}/500
          </div>
        </div>
        
        {error && <ErrorMessage message={error} />}
        
        <button
          type="submit"
          disabled={isLoading || text.trim().length === 0}
          className="w-full bg-primary-dark text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:bg-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
        >
          {isLoading ? '创建中...' : '开始创作'}
        </button>
      </form>
    </div>
  );
}

