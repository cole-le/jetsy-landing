import React from 'react';

const WorkflowProgressBar = ({ currentStage = 1, onStageClick, projectId, pulseStageId }) => {
  const stages = [
    { id: 1, name: 'Website creation', icon: '🌐' },
    { id: 2, name: 'Ads creation', icon: '📢' },
    { id: 3, name: 'Launch and monitor', icon: '🚀' }
  ];

  const getHref = (stageId) => {
    if (!projectId) return '#';
    if (stageId === 1) return `/chat/${projectId}`;
    if (stageId === 2) return `/ad-creatives/${projectId}`;
    if (stageId === 3) return `/data_analytics/project_${projectId}`;
    return '#';
  };

  const handleStageClick = (stageId) => {
    if (onStageClick) {
      onStageClick(stageId);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {stages.map((stage, index) => (
        <div key={stage.id} className="flex items-center">
          {/* Stage indicator */}
          <div className="flex items-center">
            <div className="relative">
              {pulseStageId === stage.id && (
                <span className="absolute -inset-1 rounded-full border border-blue-400/60 animate-ping" />
              )}
              <a
                href={getHref(stage.id)}
                onClick={() => handleStageClick(stage.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 cursor-pointer hover:scale-105 shadow-sm ${
                  stage.id <= currentStage
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300 shadow-md'
                }`}
                title={stage.name}
              >
                <span>{stage.icon}</span>
              </a>
            </div>
            
            {/* Stage name with button-like styling */}
            <a
              href={getHref(stage.id)}
              onClick={() => handleStageClick(stage.id)}
              className={`ml-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer hover:scale-105 shadow-sm ${
                stage.id <= currentStage
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border border-blue-200 hover:border-blue-300'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {stage.name}
            </a>
          </div>
          
          {/* Connector line */}
          {index < stages.length - 1 && (
            <div
              className={`w-8 h-0.5 mx-2 transition-colors duration-200 ${
                stage.id < currentStage ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default WorkflowProgressBar;
