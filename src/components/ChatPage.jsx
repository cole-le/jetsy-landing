import React, { useState, useEffect, useRef } from 'react';
import ProjectSelector from './ProjectSelector';

const ChatPage = ({ onBackToHome }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [showProjectPanel, setShowProjectPanel] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const iframeRef = useRef(null);

  // Load existing chat history when component mounts
  useEffect(() => {
    loadOrRestoreProject();
  }, []);

  // Session-based project tracking
  const getStoredProjectId = () => {
    return localStorage.getItem('jetsy_current_project_id');
  };

  const setStoredProjectId = (projectId) => {
    localStorage.setItem('jetsy_current_project_id', projectId);
  };

  const loadOrRestoreProject = async () => {
    try {
      // First, try to restore from session storage
      const storedProjectId = getStoredProjectId();
      
      if (storedProjectId) {
        // Try to load the stored project
        const response = await fetch(`/api/projects/${storedProjectId}`);
        if (response.ok) {
          const result = await response.json();
          const project = result.project;
          setCurrentProject({
            id: project.id,
            project_name: project.project_name,
            files: JSON.parse(project.files)
          });
          await loadChatMessages(project.id);
          return;
        }
      }

      // If no stored project or it doesn't exist, load the most recent project
      const projectsResponse = await fetch('/api/projects?user_id=1');
      if (projectsResponse.ok) {
        const result = await projectsResponse.json();
        if (result.projects && result.projects.length > 0) {
          const mostRecent = result.projects[0];
          setCurrentProject({
            id: mostRecent.id,
            project_name: mostRecent.project_name,
            files: JSON.parse(mostRecent.files)
          });
          setStoredProjectId(mostRecent.id);
          await loadChatMessages(mostRecent.id);
          return;
        }
      }

      // If no projects exist, create a default one
      await createDefaultProject();
    } catch (error) {
      console.error('Error loading/restoring project:', error);
      // Fallback to creating a default project
      await createDefaultProject();
    }
  };

  const createDefaultProject = async () => {
    try {
      const projectData = {
        project_name: "AI Landing Page Builder",
        user_id: 1,
        files: {
          "src/App.jsx": `import React from 'react';\nimport './index.css';\nfunction App() {\n  return (\n    <div className=\"min-h-screen bg-gray-50\">\n      <div className=\"container mx-auto px-4 py-8\">\n        <h1 className=\"text-4xl font-bold text-center text-gray-900 mb-8\">Welcome to Your Landing Page</h1>\n        <p className=\"text-center text-gray-600 mb-8\">This is a placeholder. Start chatting to customize your landing page!</p>\n      </div>\n    </div>\n  );\n}\nexport default App;`,
          "src/index.css": `@tailwind base;\n@tailwind components;\n@tailwind utilities;`
        }
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        const result = await response.json();
        const newProject = { id: result.project_id, ...projectData };
        setCurrentProject(newProject);
        setStoredProjectId(result.project_id);
        await loadChatMessages(result.project_id);
      }
    } catch (error) {
      console.error('Error creating default project:', error);
    }
  };

  const handleProjectSelect = async (project) => {
    setCurrentProject({
      id: project.id,
      project_name: project.project_name,
      files: typeof project.files === 'string' ? JSON.parse(project.files) : project.files
    });
    setStoredProjectId(project.id);
    await loadChatMessages(project.id);
    setShowProjectPanel(false);
  };

  const handleAllProjectsDeleted = async () => {
    setCurrentProject(null);
    setMessages([]);
    setStoredProjectId(null);
    // Create a new default project
    await createDefaultProject();
  };

  const loadChatMessages = async (projectId) => {
    try {
      const response = await fetch(`/api/chat_messages?project_id=${projectId}`);
      if (response.ok) {
        const result = await response.json();
        setMessages(result.messages || []);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentProject) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      message: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setPreviewLoading(true);
    setPreviewError(null);

    try {
      // 1. Add user message to chat history
      // Check if this is the first message for this project
      const isInitialMessage = messages.length === 0;
      
      await fetch('/api/chat_messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: currentProject.id,
          role: 'user',
          message: inputMessage,
          is_initial_message: isInitialMessage
        })
      });

      // 2. Call LLM orchestration endpoint
      const llmResponse = await fetch('/api/llm-orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: currentProject.id,
          user_message: inputMessage,
          current_files: currentProject.files
        })
      });

      if (llmResponse.ok) {
        const result = await llmResponse.json();
        
        // Check if we need clarification
        if (result.needs_clarification) {
          // Handle clarification response
          const clarificationMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            message: result.message,
            timestamp: new Date().toISOString(),
            clarification_questions: result.clarification_questions,
            current_question: result.current_question,
            current_question_index: result.current_question_index,
            clarification_answers: result.clarification_answers,
            needs_clarification: true
          };
          
          // Store clarification state for tracking the conversation
          const clarificationState = {
            clarificationQuestions: result.clarification_questions,
            currentQuestionIndex: result.current_question_index,
            clarificationAnswers: result.clarification_answers || {}
          };
          
          await fetch('/api/chat_messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_id: currentProject.id,
              role: 'assistant',
              message: result.message,
              clarification_state: JSON.stringify(clarificationState),
              is_initial_message: false
            })
          });
          
          setMessages(prev => [...prev, clarificationMessage]);
          return; // Don't proceed with file updates for clarification
        }
        
        // 3. Update project files if LLM made changes
        if (result.updated_files) {
          await fetch(`/api/projects/${currentProject.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files: result.updated_files })
          });
          setCurrentProject(prev => ({
            ...prev,
            files: result.updated_files
          }));
        }
        // 4. Add assistant response to chat with backup information
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          message: result.assistant_message,
          timestamp: new Date().toISOString(),
          backup_id: result.backup_id,
          can_restore: result.can_restore
        };
        await fetch('/api/chat_messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: currentProject.id,
            role: 'assistant',
            message: result.assistant_message,
            backup_id: result.backup_id,
            is_initial_message: false
          })
        });
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Fallback response if LLM endpoint fails
        const fallbackMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          message: 'I understand you want to create a landing page. I\'ll help you build one step by step. What kind of startup or product are you working on?',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, fallbackMessage]);
      }
    } catch (error) {
      console.error('Error in LLM orchestration:', error);
      // Fallback response on error
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setPreviewLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRestoreWeb = async (backupId) => {
    if (!currentProject?.id) {
      console.error('No current project to restore');
      return;
    }

    try {
      const response = await fetch('/api/restore-web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: currentProject.id,
          backup_id: backupId
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update current project with restored files
        setCurrentProject(prev => ({
          ...prev,
          files: result.files
        }));

        // Refresh the preview
        setPreviewLoading(true);
        
        // Show success message
        alert('Website restored successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to restore website: ${error.error}`);
      }
    } catch (error) {
      console.error('Error restoring website:', error);
      alert('Failed to restore website. Please try again.');
    }
  };

  // --- Live Preview Logic ---
  useEffect(() => {
    // Whenever files change, reload the preview
    if (!currentProject || !currentProject.files) return;
    setPreviewLoading(true);
    setPreviewError(null);
    // Debounce to avoid flicker
    const timeout = setTimeout(() => {
      if (iframeRef.current) {
        const html = generatePreviewHTML();
        iframeRef.current.srcdoc = html;
      }
      setPreviewLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, [currentProject && currentProject.files]);

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'preview-error') {
        setPreviewError(event.data.error);
        setPreviewLoading(false);
      } else if (event.data && event.data.type === 'preview-success') {
        setPreviewError(null);
        setPreviewLoading(false);
        console.log('Preview loaded successfully');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Handle iframe load events
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const handleLoad = () => {
        console.log('Iframe loaded');
        setIsIframeLoaded(true);
      };
      
      iframe.addEventListener('load', handleLoad);
      return () => iframe.removeEventListener('load', handleLoad);
    }
  }, []);

  // Close project selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProjectSelector && !event.target.closest('.project-selector-container')) {
        setShowProjectSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProjectSelector]);

  const generatePreviewHTML = () => {
    if (!currentProject || !currentProject.files) {
      return '<html><body><p>No preview available</p></body></html>';
    }
    // Get the main App component
    let appCode = currentProject.files['src/App.jsx'] || currentProject.files['App.jsx'];
    const cssCode = currentProject.files['src/index.css'] || currentProject.files['index.css'] || '';
    if (!appCode) {
      return '<html><body><p>No App component found</p></body></html>';
    }
    
    // Debug: Log the original code
    console.log('Original App.jsx code:', appCode.substring(0, 500) + '...');
    
    // Process the code to work in the iframe
    let processedCode = appCode
      // Remove all import/export statements
      .replace(/^import .*;?$/gm, '')
      .replace(/^export .*;?$/gm, '')
      .replace(/export (function|class) /g, '$1 ')
      // Fix common JSX issues
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=');
    
    // Debug: Log the processed code
    console.log('Processed App.jsx code:', processedCode.substring(0, 500) + '...');
    
    // The injected script will catch errors and post them to the parent
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Landing Page Preview</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script>
      // Make React hooks available globally
      window.React = React;
      
      // Make hooks available as global functions
      if (React.useState) {
        window.useState = React.useState;
        window.useEffect = React.useEffect;
        window.useRef = React.useRef;
        window.useCallback = React.useCallback;
        window.useMemo = React.useMemo;
        window.useContext = React.useContext;
      }
      
      // Also try alternative access patterns
      if (!window.useState && React['useState']) {
        window.useState = React['useState'];
        window.useEffect = React['useEffect'];
        window.useRef = React['useRef'];
        window.useCallback = React['useCallback'];
        window.useMemo = React['useMemo'];
        window.useContext = React['useContext'];
      }
      
      console.log('React loaded successfully:', typeof React);
      console.log('React hooks available:', {
        useState: typeof React.useState,
        useEffect: typeof React.useEffect,
        useRef: typeof React.useRef
      });
      console.log('Window hooks available:', {
        useState: typeof window.useState,
        useEffect: typeof window.useEffect,
        useRef: typeof window.useRef
      });
    </script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      // Configure Tailwind for production warning suppression
      tailwind.config = {
        theme: {
          extend: {}
        }
      }
    </script>
    <style>
      ${cssCode}
    </style>
    <style>body { margin: 0; }</style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
      try {
        console.log('Starting preview rendering...');
        
        // Make sure React hooks are available in this scope
        const { useState, useEffect, useRef, useCallback, useMemo, useContext } = React;
        
        // Also make them available as global variables for compatibility
        window.useState = useState;
        window.useEffect = useEffect;
        window.useRef = useRef;
        window.useCallback = useCallback;
        window.useMemo = useMemo;
        window.useContext = useContext;
        
        console.log('Hooks available in Babel scope:', {
          useState: typeof useState,
          useEffect: typeof useEffect,
          useRef: typeof useRef
        });
        
        // Process the app code
        console.log('Processing app code...');
        ${processedCode}
        
        // Check if App component was created successfully
        if (typeof App === 'undefined') {
          throw new Error('App component was not defined after processing');
        }
        
        console.log('App component created successfully, rendering...');
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(App));
        console.log('Rendering complete');
        
        // Send success message to parent
        window.parent.postMessage({ type: 'preview-success' }, '*');
      } catch (err) {
        console.error('Preview error:', err);
        window.parent.postMessage({ type: 'preview-error', error: err.message }, '*');
        document.body.innerHTML = '<div style="color:red;padding:2rem;font-family:monospace;">Error: '+err.message+'<br><br>Stack: '+err.stack+'</div>';
      }
    </script>
