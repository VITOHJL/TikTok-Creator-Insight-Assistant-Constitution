import React from 'react';

interface StageIndicatorProps {
  currentStage: 1 | 2 | 3;
}

const StageIndicator: React.FC<StageIndicatorProps> = ({ currentStage }) => {
  const stages = [
    { number: 1, label: '金句选择', description: '选择吸引人的金句' },
    { number: 2, label: '内容创作', description: '展开详细内容' },
    { number: 3, label: '脚本转换', description: '生成专业脚本' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-4 sm:mb-8">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const isActive = stage.number === currentStage;
          const isCompleted = stage.number < currentStage;
          const isUpcoming = stage.number > currentStage;

          return (
            <React.Fragment key={stage.number}>
              <div className="flex flex-col items-center flex-1">
                {/* Stage Circle */}
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base md:text-lg transition-all ${
                    isActive
                      ? 'bg-primary-dark text-white shadow-lg scale-110'
                      : isCompleted
                      ? 'bg-primary-light text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isCompleted ? '✓' : stage.number}
                </div>
                {/* Stage Label */}
                <div className="mt-1 sm:mt-2 text-center">
                  <div
                    className={`text-xs sm:text-sm md:text-base font-semibold ${
                      isActive ? 'text-primary-dark' : isCompleted ? 'text-primary-light' : 'text-gray-500'
                    }`}
                  >
                    {stage.label}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">{stage.description}</div>
                </div>
              </div>
              {/* Connector Line */}
              {index < stages.length - 1 && (
                <div
                  className={`flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2 transition-all ${
                    isCompleted ? 'bg-primary-light' : 'bg-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StageIndicator;

