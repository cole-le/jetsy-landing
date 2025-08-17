import React from 'react';

const WorkflowProgressBar = ({ currentStage = 1, onStageClick }) => {
  const stages = [
    { id: 1, name: 'Website creation', icon: '🌐' },
    { id: 2, name: 'Ads creation', icon: '📢' },
    { id: 3, name: 'Launch and monitor', icon: '🚀' }
  ];

  const handleStageClick = (stageId) => {
    if (onStageClick) {
      // Use the provided callback if available
      onStageClick(stageId);
    } else if (stageId === 1) {
      // Website creation - refresh the current chat page (fallback)
      window.location.reload();
    } else {
      // Ads creation and Launch and monitor - go to # for now (fallback)
      window.location.href = '#';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {stages.map((stage, index) => (
        <div key={stage.id} className="flex items-center">
          {/* Stage indicator */}
          <div className="flex items-center">
            <button
              onClick={() => handleStageClick(stage.id)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 cursor-pointer hover:scale-105 ${
                stage.id <= currentStage
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
              }`}
            >
              {stage.id < currentStage ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span>{stage.icon}</span>
              )}
            </button>
            
            {/* Stage name */}
            <button
              onClick={() => handleStageClick(stage.id)}
              className={`ml-2 text-xs font-medium transition-colors duration-200 cursor-pointer hover:underline ${
                stage.id <= currentStage
                  ? 'text-blue-600 hover:text-blue-700'
                  : 'text-gray-500 hover:text-gray-600'
              }`}
            >
              {stage.name}
            </button>
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