</body>
</html>`;
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Project Management Panel */}
      {showProjectPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowProjectPanel(false)}>
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Project Management</h2>
                <button
                  onClick={() => setShowProjectPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              <ProjectSelector 
                onProjectSelect={handleProjectSelect}
                currentProjectId={currentProject?.id}
                onAllProjectsDeleted={handleAllProjectsDeleted}
              />
            </div>
          </div>
        </div>
      )}

      {/* Two-pane layout */}
      <div className="flex h-screen pt-16">
        {/* Left pane - Chat interface */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          {/* Project Info Bar */}
          {currentProject && (
            <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-900">{currentProject.project_name}</span>
                </div>
                <button
                  onClick={() => setShowProjectPanel(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Switch Project
                </button>
              </div>
            </div>
          )}
          
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Start building your landing page</h3>
                <p className="text-sm">Describe your startup idea and I'll help you create a professional landing page.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    
                    {/* Display current clarification question if present */}
                    {message.needs_clarification && message.current_question && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                          <div className="font-medium text-blue-700 mb-1">
                            Question {message.current_question_index + 1} of {message.clarification_questions?.length || '?'}
                          </div>
                          <div>{message.current_question.question}</div>
                        </div>
                      </div>
                    )}
                    
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  {/* Restore Web Button for Assistant Messages */}
                  {message.role === 'assistant' && message.backup_id && (
                    <div className="mt-2">
                      <button
                        onClick={() => handleRestoreWeb(message.backup_id)}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-800 transition-colors"
                        title="Restore website to this version"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Restore Web
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your startup idea or ask me to modify the landing page..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right pane - Live preview */}
        <div className="w-2/3 bg-white flex flex-col relative">

          {/* Preview iframe */}
          <div className="flex-1 relative">
            {previewLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span className="text-blue-600 font-medium">Updating preview...</span>
                </div>
              </div>
            )}
            {previewError && (
              <div className="absolute inset-0 bg-red-50 bg-opacity-90 flex items-center justify-center z-20">
                <div className="text-red-700 font-mono text-sm p-4 border border-red-300 rounded-lg bg-white shadow">
                  <strong>Preview Error:</strong><br />
                  {previewError}
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              key={`preview-${currentProject?.id}-${currentProject?.files ? JSON.stringify(currentProject.files).length : 0}`}
              title="Landing Page Preview"
              className="w-full h-full"
              sandbox="allow-scripts allow-same-origin allow-forms"
              style={{ background: 'white' }}
              onLoad={() => {
                console.log('Iframe loaded successfully');
                setPreviewLoading(false);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 