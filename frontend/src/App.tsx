import { useState } from 'react';
import Input from './components/Input';
import ErrorMessage from './components/ErrorMessage';
import Loading from './components/Loading';
import ScriptCard from './components/ScriptCard';
import HashtagCard from './components/HashtagCard';
import MusicCard from './components/MusicCard';
import { api, GenerateResponse, ScriptOutline, HashtagSuggestion, MusicStyleSuggestion } from './services/api';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scripts, setScripts] = useState<ScriptOutline[]>([]);
  const [hashtags, setHashtags] = useState<HashtagSuggestion[]>([]);
  const [musicStyle, setMusicStyle] = useState<MusicStyleSuggestion | null>(null);

  const handleSubmit = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    setScripts([]);
    setHashtags([]);
    setMusicStyle(null);
    
    try {
      const response: GenerateResponse = await api.generate(prompt);
      
      if (response.success && response.data) {
        setScripts(response.data.scripts);
        setHashtags(response.data.hashtags);
        setMusicStyle(response.data.musicStyle);
      } else {
        setError(response.error?.message || '生成失败，请稍后重试');
      }
    } catch (err: any) {
      if (err.response) {
        const errorData = err.response.data;
        setError(errorData?.error?.message || '请求失败，请稍后重试');
      } else if (err.request) {
        setError('网络连接失败，请检查网络');
      } else {
        setError('未知错误，请稍后重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          TikTok Creator Insight Assistant
        </h1>
        <p className="text-center text-gray-600 mb-8">
          帮助短视频创作者将创意意图转化为结构化脚本大纲与趋势洞察
        </p>
        
        <Input onSubmit={handleSubmit} isLoading={isLoading} />
        
        {isLoading && <Loading />}
        
        {error && (
          <div className="mt-4">
            <ErrorMessage message={error} onRetry={handleRetry} />
          </div>
        )}
        
        {scripts.length > 0 && (
          <div className="mt-8 space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800">生成的脚本方案</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scripts.map((script, index) => {
                  // Ensure script has required fields
                  if (!script || !script.points || !Array.isArray(script.points)) {
                    console.warn(`Script at index ${index} is invalid:`, script);
                    return null;
                  }
                  return (
                    <ScriptCard 
                      key={`script-${index}-${script.style}`} 
                      script={script} 
                      index={index} 
                    />
                  );
                }).filter(Boolean)}
              </div>
            </div>
            
            {hashtags.length > 0 && (
              <div>
                <HashtagCard hashtags={hashtags} />
              </div>
            )}
            
            {musicStyle && (
              <div>
                <MusicCard musicStyle={musicStyle} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
