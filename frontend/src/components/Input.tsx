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
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="prompt" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            输入创作主题或目标赛道
          </label>
          <textarea
            id="prompt"
            value={text}
            onChange={handleChange}
            placeholder="例如：美食探店、旅行vlog、美妆教程..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            disabled={isLoading}
            maxLength={500}
          />
          <div className="mt-1 text-sm text-gray-500 text-right">
            {text.length}/500
          </div>
        </div>
        
        {error && <ErrorMessage message={error} />}
        
        <button
          type="submit"
          disabled={isLoading || text.trim().length === 0}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '生成中...' : '生成脚本'}
        </button>
      </form>
    </div>
  );
}

