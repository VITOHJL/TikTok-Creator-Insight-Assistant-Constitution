import { MusicStyleSuggestion } from '../services/api';

interface MusicCardProps {
  musicStyle: MusicStyleSuggestion;
}

export default function MusicCard({ musicStyle }: MusicCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">背景音乐建议</h3>
      
      <div className="space-y-3">
        <div>
          <span className="text-sm font-medium text-gray-600">音乐风格：</span>
          <p className="text-lg text-gray-800 mt-1">{typeof musicStyle.style === 'string' ? musicStyle.style : String(musicStyle.style || '')}</p>
        </div>
        
        {musicStyle.mood && (
          <div>
            <span className="text-sm font-medium text-gray-600">情绪：</span>
            <p className="text-gray-700 mt-1">{typeof musicStyle.mood === 'string' ? musicStyle.mood : String(musicStyle.mood || '')}</p>
          </div>
        )}
        
        {musicStyle.tempo && (
          <div>
            <span className="text-sm font-medium text-gray-600">节奏：</span>
            <p className="text-gray-700 mt-1">{typeof musicStyle.tempo === 'string' ? musicStyle.tempo : String(musicStyle.tempo || '')}</p>
          </div>
        )}
        
        {musicStyle.scene && (
          <div>
            <span className="text-sm font-medium text-gray-600">适用场景：</span>
            <p className="text-gray-700 mt-1">{typeof musicStyle.scene === 'string' ? musicStyle.scene : String(musicStyle.scene || '')}</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500">
          💡 提示：此建议为文字描述，不包含实际音频文件
        </p>
      </div>
    </div>
  );
}

