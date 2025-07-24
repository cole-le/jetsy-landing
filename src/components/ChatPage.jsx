import React, { useState, useEffect, useRef } from 'react';

const ChatPage = ({ onBackToHome }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const iframeRef = useRef(null);

  // Load existing chat history when component mounts
  useEffect(() => {
    loadOrCreateProject();
  }, []);

  const loadOrCreateProject = async () => {
    try {
      // For now, create a new project if none exists
      const projectData = {
        project_name: "AI Landing Page Builder",
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
        setCurrentProject({ id: result.project_id, ...projectData });
        await loadChatMessages(result.project_id);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
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
      await fetch('/api/chat_messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: currentProject.id,
          role: 'user',
          message: inputMessage
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
        // 4. Add assistant response to chat
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          message: result.assistant_message,
          timestamp: new Date().toISOString()
        };
        await fetch('/api/chat_messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: currentProject.id,
            role: 'assistant',
            message: result.assistant_message
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

  // Listen for error messages from the iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'preview-error') {
        setPreviewError(event.data.error);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
    // Remove all import/export lines and export keywords before function/class
    appCode = appCode
      .replace(/^import .*;?$/gm, '')
      .replace(/^export .*;?$/gm, '')
      .replace(/export (function|class) /g, '$1 ');
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
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      ${cssCode}
    </style>
    <style>body { margin: 0; }</style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
      try {
        ${appCode}
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(App));
      } catch (err) {
        window.parent.postMessage({ type: 'preview-error', error: err.message }, '*');
        document.body.innerHTML = '<div style="color:red;padding:2rem;font-family:monospace;">'+err.message+'</div>';
      }
    </script>
</body>
</html>`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToHome}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-900">AI Landing Page Builder</h1>
          </div>
          <div className="text-sm text-gray-500">
            {currentProject ? `Project: ${currentProject.project_name}` : 'No project loaded'}
          </div>
        </div>
      </div>

      {/* Two-pane layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left pane - Chat interface */}
        <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
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
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
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
        <div className="w-1/2 bg-white flex flex-col relative">
          {/* Preview header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
            <p className="text-sm text-gray-500">Your landing page will appear here as you chat</p>
          </div>

          {/* Preview iframe */}
          <div className="flex-1 p-6 relative">
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
            <div className="w-full h-full border border-gray-200 rounded-lg overflow-hidden bg-white">
              <iframe
                ref={iframeRef}
                title="Landing Page Preview"
                className="w-full h-full min-h-[400px]"
                sandbox="allow-scripts allow-same-origin"
                style={{ background: 'white' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 